from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from collections import defaultdict
import re
import json
import asyncio

load_dotenv()

from chains.generate import generate_chain
from chains.refine import refine_chain

app = FastAPI(title="RapidSketch API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session history: session_id -> list of {role, content}
session_history: dict[str, list[dict]] = defaultdict(list)


# ── Request models ──────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    prompt: str
    session_id: str = "default"


class RefineRequest(BaseModel):
    instruction: str
    files: list[dict]
    session_id: str = "default"


# ── Helpers ─────────────────────────────────────────────────────────────────

def parse_response(response: str) -> list[dict]:
    """Parse LLM markdown response into structured file objects."""
    file_map = {}

    # Primary: **filename** followed by fenced code block
    pattern = r'\*\*([a-zA-Z0-9_.-]+)\*\*\s*```(?:\w*\s*)([\s\S]*?)```'
    for filename, code in re.findall(pattern, response):
        filename, code = filename.strip(), code.strip()
        if filename.endswith(('.jsx', '.css', '.js', '.tsx')) and code:
            file_map[filename] = {"name": filename, "content": code, "type": "file"}

    # Fallback: language-hinted code blocks
    if not file_map:
        lang_map = {"jsx": "App.jsx", "css": "styles.css", "javascript": "App.jsx", "js": "App.jsx"}
        for lang, code in re.findall(r'```(jsx|css|javascript|js|tsx)\s*([\s\S]*?)```', response, re.IGNORECASE):
            filename = lang_map.get(lang.lower())
            if filename and code.strip():
                file_map[filename] = {"name": filename, "content": code.strip(), "type": "file"}

    # Ensure App.jsx always present
    if "App.jsx" not in file_map and file_map:
        file_map["App.jsx"] = {
            "name": "App.jsx",
            "content": "import './styles.css';\n\nexport default function App() {\n  return <div>Generated App</div>;\n}",
            "type": "file"
        }

    return list(file_map.values())


async def stream_chain(chain_input: dict, chain, session_id: str, user_message: str):
    """Stream LLM tokens via SSE, then parse and emit final files."""
    full_response = ""

    try:
        async for chunk in chain.astream(chain_input):
            full_response += chunk
            # Send raw token chunk to frontend
            yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"

        # Parse files from complete response
        files = parse_response(full_response)

        if not files:
            yield f"data: {json.dumps({'type': 'error', 'message': 'Failed to parse generated files'})}\n\n"
            return

        # Persist to session memory
        session_history[session_id].append({"role": "user", "content": user_message})
        session_history[session_id].append({"role": "assistant", "content": full_response})

        # Keep last 10 turns to avoid context bloat
        if len(session_history[session_id]) > 20:
            session_history[session_id] = session_history[session_id][-20:]

        # Emit final structured files
        yield f"data: {json.dumps({'type': 'files', 'files': files})}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"


# ── Routes ───────────────────────────────────────────────────────────────────

@app.post("/api/generate")
async def generate(req: GenerateRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")

    return StreamingResponse(
        stream_chain(
            chain_input={"prompt": req.prompt},
            chain=generate_chain,
            session_id=req.session_id,
            user_message=req.prompt,
        ),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/refine")
async def refine(req: RefineRequest):
    if not req.instruction.strip():
        raise HTTPException(status_code=400, detail="Instruction is required")

    files_by_name = {f["name"]: f["content"] for f in req.files}

    return StreamingResponse(
        stream_chain(
            chain_input={
                "instruction": req.instruction,
                "app_jsx": files_by_name.get("App.jsx", ""),
                "styles_css": files_by_name.get("styles.css", ""),
            },
            chain=refine_chain,
            session_id=req.session_id,
            user_message=req.instruction,
        ),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/history/{session_id}")
async def get_history(session_id: str):
    return {"session_id": session_id, "turns": len(session_history[session_id]) // 2, "history": session_history[session_id]}


@app.delete("/api/history/{session_id}")
async def clear_history(session_id: str):
    session_history.pop(session_id, None)
    return {"status": "cleared"}


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}
