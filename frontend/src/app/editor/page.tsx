'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, MessageSquare, Folder, FolderOpen, History, Layers, Settings, 
  Crown, Moon, Sun, Edit3, RotateCcw, RotateCw, Monitor, 
  Tablet, Smartphone, Share2, ChevronDown, ChevronRight, 
  Copy, MoreVertical, FileCode, FileType, Send, Square, Wand2,
  ExternalLink, Zap
} from 'lucide-react';
import { FileNode } from '@/types';
import JSZip from 'jszip';
import { supabase } from '@/lib/supabase';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

function getSessionId() {
  if (typeof window === 'undefined') return 'default';
  const key = 'rs_session';
  let id = sessionStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(key, id); }
  return id;
}

const EMPTY_HTML = `<!DOCTYPE html><html><body style="margin:0;background:#0c0c0c;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;color:#3d3d3d;flex-direction:column;gap:12px"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg><p style="font-size:14px;margin:0">Generate code to see a preview</p></body></html>`;

function buildPreviewHtml(files: FileNode[]): string {
  const filesJson = JSON.stringify(files).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  let entryPath = 'src/main.jsx';
  if (!files.some(f => f.name === 'src/main.jsx')) {
    const fallbackEntry = files.find(f => 
      f.name === 'src/main.tsx' || 
      f.name === 'src/index.jsx' || 
      f.name === 'src/index.js' || 
      f.name === 'App.jsx' || 
      f.name === 'src/App.jsx'
    );
    if (fallbackEntry) {
      entryPath = fallbackEntry.name;
    } else if (files.length > 0) {
      entryPath = files[0].name;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0"/>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Poppins', 'Inter', 'sans-serif'],
        }
      }
    }
  }
</script>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script>
  window.react = window.React;
</script>
<script src="https://unpkg.com/lucide-react@0.321.0/dist/umd/lucide-react.min.js"></script>
<script>
  window.Lucide = window.LucideReact;
</script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-zinc-950 text-white">
<div id="root"></div>

<script>
  (async () => {
    const files = ${filesJson};
    const entryPath = "${entryPath}";

    function showError(title, message) {
      const rootEl = document.getElementById('root');
      if (rootEl) {
        rootEl.innerHTML = \`
          <div style="padding: 24px; color: #f43f5e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f11; border: 1px solid #e11d48; border-radius: 8px; margin: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); text-align: left;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">\${title}</h3>
            <pre style="margin: 0; white-space: pre-wrap; font-size: 13px; font-family: monospace; line-height: 1.5; color: #fda4af;">\${message}</pre>
          </div>
        \`;
      }
    }

    window.addEventListener('error', (event) => {
      showError('Runtime Error', event.error ? event.error.stack : event.message);
    });

    window.addEventListener('unhandledrejection', (event) => {
      showError('Unhandled Promise Rejection', event.reason ? (event.reason.stack || event.reason) : 'Promise rejected');
    });

    function resolvePath(basePath, relativePath) {
      if (relativePath.startsWith('@/')) {
        return 'src/' + relativePath.slice(2);
      }
      const parts = basePath.split('/');
      parts.pop();
      
      const relParts = relativePath.split('/');
      for (const part of relParts) {
        if (part === '.' || part === '') continue;
        if (part === '..') {
          parts.pop();
        } else {
          parts.push(part);
        }
      }
      return parts.join('/');
    }

    function findFile(resolvedPath) {
      let f = files.find(x => x.name === resolvedPath);
      if (f) return f;
      const exts = ['.jsx', '.js', '.tsx', '.ts'];
      for (const ext of exts) {
        const checkPath1 = resolvedPath + ext;
        const checkPath2 = resolvedPath.replace(/\\.(jsx|tsx|js|ts)$/, '') + ext;
        let f2 = files.find(x => x.name === checkPath1 || x.name === checkPath2);
        if (f2) return f2;
      }
      return null;
    }

    // 1. Inject CSS styles
    files.filter(f => f.name.endsWith('.css')).forEach(cssFile => {
      const style = document.createElement('style');
      style.setAttribute('data-file', cssFile.name);
      style.textContent = cssFile.content;
      document.head.appendChild(style);
    });

    // 2. Prepare importMap and compile files
    function createGlobalWrapperBlob(globalObj, defaultExportName) {
      if (!globalObj) return URL.createObjectURL(new Blob(['export default {};'], { type: 'application/javascript' }));
      const reserved = new Set(['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'let', 'static']);
      const keys = Object.keys(globalObj).filter(k => {
        return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) && !reserved.has(k);
      });
      const esModuleCode = \`
        export default \${defaultExportName};
        export const { \${keys.join(', ')} } = \${defaultExportName};
      \`;
      return URL.createObjectURL(new Blob([esModuleCode], { type: 'application/javascript' }));
    }

    const reactBlobUrl = createGlobalWrapperBlob(window.React, 'window.React');
    const reactDomBlobUrl = createGlobalWrapperBlob(window.ReactDOM, 'window.ReactDOM');
    
    const reactDomClientEsModule = \`
      export const createRoot = window.ReactDOM ? window.ReactDOM.createRoot : null;
      export const hydrateRoot = window.ReactDOM ? window.ReactDOM.hydrateRoot : null;
      export default { createRoot, hydrateRoot };
    \`;
    const reactDomClientBlobUrl = URL.createObjectURL(new Blob([reactDomClientEsModule], { type: 'application/javascript' }));

    const lucideBlobUrl = createGlobalWrapperBlob(window.LucideReact || window.Lucide, 'window.LucideReact || window.Lucide');

    const importMap = {
      imports: {
        "react": reactBlobUrl,
        "react-dom": reactDomBlobUrl,
        "react-dom/client": reactDomClientBlobUrl,
        "lucide-react": lucideBlobUrl
      }
    };

    const jsFiles = files.filter(f => 
      f.name.endsWith('.jsx') || 
      f.name.endsWith('.js') || 
      f.name.endsWith('.tsx') || 
      f.name.endsWith('.ts')
    );

    const compiledBlobs = {};
    let hasCompileError = false;

    jsFiles.forEach(file => {
      try {
        if (typeof Babel === 'undefined') {
          throw new Error('Babel is not loaded. Please check your internet connection to load Babel Standalone.');
        }
        
        const isTypeScript = file.name.endsWith('.ts') || file.name.endsWith('.tsx');
        let compiled = Babel.transform(file.content, {
          presets: ['react', ...(isTypeScript ? ['typescript'] : [])]
        }).code;

        console.log("Compiled " + file.name + ":", compiled);

        compiled = compiled.replace(/(import|export)\\s+([\\s\\S]*?)\\s+from\\s+['"]([^'"]+)['"]/g, (match, type, content, importPath) => {
          if (importPath.startsWith('.') || importPath.startsWith('/') || importPath.startsWith('@/')) {
            const resolved = resolvePath(file.name, importPath);
            const target = findFile(resolved);
            if (target) {
              return type + ' ' + content + ' from "virtual:' + target.name + '"';
            }
          } else {
            if (importPath === 'react' || importPath === 'react-dom' || importPath === 'react-dom/client' || importPath === 'lucide-react') {
              return match;
            }
            return type + ' ' + content + ' from "https://esm.sh/' + importPath + '"';
          }
          return match;
        });

        compiled = compiled.replace(/import\\s+['"]([^'"]+\\.css)['"]/g, '/* css import stripped */');

        const blob = new Blob([compiled], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        compiledBlobs[file.name] = blobUrl;
        
        importMap.imports['virtual:' + file.name] = blobUrl;
      } catch (err) {
        console.error('Error compiling ' + file.name + ':', err);
        hasCompileError = true;
        showError('Compilation Error in ' + file.name, err.stack || err.message || err);
      }
    });

    if (hasCompileError) return;

    const imScript = document.createElement('script');
    imScript.type = 'importmap';
    imScript.textContent = JSON.stringify(importMap);
    document.head.appendChild(imScript);

    // 3. Import and run entry point
    const entryUrl = importMap.imports['virtual:' + entryPath] || compiledBlobs[entryPath];
    if (entryUrl) {
      try {
        await import(entryUrl);
      } catch (err) {
        console.error("Error executing entry point: ", err);
        showError('Execution Error', err.stack || err.message || err);
        if (window.App) {
          ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(window.App));
        }
      }
    } else {
      console.error("Entry file not found: " + entryPath);
      showError('Entry File Error', "Entry file not found: " + entryPath);
    }
  })();
</script>
</body>
</html>`;
}

function buildFileTree(flatFiles: FileNode[]): FileNode[] {
  const root: FileNode[] = [];

  flatFiles.forEach(file => {
    const parts = file.name.split('/');
    let currentLevel = root;
    let accumulatedPath = '';

    parts.forEach((part, index) => {
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
      const isLast = index === parts.length - 1;
      let existing = currentLevel.find(node => node.name === accumulatedPath);

      if (!existing) {
        existing = {
          name: accumulatedPath,
          content: isLast ? file.content : '',
          type: isLast ? 'file' : 'folder',
          children: isLast ? undefined : [],
          isOpen: isLast ? undefined : true
        };
        currentLevel.push(existing);
      }
      
      if (!isLast && existing.children) {
        currentLevel = existing.children;
      }
    });
  });

  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.split('/').pop()!.localeCompare(b.name.split('/').pop()!);
    });
    nodes.forEach(node => {
      if (node.children) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(root);
  return root;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  hasPreview?: boolean;
}

export default function EditorPage() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [chatOpen, setChatOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  // Supabase Auth & Database States
  const [user, setUser] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'files' | 'history'>('chat');
  
  // Custom Modal dialogs states
  const [modalConfig, setModalConfig] = useState<{
    type: 'alert' | 'confirm' | 'prompt';
    title: string;
    message: string;
    defaultValue?: string;
    onConfirm: (val?: string) => void;
    onCancel?: () => void;
  } | null>(null);

  const [promptVal, setPromptVal] = useState('');

  // Sync promptVal with defaultValue when prompt opens
  useEffect(() => {
    if (modalConfig?.type === 'prompt') {
      setPromptVal(modalConfig.defaultValue ?? '');
    } else {
      setPromptVal('');
    }
  }, [modalConfig]);

  const showCustomAlert = (message: string, title = "Alert") => {
    return new Promise<void>((resolve) => {
      setModalConfig({
        type: 'alert',
        title,
        message,
        onConfirm: () => {
          setModalConfig(null);
          resolve();
        }
      });
    });
  };

  const showCustomConfirm = (message: string, title = "Confirm") => {
    return new Promise<boolean>((resolve) => {
      setModalConfig({
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          setModalConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setModalConfig(null);
          resolve(false);
        }
      });
    });
  };

  const showCustomPrompt = (message: string, defaultValue = "", title = "Prompt") => {
    return new Promise<string | null>((resolve) => {
      setModalConfig({
        type: 'prompt',
        title,
        message,
        defaultValue,
        onConfirm: (val) => {
          setModalConfig(null);
          resolve(val ?? null);
        },
        onCancel: () => {
          setModalConfig(null);
          resolve(null);
        }
      });
    });
  };
  
  // Tabs & Views
  const [previewTab, setPreviewTab] = useState<'preview' | 'browser'>('preview');
  const [rightTab, setRightTab] = useState<'code' | 'console'>('code');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  // Mobile UI States
  const [isMobile, setIsMobile] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'prompt' | 'preview' | 'code'>('prompt');
  const [mobileCodeView, setMobileCodeView] = useState<'explorer' | 'editor'>('explorer');
  
  // Project Info
  const [projectTitle, setProjectTitle] = useState('New Project');
  
  // Prompt & Generation state
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const isRefine = files.length > 0;
  
  // Chat History
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hello! Describe the interface you want to build and watch the AI stream the code in real-time.",
      timestamp: "Welcome"
    }
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Supabase auth change listener and state setup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSessionToken(session?.access_token ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSessionToken(session?.access_token ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProjects = async (token: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    if (sessionToken) {
      fetchProjects(sessionToken);
    } else {
      setProjects([]);
    }
  }, [sessionToken]);

  const loadProject = async (projId: string) => {
    if (!sessionToken) return;
    try {
      setStatus('Loading project...');
      const res = await fetch(`${BACKEND_URL}/api/projects/${projId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentProjectId(data.id);
        setProjectTitle(data.title);
        setFiles(data.files);
        
        // Map chat history back from db schema
        setChatHistory(data.history.length > 0 ? data.history : [
          {
            sender: 'ai',
            text: "Hello! Describe the interface you want to build and watch the AI stream the code in real-time.",
            timestamp: "Welcome"
          }
        ]);

        if (data.files && data.files.length > 0) {
          const preferred = data.files.find((f: any) => 
            f.name === 'src/App.jsx' || 
            f.name === 'App.jsx' || 
            f.name === 'src/main.jsx'
          );
          setActiveFile(preferred ?? data.files[0]);
        } else {
          setActiveFile(null);
        }
      } else {
        await showCustomAlert("Failed to load project details.");
      }
    } catch (err) {
      console.error("Error loading project:", err);
    } finally {
      setStatus('');
    }
  };

  const deleteProject = async (e: React.MouseEvent, projId: string) => {
    e.stopPropagation();
    if (!sessionToken) return;
    if (!(await showCustomConfirm("Are you sure you want to delete this project?"))) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/projects/${projId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if (res.ok) {
        if (currentProjectId === projId) {
          // Reset editor workspace
          setCurrentProjectId(null);
          setProjectTitle('New Project');
          setFiles([]);
          setActiveFile(null);
          setChatHistory([
            {
              sender: 'ai',
              text: "Hello! Describe the interface you want to build and watch the AI stream the code in real-time.",
              timestamp: "Welcome"
            }
          ]);
        }
        fetchProjects(sessionToken);
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentProjectId(null);
    setProjectTitle('New Project');
    setFiles([]);
    setActiveFile(null);
    setChatHistory([
      {
        sender: 'ai',
        text: "Hello! Describe the interface you want to build and watch the AI stream the code in real-time.",
        timestamp: "Welcome"
      }
    ]);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
 
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const hasFiles = files.length > 0;
  const previewHtml = useMemo(() => hasFiles ? buildPreviewHtml(files) : EMPTY_HTML, [files, hasFiles]);
  const fileTree = useMemo(() => buildFileTree(files), [files]);

  const handleCodeUpdate = (newFiles: FileNode[]) => {
    setFiles(newFiles);
    const preferred = newFiles.find(f => 
      f.name === 'src/App.jsx' || 
      f.name === 'App.jsx' || 
      f.name === 'src/main.jsx'
    );
    setActiveFile(preferred ?? newFiles[0] ?? null);
  };

  const handleCopy = async () => {
    if (activeFile?.content) {
      await navigator.clipboard.writeText(activeFile.content);
      await showCustomAlert('Copied active file code to clipboard!');
    }
  };

  const handleDownload = () => {
    if (!hasFiles) return;
    const zip = new JSZip();
    files.forEach(f => zip.file(f.name, f.content));
    zip.generateAsync({ type: 'blob' }).then(blob => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `${projectTitle.toLowerCase().replace(/\s+/g, '-')}.zip`; a.click(); URL.revokeObjectURL(a.href);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    
    const userPrompt = prompt;
    setChatHistory(prev => [
      ...prev,
      {
        sender: 'user',
        text: userPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setPrompt('');
    setIsGenerating(true);
    setChatOpen(true);
    setStatus('Connecting...');
    abortRef.current = new AbortController();

    if (!isRefine) {
      const cleanTitle = userPrompt.length > 24 
        ? userPrompt.slice(0, 24).trim() + '...' 
        : userPrompt;
      setProjectTitle(cleanTitle);
    }

    const endpoint = isRefine ? '/api/refine' : '/api/generate';
    const body = isRefine
      ? { instruction: userPrompt, files: files, session_id: getSessionId(), project_id: currentProjectId }
      : { prompt: userPrompt, session_id: getSessionId(), project_id: currentProjectId };

    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {})
        },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('No stream');
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      setStatus('Generating...');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let ev;
          try {
            ev = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          if (ev.type === 'project_bound') {
            setCurrentProjectId(ev.project_id);
          }
          else if (ev.type === 'files') {
            handleCodeUpdate(ev.files);
            if (ev.title) {
              setProjectTitle(ev.title);
            }
            if (ev.project_id) {
              setCurrentProjectId(ev.project_id);
            }
            setStatus('Done');
            if (sessionToken) {
              fetchProjects(sessionToken);
            }
          }
          else if (ev.type === 'error') {
            throw new Error(ev.message);
          }
        }
      }

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Done! I've updated the project files based on your request.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hasPreview: true
        }
      ]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setStatus('Error');
        setChatHistory(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `An error occurred while communicating with the stream: ${err.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatus(''), 2000);
    }
  };

  // Render Explorer File Node recursively
  const renderFileNode = (node: FileNode, level = 0) => {
    const isSelected = activeFile?.name === node.name;
    const displayName = node.name.split('/').pop() || node.name;
    const isOpen = !collapsedFolders[node.name];

    const fileIcon = (name: string) => {
      if (name.endsWith('.jsx') || name.endsWith('.tsx')) return <FileCode size={14} className="text-[#3ca2fa]" />;
      if (name.endsWith('.css')) return <FileType size={14} className="text-[#ef4444]" />;
      if (name.endsWith('.json')) return <FileCode size={14} className="text-[#e2b857]" />;
      return <FileCode size={14} className="text-gray-500" />;
    };

    return (
      <div key={node.name}>
        <div
          onClick={() => {
            if (node.type === 'folder') {
              setCollapsedFolders(prev => ({ ...prev, [node.name]: !prev[node.name] }));
            } else {
              setActiveFile(node);
              if (isMobile) {
                setMobileCodeView('editor');
              }
            }
          }}
          className={`flex items-center transition-all rounded mx-1.5 cursor-pointer ${
            isMobile
              ? 'gap-3 px-4 py-2.5 text-[13px] my-1'
              : 'gap-2 px-3 py-2 text-[12.5px] my-1'
          } ${
            isSelected
              ? 'bg-[#1a1a1e] text-white font-medium border-l-2 border-[#ef4444]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
          }`}
          style={{ paddingLeft: `${level * 14 + (isMobile ? 28 : 12)}px` }}
        >
          {node.type === 'folder' ? (
            <div className="flex items-center gap-1.5 mr-0.5">
              {isOpen ? <ChevronDown size={11} className="text-gray-400" /> : <ChevronRight size={11} className="text-gray-400" />}
              {isOpen ? <FolderOpen size={14} className="text-[#e2b857] fill-[#e2b857]/10" /> : <Folder size={14} className="text-[#e2b857] fill-[#e2b857]/10" />}
            </div>
          ) : (
            fileIcon(node.name)
          )}
          <span className={isSelected ? 'text-white' : ''}>{displayName}</span>
        </div>
        {node.type === 'folder' && isOpen && node.children?.map(c => renderFileNode(c, level + 1))}
      </div>
    );
  };

  return (
    <div 
      className="w-screen h-screen flex bg-black text-[#e8e8e8] font-sans overflow-hidden select-none relative"
      style={{ width: '100vw', height: '100vh', boxSizing: 'border-box' }}
    >
      <style>{`
        @keyframes slideRight {
          from { transform: translateX(-12px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Profile Slide Drawer */}
      {profileOpen && user && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 transition-opacity" 
            onClick={() => setProfileOpen(false)}
          />
          {/* Drawer */}
          <div 
            className="absolute bottom-6 left-[76px] w-[210px] bg-[#09090a] border border-zinc-800/80 rounded-2xl shadow-2xl z-40 flex flex-col p-4 select-none animate-[slideRight_0.2s_ease-out]"
            style={{ 
              boxSizing: 'border-box'
            }}
          >
            {/* Header / Close button */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40 mb-3">
              <span className="text-[10px] font-bold text-zinc-500 tracking-wider">ACCOUNT</span>
              <button 
                onClick={() => setProfileOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                style={{ background: 'none', border: 'none', padding: '2px' }}
                title="Close"
              >
                <Square size={10} className="rotate-45" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="flex items-center justify-center text-[#ef4444] font-semibold font-mono"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  fontSize: '13px',
                  flexShrink: 0
                }}
              >
                {user.email?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-white truncate" title={user.email}>{user.email}</span>
                <span className="text-[8px] text-zinc-500">Logged in</span>
              </div>
            </div>

            {/* Logout CTA */}
            <button
              onClick={() => {
                handleLogout();
                setProfileOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/40 text-[11px] font-semibold cursor-pointer transition-all active:scale-98 text-center"
            >
              Sign Out
            </button>
          </div>
        </>
      )}

      {/* 1. Narrow Navigation Sidebar (Leftmost) */}
      <div 
        className="flex flex-col justify-between items-center bg-[#09090a] shrink-0" 
        style={{ 
          display: isMobile ? 'none' : 'flex',
          width: '64px', 
          height: '100%', 
          paddingTop: '24px', 
          paddingBottom: '24px', 
          borderRight: '1px solid #1f2937', 
          boxSizing: 'border-box' 
        }}
      >
        <div className="flex flex-col items-center gap-8 w-full" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Logo Icon */}
          <a 
            href="/"
            className="flex items-center justify-center text-[#ef4444] transition-all hover:scale-105 active:scale-95"
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(239, 68, 68, 0.08)', 
              border: '1px solid rgba(239, 68, 68, 0.25)', 
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
            title="Back to Landing Page"
          >
            <Zap size={16} className="fill-[#ef4444]/15" />
          </a>

          {/* Menu Icons */}
          <div className="flex flex-col items-center gap-3 w-full" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { 
                icon: <MessageSquare size={16} />, 
                active: chatOpen && sidebarTab === 'chat', 
                title: 'Chat Workspace', 
                onClick: () => {
                  if (chatOpen && sidebarTab === 'chat') {
                    setChatOpen(false);
                  } else {
                    setSidebarTab('chat');
                    setChatOpen(true);
                  }
                } 
              },
              { 
                icon: <Folder size={16} />, 
                active: chatOpen && sidebarTab === 'files', 
                title: 'Files list',
                onClick: () => {
                  if (chatOpen && sidebarTab === 'files') {
                    setChatOpen(false);
                  } else {
                    setSidebarTab('files');
                    setChatOpen(true);
                  }
                }
              },
              { 
                icon: <History size={16} />, 
                active: chatOpen && sidebarTab === 'history', 
                title: 'Project History', 
                onClick: () => {
                  if (chatOpen && sidebarTab === 'history') {
                    setChatOpen(false);
                  } else {
                    setSidebarTab('history');
                    setChatOpen(true);
                  }
                } 
              }
            ].map((item, idx) => (
              <button
                key={idx}
                title={item.title}
                onClick={item.onClick}
                className="hover:text-white transition-colors"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: item.active ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                  backgroundColor: item.active ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                  color: item.active ? '#ef4444' : '#4b5563',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center w-full" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {user ? (
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              title={`Logged in as ${user.email}. Click to log out.`}
              className="hover:scale-105 active:scale-95 transition-all animate-[fadeIn_0.2s_ease-out]"
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                border: '1px solid #ef4444', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '11px', 
                fontWeight: 600, 
                color: '#ef4444', 
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                cursor: 'pointer'
              }}
            >
              {user.email?.slice(0, 2).toUpperCase() || 'US'}
            </button>
          ) : (
            <button 
              onClick={() => window.location.href = '/login'}
              title="Log in to save history"
              className="hover:scale-105 active:scale-95 transition-all text-[#9ca3af] hover:text-white"
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                border: '1px solid #374151', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '11px', 
                fontWeight: 600, 
                backgroundColor: '#1f2937',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              IN
            </button>
          )}
        </div>
      </div>

      {/* 2. Chat Panel (Left side) */}
      <div 
        className="flex flex-col bg-[#070708] shrink-0" 
        style={{ 
          width: isMobile ? '100%' : '300px', 
          height: isMobile ? 'calc(100% - 60px)' : '100%', 
          borderRight: isMobile ? 'none' : '1px solid #1f2937', 
          display: isMobile ? (mobileActiveTab === 'prompt' ? 'flex' : 'none') : (chatOpen ? 'flex' : 'none'),
          boxSizing: 'border-box' 
        }}
      >
        {sidebarTab === 'chat' && (
          <>
            {/* New Project CTA */}
            <div style={{ 
              padding: isMobile ? '24px 28px' : '20px 16px', 
              borderBottom: '1px solid #1f2937', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              boxSizing: 'border-box'
            }}>
              <button 
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  border: '1px solid #1f2937', 
                  borderRadius: '8px', 
                  padding: '10px 14px', 
                  fontSize: '12px', 
                  fontWeight: 550, 
                  color: '#ffffff', 
                  backgroundColor: 'rgba(15, 15, 17, 0.4)', 
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
                className="hover:bg-white/[0.02] transition-colors"
                onClick={() => {
                  setCurrentProjectId(null);
                  setFiles([]);
                  setActiveFile(null);
                  setChatHistory([
                    {
                      sender: 'ai',
                      text: "Hello! Describe the interface you want to build and watch the AI stream the code in real-time.",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
              >
                <Plus size={14} /> New Project
              </button>

            </div>

            {/* Scrollable messages history */}
            <div className="flex-1 overflow-y-auto" style={{ padding: isMobile ? '24px 28px' : '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
              {chatHistory.map((msg, i) => (
                <div key={i} className="flex" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', boxSizing: 'border-box' }}>
                  <div className="shrink-0 mt-0.5">
                    {msg.sender === 'user' ? (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: '#ffffff', backgroundColor: '#1e293b' }}>
                        U
                      </div>
                    ) : (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444' }}>
                        <Wand2 size={12} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box' }}>
                    <div className="flex items-baseline justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span className="font-semibold text-white text-xs">{msg.sender === 'user' ? 'You' : 'RapidSketch AI'}</span>
                      <span className="text-[9px] text-gray-600 font-mono">{msg.timestamp}</span>
                    </div>
                    <p className="text-gray-400 normal-case" style={{ margin: 0, fontSize: '13px', lineHeight: '1.6' }}>{msg.text}</p>
                  </div>
                </div>
              ))}

              {/* AI Typing Indicator */}
              {isGenerating && (
                <div className="flex animate-[fadeIn_0.3s_ease-out]" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', boxSizing: 'border-box' }}>
                  <div className="shrink-0 mt-0.5">
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444' }}>
                      <Wand2 size={12} className="animate-spin" />
                    </div>
                  </div>
                  <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box' }}>
                    <div className="flex items-baseline justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span className="font-semibold text-white text-xs">RapidSketch AI</span>
                      <span className="text-[9px] text-gray-600 font-mono">Typing...</span>
                    </div>
                    <div style={{ display: 'inline-flex', gap: '4px', padding: '8px 12px', backgroundColor: '#0f0f10', border: '1px solid #1f2937', borderRadius: '12px', width: 'fit-content', marginTop: '4px' }}>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Suggestions chips */}
            <div style={{ borderTop: '1px solid #1f2937', backgroundColor: 'rgba(0, 0, 0, 0.15)', paddingBottom: '8px', boxSizing: 'border-box' }}>
              <div style={{ padding: isMobile ? '16px 28px 8px 28px' : '12px 16px 4px 16px', display: 'flex', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                {['Add dark mode', 'Improve UI', 'Add animations'].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setPrompt(sug)}
                    style={{
                      fontSize: isMobile ? '11px' : '10px',
                      backgroundColor: '#0c0c0d',
                      border: '1px solid #1f2937',
                      color: '#9ca3af',
                      padding: isMobile ? '6px 12px' : '4px 10px',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    className="hover:text-white hover:border-gray-700"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} style={{ padding: isMobile ? '8px 28px 16px 28px' : '8px 16px 12px 16px', boxSizing: 'border-box' }}>
                <div style={{ border: '1px solid #1f2937', backgroundColor: '#050506', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box' }}>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Ask anything... (e.g. Add a calendar)"
                    rows={2}
                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#e8e8e8', resize: 'none', outline: 'none', fontSize: '13px', lineHeight: '1.6', margin: 0, padding: 0 }}
                  />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px', boxSizing: 'border-box' }}>
                    <span className="font-mono text-gray-600" style={{ fontSize: '9px' }}>{status ? status : `${prompt.length}/2000`}</span>
                    {isGenerating ? (
                      <button 
                        type="button" 
                        onClick={() => { abortRef.current?.abort(); setIsGenerating(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', padding: isMobile ? '6px 12px' : '4px 10px', fontSize: isMobile ? '11px' : '10px', cursor: 'pointer' }}
                      >
                        <Square size={10} /> Stop
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        disabled={!prompt.trim()}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', padding: isMobile ? '7px 14px' : '5px 12px', fontSize: isMobile ? '11px' : '10px', fontWeight: 550, cursor: 'pointer', transition: 'background-color 0.2s' }}
                        className="disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-600"
                      >
                        <Send size={10} /> Send
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '8px', color: '#4b5563', marginTop: '8px' }}>
                  Press Enter to send • Shift + Enter for new line
                </div>
              </form>
            </div>
          </>
        )}

        {sidebarTab === 'files' && (
          <>
            {/* Explorer Header */}
            <div style={{ padding: '20px 16px', borderBottom: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Folder size={16} className="text-[#ef4444]" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.05em' }}>WORKSPACE FILES</span>
              </div>
              <span style={{ fontSize: '9px', color: '#4b5563' }}>Explore and select files in your project</span>
            </div>

            {/* File List / Tree */}
            <div className="flex-1 overflow-y-auto" style={{ padding: '8px 0', boxSizing: 'border-box' }}>
              {fileTree.length > 0 ? (
                fileTree.map(node => renderFileNode(node))
              ) : (
                <div style={{ fontSize: '10px', color: '#3f3f46', textAlign: 'center', marginTop: '32px', padding: '0 12px', lineHeight: '1.6' }}>
                  GENERATE AN APP TO EXPLORE FILES
                </div>
              )}
            </div>
          </>
        )}

        {sidebarTab === 'history' && (
          <>
            {/* Project History Header */}
            <div style={{ padding: '20px 16px', borderBottom: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={16} className="text-[#ef4444]" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.05em' }}>PROJECT HISTORY</span>
              </div>
              <span style={{ fontSize: '9px', color: '#4b5563' }}>Manage and load your saved generations</span>
            </div>

            {/* Project History list */}
            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
                <p className="text-xs text-gray-500">Sign in to save your workspace progress and view past conversations.</p>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-[#ef4444] text-white text-xs py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 text-xs">
                No projects saved yet. Create a generation to start!
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto" style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box' }}>
                {projects.map((proj) => {
                  const isCurrent = currentProjectId === proj.id;
                  return (
                    <div 
                      key={proj.id}
                      onClick={() => loadProject(proj.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: isCurrent ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #1f2937',
                        backgroundColor: isCurrent ? 'rgba(239, 68, 68, 0.04)' : '#0a0a0b',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      className="hover:border-gray-700 group"
                    >
                      <span style={{ fontSize: '12.5px', fontWeight: 550, color: isCurrent ? '#ef4444' : '#e8e8e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '20px' }}>
                        {proj.title || 'Untitled Project'}
                      </span>
                      <span style={{ fontSize: '9px', color: '#4b5563' }}>
                        Updated {new Date(proj.updated_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => deleteProject(e, proj.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#ef4444]"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4b5563',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="Delete project"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Sandbox Preview Panel (Middle) */}
      <div 
        className="flex-col bg-[#050505] relative z-10" 
        style={{ 
          display: isMobile && mobileActiveTab !== 'preview' ? 'none' : 'flex',
          flex: isMobile ? 'none' : 1,
          width: isMobile ? '100%' : 'auto',
          height: isMobile ? 'calc(100% - 60px)' : '100%',
          boxSizing: 'border-box' 
        }}
      >
        {/* Header */}
        <div style={{ 
          height: '56px', 
          borderBottom: '1px solid #1f2937', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: isMobile ? '0 28px' : '0 24px', 
          flexShrink: 0, 
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.05em' }}>{projectTitle.toUpperCase()}</span>
            <button 
              onClick={async () => {
                const title = await showCustomPrompt("Enter project title:", projectTitle);
                if (title) setProjectTitle(title);
              }}
              style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: '2px' }}
              className="hover:text-white"
              title="Edit Title"
            >
              <Edit3 size={11} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Viewport size selectors */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#000000', border: '1px solid #1f2937', borderRadius: '8px', padding: '2px', boxSizing: 'border-box' }}>
                {([
                  { mode: 'desktop', icon: <Monitor size={12} /> },
                  { mode: 'tablet', icon: <Tablet size={12} /> },
                  { mode: 'mobile', icon: <Smartphone size={12} /> }
                ] as const).map(({ mode, icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewportMode(mode)}
                    style={{
                      backgroundColor: viewportMode === mode ? '#1f1f23' : 'transparent',
                      color: viewportMode === mode ? '#ffffff' : '#4b5563',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} viewport`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}

            {/* Export buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={handleDownload}
                disabled={files.length === 0}
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxSizing: 'border-box'
                }}
                className="hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Export <ChevronDown size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* View Selection Tabs */}
        <div style={{ height: '40px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 28px' : '0 24px', backgroundColor: 'rgba(9, 9, 10, 0.4)', flexShrink: 0, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: '20px', height: '100%', alignItems: 'center' }}>
            <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
              PREVIEW
              <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', backgroundColor: '#ef4444' }} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => {
                if (previewHtml) {
                  const blob = new Blob([previewHtml], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                }
              }}
              style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              className="hover:text-white"
              title="Open preview in new tab"
              disabled={files.length === 0}
            >
              <ExternalLink size={12} />
            </button>
            <button 
              onClick={() => setRefreshKey(prev => prev + 1)}
              style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              className="hover:text-white"
              title="Refresh sandbox preview"
            >
              <RotateCw size={12} />
            </button>
          </div>
        </div>

        {/* Iframe Viewport Container */}
        <div style={{ flex: 1, backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', overflow: 'hidden', position: 'relative', boxSizing: 'border-box' }}>
          <div 
            style={{
              width: viewportMode === 'desktop' ? '100%' : viewportMode === 'tablet' ? '768px' : '375px',
              height: '100%',
              transition: 'width 0.3s ease-in-out',
              border: viewportMode === 'desktop' ? 'none' : '1px solid #1f2937',
              borderRadius: viewportMode === 'desktop' ? '0px' : '12px',
              boxShadow: viewportMode === 'desktop' ? 'none' : '0 10px 30px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}
            className="bg-[#0c0c0d] relative"
          >
            {previewTab === 'preview' ? (
              <iframe 
                id="sandbox-iframe"
                key={`${previewHtml.length}-${refreshKey}`} 
                srcDoc={previewHtml} 
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full border-0 animate-fade-in" 
                title="Sandbox Preview" 
              />
            ) : (
              <div className="w-full h-full flex flex-col bg-[#0c0c0d] font-sans">
                {/* Fake Browser Toolbar */}
                <div style={{ height: '40px', backgroundColor: '#141416', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px', flexShrink: 0, boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', opacity: 0.8 }}></span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308', opacity: 0.8 }}></span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', opacity: 0.8 }}></span>
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#000000', border: '1px solid #1f2937', borderRadius: '4px', height: '24px', padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: '10px', color: '#4b5563', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    http://localhost:3000/
                  </div>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <iframe 
                    key={`${previewHtml.length}-${refreshKey}-browser`} 
                    srcDoc={previewHtml} 
                    sandbox="allow-scripts allow-same-origin"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                    title="Browser Sandbox" 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Explorer & Code Panel (Right side) */}
      <div 
        className="flex flex-col bg-[#080809]" 
        style={{ 
          width: isMobile ? '100%' : '480px', 
          height: isMobile ? 'calc(100% - 60px)' : '100%', 
          borderLeft: isMobile ? 'none' : '1px solid #1f2937', 
          display: isMobile && mobileActiveTab !== 'code' ? 'none' : 'flex',
          flexShrink: 0, 
          boxSizing: 'border-box' 
        }}
      >
        {/* Header Tabs */}
        <div style={{ height: '56px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 28px' : '0 16px', flexShrink: 0, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: '20px', height: '100%', alignItems: 'center' }}>
            <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
              CODE
              <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', backgroundColor: '#ef4444' }} />
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={handleCopy} 
              disabled={!activeFile} 
              style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: '6px' }}
              className="hover:text-white disabled:opacity-20 disabled:cursor-not-allowed" 
              title="Copy active code"
            >
              <Copy size={13} />
            </button>

          </div>
        </div>

        {/* Panel Content (Explorer and Code splits) */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', boxSizing: 'border-box' }}>
          {/* Explorer left side-split */}
          {isMobile && mobileCodeView === 'explorer' && (
            <div style={{ width: isMobile ? '100%' : '210px', height: '100%', borderRight: isMobile ? 'none' : '1px solid #1f2937', backgroundColor: '#08080a', display: 'flex', flexDirection: 'column', flexShrink: 0, boxSizing: 'border-box' }}>
              <div style={{ height: isMobile ? '56px' : '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: isMobile ? '0 28px' : '0 16px', flexShrink: 0, backgroundColor: '#070709', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#4b5563', letterSpacing: '0.1em' }}>EXPLORER</span>
              </div>
              <div className="flex-1 overflow-y-auto" style={{ padding: '8px 0', boxSizing: 'border-box' }}>
                {fileTree.length > 0 ? (
                  fileTree.map(node => renderFileNode(node))
                ) : (
                  <div style={{ fontSize: '10px', color: '#3f3f46', textAlign: 'center', marginTop: '32px', padding: '0 12px', lineHeight: '1.6' }}>
                    GENERATE AN APP TO EXPLORE FILES
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Code Editor right side-split */}
          {(!isMobile || mobileCodeView === 'editor') && (
            <div style={{ flex: 1, height: '100%', backgroundColor: '#0c0c0e', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
              <div style={{ height: isMobile ? '56px' : '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 28px' : '0 16px', flexShrink: 0, backgroundColor: '#070709', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isMobile && (
                    <button 
                      onClick={() => setMobileCodeView('explorer')}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 550, cursor: 'pointer', paddingRight: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      &larr; Files
                    </button>
                  )}
                  <span style={{ fontSize: '10px', color: '#a1a1aa', fontFamily: 'monospace' }}>{activeFile ? activeFile.name : 'No file open'}</span>
                </div>
                {activeFile && (
                  <span style={{ fontSize: '9px', color: '#52525b', fontFamily: 'monospace' }}>{activeFile.content.length} chars</span>
                )}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', backgroundColor: '#0c0c0e', boxSizing: 'border-box' }}>
              {activeFile ? (
                <div style={{ display: 'flex', fontFamily: 'var(--font-poppins), "Poppins", "Inter", -apple-system, sans-serif', fontSize: '15px', lineHeight: '26px', minHeight: '100%' }}>
                  {/* Line numbers gutter */}
                  <div 
                    style={{ 
                      padding: '16px 12px 16px 16px', 
                      textAlign: 'right', 
                      color: '#4b5563', 
                      borderRight: '1px solid rgba(249, 115, 22, 0.2)', 
                      backgroundColor: '#08080a',
                      userSelect: 'none',
                      minWidth: '40px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {activeFile.content.split('\n').map((_, idx) => (
                      <div key={idx} style={{ height: '26px' }}>{idx + 1}</div>
                    ))}
                  </div>
                  {/* Code content */}
                  <div 
                    style={{ 
                      padding: '16px', 
                      flex: 1, 
                      overflowX: 'auto', 
                      minWidth: 0,
                      color: '#e4e4e7',
                      whiteSpace: 'pre',
                      boxSizing: 'border-box'
                    }}
                  >
                    {activeFile.content.split('\n').map((line, idx) => (
                      <div key={idx} style={{ height: '26px' }}>{line || ' '}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#3f3f46', userSelect: 'none' }}>
                  <FileCode size={20} className="stroke-[1.2]" />
                  <span style={{ fontSize: '12px' }}>No code file selected</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

        {/* Status bar */}
        <div style={{ height: '32px', borderTop: '1px solid #1f2937', backgroundColor: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 28px' : '0 16px', fontSize: '9px', color: '#4b5563', fontFamily: 'monospace', flexShrink: 0, boxSizing: 'border-box' }}>
          <div>Ln 1, Col 1</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>Spaces: 2</div>
            <div>UTF-8</div>
            <div>LF</div>
            <div>JavaScript JSX</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>Prettier</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div 
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            backgroundColor: '#09090a',
            borderTop: '1px solid #1f2937',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 50,
            boxSizing: 'border-box'
          }}
        >
          {[
            { id: 'prompt', label: 'Prompt', icon: <MessageSquare size={18} /> },
            { id: 'preview', label: 'Preview', icon: <Monitor size={18} /> },
            { id: 'code', label: 'Code', icon: <Folder size={18} /> }
          ].map(tab => {
            const isActive = mobileActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMobileActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: isActive ? '#ef4444' : '#4b5563',
                  cursor: 'pointer',
                  padding: '8px',
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'color 0.2s ease',
                  boxSizing: 'border-box'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom Popup Modal */}
      {modalConfig && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]"
          style={{ boxSizing: 'border-box' }}
        >
          <div 
            className="w-full max-w-[400px] bg-[#09090a] border border-zinc-800/80 rounded-2xl p-6 shadow-2xl animate-[zoomIn_0.15s_ease-out] flex flex-col gap-4 text-left mx-4"
            style={{ boxSizing: 'border-box' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/40">
              <span className="text-sm font-semibold text-white tracking-tight">{modalConfig.title}</span>
              <button 
                onClick={() => {
                  if (modalConfig.onCancel) {
                    modalConfig.onCancel();
                  } else {
                    modalConfig.onConfirm();
                  }
                }}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Message */}
            <p className="text-zinc-300 text-sm leading-relaxed my-1">
              {modalConfig.message}
            </p>

            {/* Prompt Input Field */}
            {modalConfig.type === 'prompt' && (
              <input 
                type="text"
                value={promptVal}
                onChange={(e) => setPromptVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    modalConfig.onConfirm(promptVal);
                  }
                }}
                className="w-full px-3.5 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ef4444] text-white placeholder:text-zinc-500 text-sm transition-all"
                autoFocus
              />
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {modalConfig.type !== 'alert' && (
                <button
                  onClick={() => {
                    if (modalConfig.onCancel) modalConfig.onCancel();
                  }}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/60 hover:text-white text-zinc-300 rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-98"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => {
                  if (modalConfig.type === 'prompt') {
                    modalConfig.onConfirm(promptVal);
                  } else {
                    modalConfig.onConfirm();
                  }
                }}
                className="px-4 py-2 bg-[#ef4444] hover:bg-red-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-98"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
