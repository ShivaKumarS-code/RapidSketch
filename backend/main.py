import os
import re
import json
import asyncio
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
import jwt
from jwt import PyJWKClient

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

# ── Supabase Client Setup ─────────────────────────────────────────────────────

supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "")

jwks_client: PyJWKClient = None
if supabase_url and "your-" not in supabase_url:
    try:
        jwks_url = f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
        jwks_client = PyJWKClient(jwks_url)
    except Exception as e:
        print("Failed to initialize JWKS client:", e)

supabase_client: Client = None
is_supabase_configured = False

if supabase_url and supabase_key and "your-" not in supabase_url and "your-" not in supabase_key:
    try:
        supabase_client = create_client(supabase_url, supabase_key)
        is_supabase_configured = True
        print("Supabase client initialized successfully.")
    except Exception as e:
        print("Error initializing Supabase client:", e)
else:
    print("WARNING: Supabase is not configured. Session persistence will fallback to in-memory mode.")

# In-memory fallback session history: session_id -> list of {role, content}
session_history: dict[str, list[dict]] = defaultdict(list)


# ── Request models ──────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    prompt: str
    session_id: str = "default"
    project_id: str | None = None


class RefineRequest(BaseModel):
    instruction: str
    files: list[dict]
    session_id: str = "default"
    project_id: str | None = None


# ── Helpers ─────────────────────────────────────────────────────────────────

def get_user_id_from_header(authorization: str) -> str | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    
    # Debug bypass for testing/development
    if token == "debug-token":
        return "00000000-0000-0000-0000-000000000000"
        
    if not supabase_jwt_secret or "your-" in supabase_jwt_secret:
        return None
        
    unverified_header = {}
    unverified_payload = {}
    try:
        unverified_header = jwt.get_unverified_header(token)
        # Decode without verification to inspect claims for error logging
        unverified_payload = jwt.decode(token, options={"verify_signature": False})
    except Exception as inspect_err:
        raise HTTPException(
            status_code=401,
            detail=f"JWT failed to decode unverified: {inspect_err}"
        )

    alg = unverified_header.get("alg")
    aud = unverified_payload.get("aud")
    iss = unverified_payload.get("iss")
    
    try:
        if alg == "HS256":
            # Symmetric verification using local secret
            try:
                payload = jwt.decode(token, supabase_jwt_secret, algorithms=["HS256"], options={"verify_aud": False})
            except Exception as raw_err:
                try:
                    import base64
                    padded_secret = supabase_jwt_secret + "=" * (-len(supabase_jwt_secret) % 4)
                    decoded_secret = base64.b64decode(padded_secret)
                    payload = jwt.decode(token, decoded_secret, algorithms=["HS256"], options={"verify_aud": False})
                except Exception as b64_err:
                    raise HTTPException(
                        status_code=401,
                        detail=f"JWT symmetric decode failed. Alg: {alg}, Aud: {aud}, Iss: {iss}. Raw err: {raw_err}; B64 err: {b64_err}"
                    )
        else:
            # Asymmetric verification using JWKS client
            if not jwks_client:
                raise Exception("JWKS client not initialized for asymmetric token verification")
            try:
                signing_key = jwks_client.get_signing_key_from_jwt(token)
                payload = jwt.decode(token, signing_key.key, algorithms=[alg], options={"verify_aud": False})
            except Exception as jwks_err:
                raise HTTPException(
                    status_code=401,
                    detail=f"JWT asymmetric decode failed. Alg: {alg}, Aud: {aud}, Iss: {iss}. JWKS err: {jwks_err}"
                )
            
        return payload.get("sub")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"JWT parse/validation error. Alg: {alg}, Aud: {aud}, Iss: {iss}. Error: {e}"
        )


def parse_response(response: str) -> list[dict]:
    """Parse LLM markdown response into structured file objects."""
    file_map = {}

    # Primary: **filename** followed by fenced code block. Support directories with slashes.
    pattern = r'\*\*([a-zA-Z0-9_./-]+)\*\*\s*```(?:\w*\s*)([\s\S]*?)```'
    for filename, code in re.findall(pattern, response):
        filename, code = filename.strip(), code.strip()
        if filename.endswith(('.jsx', '.css', '.js', '.tsx', '.json', '.html', '.svg', '.ts')) and code:
            file_map[filename] = {"name": filename, "content": code, "type": "file"}

    # Fallback: language-hinted code blocks
    if not file_map:
        lang_map = {"jsx": "src/App.jsx", "css": "src/index.css", "javascript": "src/App.jsx", "js": "src/App.jsx"}
        for lang, code in re.findall(r'```(jsx|css|javascript|js|tsx)\s*([\s\S]*?)```', response, re.IGNORECASE):
            filename = lang_map.get(lang.lower())
            if filename and code.strip():
                file_map[filename] = {"name": filename, "content": code.strip(), "type": "file"}

    # Ensure App entry exists
    if not any(k in file_map for k in ["App.jsx", "src/App.jsx", "src/main.jsx", "src/index.jsx"]) and file_map:
        default_name = "src/App.jsx"
        file_map[default_name] = {
            "name": default_name,
            "content": "export default function App() {\n  return <div className=\"p-8 text-center text-white\">Generated App</div>;\n}",
            "type": "file"
        }

    return list(file_map.values())


# ── DB persistence helpers ────────────────────────────────────────────────────

def create_initial_project(user_id: str, title: str) -> str | None:
    if not is_supabase_configured:
        return "local-project"
    try:
        res = supabase_client.table("projects").insert({
            "user_id": user_id,
            "title": title,
            "files": []
        }).execute()
        if res.data:
            return res.data[0]["id"]
    except Exception as e:
        print("Error creating project in DB:", e)
    return None


def save_project_files_and_title(user_id: str, project_id: str, files: list[dict], title: str = None):
    if not is_supabase_configured or project_id == "local-project":
        return
    try:
        data = {"files": files}
        if title:
            data["title"] = title
        supabase_client.table("projects").update(data).eq("id", project_id).eq("user_id", user_id).execute()
    except Exception as e:
        print("Error saving project files in DB:", e)


def save_db_chat_message(project_id: str, sender: str, text: str, timestamp: str):
    if not is_supabase_configured or project_id == "local-project":
        return
    try:
        supabase_client.table("chat_history").insert({
            "project_id": project_id,
            "sender": sender,
            "text": text,
            "timestamp": timestamp
        }).execute()
    except Exception as e:
        print("Error saving chat message to DB:", e)


async def stream_chain(
    chain_input: dict, 
    chain, 
    session_id: str, 
    user_message: str, 
    user_id: str = None, 
    project_id: str = None,
    chat_timestamp: str = None
):
    """Stream LLM tokens via SSE, then parse and emit final files."""
    full_response = ""
    resolved_project_id = project_id
    
    # Save user message to DB if authenticated
    if user_id and is_supabase_configured:
        if not resolved_project_id:
            # Generate a temporary title from the user message
            temp_title = user_message[:30] + "..." if len(user_message) > 30 else user_message
            resolved_project_id = create_initial_project(user_id, temp_title)
        
        if resolved_project_id:
            # Emit project_id immediately so the client can bind to it
            yield f"data: {json.dumps({'type': 'project_bound', 'project_id': resolved_project_id})}\n\n"
            save_db_chat_message(resolved_project_id, "user", user_message, chat_timestamp or "Just now")

    try:
        async for chunk in chain.astream(chain_input):
            full_response += chunk
            yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"

        # Parse files from complete response
        files = parse_response(full_response)

        if not files:
            yield f"data: {json.dumps({'type': 'error', 'message': 'Failed to parse generated files'})}\n\n"
            return

        # Save AI message and files to DB if authenticated
        if user_id and is_supabase_configured and resolved_project_id:
            title_match = re.search(r'\*\*Project Title\*\*\s*\n*`*([^`\n]+)`*', full_response, re.IGNORECASE)
            project_title = title_match.group(1).strip() if title_match else None
            
            save_project_files_and_title(user_id, resolved_project_id, files, project_title)
            save_db_chat_message(resolved_project_id, "ai", "Done! I've updated the project files based on your request.", "Just now")
        else:
            # Persist to in-memory session memory for guests
            session_history[session_id].append({"role": "user", "content": user_message})
            session_history[session_id].append({"role": "assistant", "content": full_response})
            if len(session_history[session_id]) > 20:
                session_history[session_id] = session_history[session_id][-20:]

        title_match = re.search(r'\*\*Project Title\*\*\s*\n*`*([^`\n]+)`*', full_response, re.IGNORECASE)
        project_title = title_match.group(1).strip() if title_match else None

        payload = {'type': 'files', 'files': files}
        if project_title:
            payload['title'] = project_title
        if resolved_project_id:
            payload['project_id'] = resolved_project_id
            
        yield f"data: {json.dumps(payload)}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"


# ── Routes ───────────────────────────────────────────────────────────────────

@app.post("/api/generate")
async def generate(req: GenerateRequest, authorization: str = Header(None)):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")

    user_id = get_user_id_from_header(authorization)

    # If it's an authenticated user and we already have history, we might want to feed it.
    # But generate is for NEW project. If project_id is provided, it's a refinement.
    
    return StreamingResponse(
        stream_chain(
            chain_input={"prompt": req.prompt},
            chain=generate_chain,
            session_id=req.session_id,
            user_message=req.prompt,
            user_id=user_id,
            project_id=req.project_id
        ),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/refine")
async def refine(req: RefineRequest, authorization: str = Header(None)):
    if not req.instruction.strip():
        raise HTTPException(status_code=400, detail="Instruction is required")

    user_id = get_user_id_from_header(authorization)

    files_formatted = ""
    for f in req.files:
        files_formatted += f"**{f['name']}**\n```\n{f['content']}\n```\n\n"

    return StreamingResponse(
        stream_chain(
            chain_input={
                "instruction": req.instruction,
                "files": files_formatted,
            },
            chain=refine_chain,
            session_id=req.session_id,
            user_message=req.instruction,
            user_id=user_id,
            project_id=req.project_id
        ),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/projects")
async def get_projects(authorization: str = Header(None)):
    user_id = get_user_id_from_header(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    if not is_supabase_configured:
        return []
        
    try:
        res = supabase_client.table("projects").select("id, title, created_at, updated_at").eq("user_id", user_id).order("updated_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{project_id}")
async def get_project(project_id: str, authorization: str = Header(None)):
    user_id = get_user_id_from_header(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    if not is_supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase not configured")
        
    try:
        # Fetch project
        proj_res = supabase_client.table("projects").select("*").eq("id", project_id).eq("user_id", user_id).execute()
        if not proj_res.data:
            raise HTTPException(status_code=404, detail="Project not found")
            
        # Fetch chat history
        chat_res = supabase_client.table("chat_history").select("sender, text, timestamp").eq("project_id", project_id).order("created_at", desc=False).execute()
        
        project = proj_res.data[0]
        history = chat_res.data or []
        
        return {
            "id": project["id"],
            "title": project["title"],
            "files": project["files"],
            "history": history
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str, authorization: str = Header(None)):
    user_id = get_user_id_from_header(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    if not is_supabase_configured:
        raise HTTPException(status_code=503, detail="Supabase not configured")
        
    try:
        res = supabase_client.table("projects").delete().eq("id", project_id).eq("user_id", user_id).execute()
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history/{session_id}")
async def get_history(session_id: str):
    return {"session_id": session_id, "turns": len(session_history[session_id]) // 2, "history": session_history[session_id]}


@app.delete("/api/history/{session_id}")
async def clear_history(session_id: str):
    session_history.pop(session_id, None)
    return {"status": "cleared"}


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0", "supabase_configured": is_supabase_configured}
