import { useState, useRef, useEffect } from 'react'
import type { RuntimeType, ExecutionMessage } from '../types'

interface TerminalProps {
  projectId: string
}

export default function Terminal({ projectId }: TerminalProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [runtime, setRuntime] = useState<RuntimeType>('pytorch')
  const wsRef = useRef<WebSocket | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const connect = (action: 'run' | 'stop', code?: string) => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const ws = new WebSocket(`${protocol}//${host}/ws/execution/ws/${projectId}`)

    ws.onopen = () => {
      ws.send(JSON.stringify({ action, code: code || '', runtime }))
      if (action === 'run') setRunning(true)
    }

    ws.onmessage = (event) => {
      const msg: ExecutionMessage = JSON.parse(event.data)
      if (msg.type === 'stdout' && msg.data) {
        setLogs(prev => [...prev, msg.data!])
      } else if (msg.type === 'status' && msg.message) {
        setLogs(prev => [...prev, `[${msg.message}]\n`])
      } else if (msg.type === 'error' && msg.message) {
        setLogs(prev => [...prev, `[ERROR] ${msg.message}\n`])
      }
    }

    ws.onclose = () => setRunning(false)
    ws.onerror = () => setRunning(false)

    wsRef.current = ws
  }

  const runCode = () => {
    setLogs(prev => [...prev, `\n--- Running on ${runtime} ---\n`])
    connect('run', '')
  }

  const stopCode = () => {
    connect('stop')
    setLogs(prev => [...prev, '[Execution stopped]\n'])
  }

  const clearLogs = () => setLogs([])

  return (
    <div className="flex flex-col h-full bg-surface-950">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-surface-700 bg-surface-900">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-surface-300">Terminal</span>
          <select
            value={runtime}
            onChange={(e) => setRuntime(e.target.value as RuntimeType)}
            className="bg-surface-800 text-xs text-surface-200 border border-surface-600 rounded px-1.5 py-0.5"
          >
            <option value="pytorch">PyTorch</option>
            <option value="tensorflow">TensorFlow</option>
            <option value="cnn">CNN</option>
            <option value="cuda">CUDA</option>
            <option value="jupyter">Jupyter</option>
          </select>
        </div>

        <div className="flex gap-1">
          {running ? (
            <button onClick={stopCode} className="px-2 py-0.5 text-xs bg-red-600 hover:bg-red-500 rounded text-white">
              Stop
            </button>
          ) : (
            <button onClick={runCode} className="px-2 py-0.5 text-xs bg-emerald-600 hover:bg-emerald-500 rounded text-white">
              Run
            </button>
          )}
          <button onClick={clearLogs} className="px-2 py-0.5 text-xs bg-surface-700 hover:bg-surface-600 rounded text-surface-300">
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed">
        {logs.length === 0 && (
          <div className="text-surface-500 italic">Ready. Select a runtime and click Run.</div>
        )}
        {logs.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">{line}</div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
