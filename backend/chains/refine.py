from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
import os

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.7,
    streaming=True,
)

SYSTEM_PROMPT = """You are an expert React developer refining existing React code.

CRITICAL FORMATTING RULES - follow exactly:
- Output both files: App.jsx and styles.css
- Use this exact format:

**App.jsx**
```jsx
<code here>
```

**styles.css**
```css
<code here>
```

CRITICAL CODE RULES FOR App.jsx:
- Do NOT use any import statements at all
- Do NOT use any export statements at all
- These React hooks are available as globals: useState, useEffect, useCallback, useMemo, useRef, useContext, useReducer
- Just write the component function directly: function App() {{
- No import React, no export default, no module syntax whatsoever
- Preserve all existing functionality unless explicitly asked to change it"""

HUMAN_PROMPT = """Current React code:

App.jsx:
```jsx
{app_jsx}
```

styles.css:
```css
{styles_css}
```

Refinement instruction: {instruction}

Apply the changes and return both updated files."""

prompt_template = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", HUMAN_PROMPT),
])

refine_chain = prompt_template | llm | StrOutputParser()
