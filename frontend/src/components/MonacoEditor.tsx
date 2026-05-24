import Editor, { OnMount } from '@monaco-editor/react'
import { useEditorStore } from '../stores/editorStore'
import { useThemeStore } from '../stores/themeStore'
import { saveFile } from '../lib/api'
import { X } from 'lucide-react'
import { useCallback, useRef } from 'react'

interface MonacoEditorProps {
  projectId: string
}

export default function MonacoEditor({ projectId }: MonacoEditorProps) {
  const openFiles = useEditorStore(s => s.openFiles)
  const activeFile = useEditorStore(s => s.activeFile)
  const setActiveFile = useEditorStore(s => s.setActiveFile)
  const closeFile = useEditorStore(s => s.closeFile)
  const updateFileContent = useEditorStore(s => s.updateFileContent)
  const dark = useThemeStore(s => s.dark)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  const activeContent = openFiles.find(f => f.path === activeFile)

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.py')) return 'python'
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript'
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript'
    if (filename.endsWith('.json')) return 'json'
    if (filename.endsWith('.html')) return 'html'
    if (filename.endsWith('.css')) return 'css'
    if (filename.endsWith('.md')) return 'markdown'
    if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return 'yaml'
    if (filename.endsWith('.sh')) return 'shell'
    if (filename.endsWith('.cpp') || filename.endsWith('.cu')) return 'cpp'
    return 'plaintext'
  }

  const handleChange = useCallback((value: string | undefined) => {
    if (!activeFile || !value) return

    updateFileContent(activeFile, value)

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveFile(projectId, activeFile, value)
    }, 1000)
  }, [activeFile, projectId, updateFileContent])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center bg-surface-900 border-b border-surface-700 overflow-x-auto">
        {openFiles.map(f => (
          <div
            key={f.path}
            onClick={() => setActiveFile(f.path)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs cursor-pointer border-r border-surface-700 whitespace-nowrap ${
              activeFile === f.path ? 'bg-surface-800 text-emerald-400' : 'text-surface-400 hover:bg-surface-800'
            }`}
          >
            <span>{f.path.split('/').pop()}</span>
            <button
              onClick={(e) => { e.stopPropagation(); closeFile(f.path) }}
              className="p-0.5 hover:bg-surface-600 rounded"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {openFiles.length === 0 && (
          <div className="px-3 py-1.5 text-xs text-surface-500">No files open</div>
        )}
      </div>

      <div className="flex-1">
        {activeContent ? (
          <Editor
            key={activeContent.path}
            defaultLanguage={getLanguage(activeContent.path)}
            language={getLanguage(activeContent.path)}
            value={activeContent.content}
            onChange={handleChange}
            theme={dark ? 'vs-dark' : 'light'}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              tabSize: 4,
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-surface-500 text-sm">
            Select a file to edit
          </div>
        )}
      </div>
    </div>
  )
}
