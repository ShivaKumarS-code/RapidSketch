# <img src="https://img.icons8.com/fluency/48/code.png" alt="Code Icon" width="40" height="40"> RapidSketch: AI-Powered Frontend Prototyping

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white" alt="Groq">
</p>

**RapidSketch** is a revolutionary web-based development environment that transforms a single natural language prompt into a fully functional, live-previewed React/HTML/CSS frontend application. Build interactive prototypes in seconds, not hours.

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td><b>🎨 Frontend</b></td>
    <td>Next.js, React, TypeScript, Tailwind CSS, Lucide React, JSZip</td>
  </tr>
  <tr>
    <td><b>⚡ Backend</b></td>
    <td>FastAPI, Uvicorn, Python 3</td>
  </tr>
  <tr>
    <td><b>🤖 AI Engine</b></td>
    <td>Groq Cloud API, LangChain, Llama 3.3 (70B) Model</td>
  </tr>
  <tr>
    <td><b>🔧 Development</b></td>
    <td>Babel Standalone (in-browser compilation), Sandboxed Execution</td>
  </tr>
</table>

---

## ✨ Features

<ul>
  <li>🤖 <b>AI-Powered Code Generation</b> - Transform natural language into live React code</li>
  <li>⚡ <b>Instant Live Preview</b> - See your ideas come to life in real-time with streaming response</li>
  <li>🔄 <b>Real-time Code Sync</b> - Watch code and UI update simultaneously</li>
  <li>📁 <b>Complete File Structure</b> - Generates App.jsx, styles.css</li>
  <li>🔧 <b>Iterative Refinement</b> - Chat with the AI to refine and modify the generated application</li>
  <li>🔒 <b>Sandboxed Execution</b> - Safe code execution in isolated iframe environments</li>
  <li>📱 <b>Responsive Design</b> - Works seamlessly across all devices</li>
</ul>

---

## 🏗️ Architecture

### Frontend Stack
```xml
<frontend-architecture>
  <framework>Next.js + React</framework>
  <language>TypeScript</language>
  <styling>Tailwind CSS</styling>
  <icons>Lucide React</icons>
  <preview>Sandboxed iframe execution (React 18 + Babel Standalone)</preview>
</frontend-architecture>
```

### AI Pipeline
```xml
<ai-pipeline>
  <provider>Groq Cloud API</provider>
  <model>Llama-3.3-70b-versatile</model>
  <processing>
    <input>Natural language prompt / Iterative instructions</input>
    <framework>LangChain Chains (Generate & Refine)</framework>
    <output>Dynamic React component & CSS stylesheet</output>
  </processing>
  <execution>
    <rendering>Real-time token streaming & client-side rendering</rendering>
  </execution>
</ai-pipeline>
```

---

## 🎯 How It Works

<ol>
  <li>💭 <b>Describe Your Vision</b> - Enter a natural language description of your desired UI</li>
  <li>🚀 <b>AI Streaming</b> - Backend streams Llama 3.3 tokens in real-time to the frontend</li>
  <li>🔍 <b>Smart Parsing</b> - Backend extracts structured files (App.jsx, styles.css)</li>
  <li>⚡ <b>Dynamic Compilation</b> - Frontend renders the code instantly inside a sandboxed iframe using Babel</li>
  <li>🎨 <b>Instant Preview & Iteration</b> - Interact with the live application, and type follow-up instructions to refine it</li>
</ol>

---

## 📁 Project Structure

```
📦 RapidSketch
├── 📂 backend/                 # FastAPI server (Python)
│   ├── 📂 chains/              # LangChain pipelines
│   │   ├── generate.py        # Generation chain logic
│   │   └── refine.py          # Refinement chain logic
│   ├── main.py                # Main server entry point
│   └── requirements.txt       # Backend dependencies
├── 📂 frontend/               # Next.js React application
│   ├── 📂 src/
│   │   ├── 📂 app/            # App router pages & layouts
│   │   └── 📂 components/     # Reusable UI components (Editor, PromptInput, Explorer)
│   ├── tsconfig.json          # TypeScript configuration
│   └── package.json           # Frontend dependencies
└── 📄 README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) and npm installed
- Python (v3.10+) installed
- Groq Cloud API key

### Installation & Setup

#### 🔧 Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env
# Add your Groq API key to .env:
# GROQ_API_KEY='YOUR_API_KEY'

# Start the backend server
uvicorn main:app --port 3001 --reload
```
🌐 Backend will be running on **http://localhost:3001**

#### 🎨 Frontend Setup
```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
🌐 Frontend will be running on **http://localhost:3000**

---

## 🎮 Usage

Ready to create amazing prototypes? Here's how:

1. **🌐 Open** http://localhost:3000 in your browser
2. **💭 Describe** your desired UI in the prompt field
3. **🚀 Generate** and watch the magic happen in real-time
4. **🎨 Preview** and interact with your live application
5. **📝 Iterate** by typing refinement prompts to update specific behaviors

### Example Prompts
- *"Create a modern dashboard with charts and user stats"*
- *"Build a todo app with drag and drop functionality"*
- *"Design a landing page for a tech startup with hero section"*
- *"Make a calculator with a sleek dark theme"*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ and AI • Transforming Ideas into Interactive Reality
</p>
