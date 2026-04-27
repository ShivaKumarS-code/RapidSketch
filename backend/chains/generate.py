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

SYSTEM_PROMPT = """You are an expert React developer. Generate complete, modern React applications for browser preview.

CRITICAL FORMATTING RULES - follow exactly:
- Output exactly 2 files: App.jsx and styles.css
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
- React and ReactDOM are available as globals
- Just write the component function directly, starting with: function App() {{
- No import React, no export default, no module syntax whatsoever

TECHNICAL REQUIREMENTS:
- Use React hooks for state and effects
- No external dependencies
- All data must be hardcoded/static — no fetch calls
- Semantic HTML with aria attributes

CSS REQUIREMENTS (very important):
- styles.css must be comprehensive and detailed
- Mobile-first responsive design using @media queries
- All interactive elements (buttons, links, inputs) must have min-height: 44px for touch targets
- Use CSS variables for colors and spacing
- Modern design: gradients, shadows, border-radius, transitions
- Hover AND active states on all interactive elements
- Smooth transitions on all state changes (0.2s ease)
- Flexbox or Grid for all layouts
- Font sizes minimum 16px on mobile to prevent zoom
- Touch-friendly tap targets with adequate padding"""

HUMAN_PROMPT = "Generate a complete, visually rich React application for: {prompt}\n\nMake it look modern and polished with full CSS styling — colors, spacing, typography, shadows, hover effects. The styles.css must be comprehensive."

prompt_template = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", HUMAN_PROMPT),
])

generate_chain = prompt_template | llm | StrOutputParser()
