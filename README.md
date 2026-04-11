# <img src="https://img.icons8.com/fluency/48/code.png" alt="Code Icon" width="40" height="40"> RapidSketch: AI-Powered Frontend Prototyping

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Cerebras-FF6B6B?style=for-the-badge&logo=ai&logoColor=white" alt="Cerebras AI">
</p>

**RapidSketch** is a revolutionary web-based development environment that transforms a single natural language prompt into a fully functional, live-previewed frontend application. Build interactive prototypes in seconds and not hours.

## 🚀 Live Demo

<blockquote>
🌐 Experience RapidSketch in action: <a href="https://rapid-sketch.vercel.app"><b>Live Demo</b></a>
</blockquote>

Try entering a prompt and watch as AI generates a complete, interactive frontend application in seconds!

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td><b>🎨 Frontend</b></td>
    <td>Next.js, React, TypeScript, Tailwind CSS, Lucide React</td>
  </tr>
  <tr>
    <td><b>⚡ Backend</b></td>
    <td>Node.js, Express.js, CORS Middleware</td>
  </tr>
  <tr>
    <td><b>🤖 AI Engine</b></td>
    <td>Cerebras Cloud API, Large Language Models</td>
  </tr>
  <tr>
    <td><b>🔧 Development</b></td>
    <td>dotenv, CDN Integration, Sandboxed Execution</td>
  </tr>
</table>

---

## ✨ Features

<ul>
  <li>🤖 <b>AI-Powered Code Generation</b> - Transform natural language into live code</li>
  <li>⚡ <b>Instant Live Preview</b> - See your ideas come to life in real-time</li>
  <li>🔄 <b>Real-time Code Sync</b> - Watch code and UI update simultaneously</li>
  <li>📁 <b>Complete File Structure</b> - Generates index.html, style.css, script.js</li>
  <li>🎯 <b>Self-Contained Components</b> - Dependency-free React components</li>
  <li>🏗️ <b>Modern Architecture</b> - Built with cutting-edge technologies</li>
  <li>🔒 <b>Sandboxed Execution</b> - Safe code execution in isolated environment</li>
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
  <preview>Sandboxed iframe execution</preview>
</frontend-architecture>
```

### AI Pipeline
```xml
<ai-pipeline>
  <provider>Cerebras Cloud API</provider>
  <model>Advanced Language Model</model>
  <processing>
    <input>Natural language prompt</input>
    <enhancement>Server-side prompt optimization</enhancement>
    <output>Complete React application</output>
  </processing>
  <execution>
    <parsing>Multi-file code extraction</parsing>
    <injection>Dynamic CSS/JS integration</injection>
    <rendering>Live iframe preview</rendering>
  </execution>
</ai-pipeline>
```

---

## 🎯 How It Works

<ol>
  <li>💭 <b>Describe Your Vision</b> - Enter a natural language description of your desired UI</li>
  <li>🚀 <b>AI Processing</b> - Backend enhances prompt and sends to Cerebras AI</li>
  <li>🤖 <b>Code Generation</b> - AI creates complete React application with HTML, CSS, JS</li>
  <li>🔍 <b>Smart Parsing</b> - Backend extracts and structures code from AI response</li>
  <li>⚡ <b>Dynamic Injection</b> - Frontend combines files and creates live preview</li>
  <li>🎨 <b>Instant Preview</b> - Fully interactive application renders in sandboxed iframe</li>
</ol>

---

## 📁 Project Structure

```
📦 RapidSketch
├── 📂 backend/                 # Node.js Express server
│   ├── 📄 .gitignore          # Git ignore patterns
│   ├── 📄 index.js            # Main server entry point
│   ├── 📄 package.json        # Backend dependencies
│   └── 📄 package-lock.json   # Dependency lock file
├── 📂 frontend/               # Next.js React application
│   ├── 📂 public/             # Static assets
│   ├── 📂 src/                # Source code
│   │   ├── 📂 app/            # App router pages
│   │   └── 📂 components/     # Reusable UI components
│   ├── 📄 .gitignore          # Frontend git ignore
│   ├── 📄 README.md           # Frontend documentation
│   ├── 📄 eslint.config.mjs   # ESLint configuration
│   ├── 📄 next.config.ts      # Next.js configuration
│   ├── 📄 package.json        # Frontend dependencies
│   ├── 📄 package-lock.json   # Dependency lock file
│   ├── 📄 postcss.config.mjs  # PostCSS configuration
│   ├── 📄 tsconfig.json       # TypeScript configuration
│   └── 📄 types.ts            # TypeScript type definitions
└── 📄 README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed
- Cerebras Cloud API key

### Installation & Setup

#### 🔧 Backend Setup
```bash
# Clone the repository
git clone https://github.com/your_username/RapidSketch.git
cd RapidSketch

# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your Cerebras API key to .env:
# CEREBRAS_API_KEY='YOUR_API_KEY'

# Start the backend server
node index.js
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
3. **🚀 Generate** and watch the magic happen
4. **🎨 Preview** your live, interactive application
5. **📝 Iterate** by refining your prompts

### Example Prompts
- *"Create a modern dashboard with charts and user stats"*
- *"Build a todo app with drag and drop functionality"*
- *"Design a landing page for a tech startup with hero section"*
- *"Make a calculator with a sleek dark theme"*

---

## 🌟 What Makes RapidSketch Special

<table>
  <tr>
    <td><b>⚡ Lightning Fast</b></td>
    <td>From idea to prototype in under 30 seconds</td>
  </tr>
  <tr>
    <td><b>🎯 Zero Setup</b></td>
    <td>No dependencies, frameworks, or complex configurations</td>
  </tr>
  <tr>
    <td><b>🤖 AI-First</b></td>
    <td>Leverages cutting-edge Cerebras AI for superior code generation</td>
  </tr>
  <tr>
    <td><b>🔄 Interactive</b></td>
    <td>Live preview updates as you refine your prompts</td>
  </tr>
</table>

---

## 🔧 Key Technologies

### 🤖 **AI & Code Generation**
- **Cerebras Cloud** - Ultra-fast AI inference for rapid prototyping
- **Advanced Prompt Engineering** - Optimized prompts for better code output
- **Multi-file Parsing** - Intelligent extraction of HTML, CSS, and JavaScript

### 🎨 **Frontend Excellence**
- **Next.js 14** - React framework with modern features
- **TypeScript** - Type-safe development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, consistent icons

### 🚀 **Performance & Security**
- **Sandboxed Execution** - Safe code execution environment
- **CDN Integration** - Fast, reliable external dependencies
- **Real-time Updates** - Instant sync between code and preview

---

## 🎯 Use Cases

<ul>
  <li>🚀 <b>Rapid Prototyping</b> - Quickly validate UI/UX concepts</li>
  <li>💼 <b>Client Presentations</b> - Create interactive demos for stakeholders</li>
  <li>🎓 <b>Learning & Teaching</b> - Explore frontend development concepts</li>
  <li>💡 <b>Idea Validation</b> - Test concepts before full development</li>
  <li>🛠️ <b>Component Library</b> - Generate reusable UI components</li>
</ul>

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

<ul>
  <li>🐛 <b>Report Issues</b> - Found a bug? Let us know!</li>
  <li>💡 <b>Feature Requests</b> - Have ideas for new functionality?</li>
  <li>🔧 <b>Pull Requests</b> - Contribute code improvements</li>
  <li>📖 <b>Documentation</b> - Help improve our docs</li>
  <li>⭐ <b>Star the Repo</b> - Show your support!</li>
</ul>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ and AI • Transforming Ideas into Interactive Reality
</p>
