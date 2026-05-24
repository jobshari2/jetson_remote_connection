import { useEffect, useState } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { useEditorStore } from '../stores/editorStore'
import { uploadFiles } from '../lib/api'
import { Folder, File, ChevronRight, ChevronDown, Upload, Plus } from 'lucide-react'

interface FileBrowserProps {
  projectId: string
}

export default function FileBrowser({ projectId }: FileBrowserProps) {
  const files = useProjectStore(s => s.files)
  const fetchFiles = useProjectStore(s => s.fetchFiles)
  const openFile = useEditorStore(s => s.openFile)
  const activeFile = useEditorStore(s => s.activeFile)
  const [currentPath, setCurrentPath] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      await uploadFiles(`/projects/${projectId}/upload`, droppedFiles)
      fetchFiles(projectId, currentPath)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  useEffect(() => {
    fetchFiles(projectId, currentPath)
  }, [projectId, currentPath, fetchFiles])

  const handleFileClick = async (path: string) => {
    const res = await fetch(`/api/projects/${projectId}/file?path=${encodeURIComponent(path)}`)
    const data = await res.json()
    openFile(path, data.content)
  }

  const handleUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = async () => {
      if (input.files) {
        await uploadFiles(`/projects/${projectId}/upload`, input.files)
        fetchFiles(projectId, currentPath)
      }
    }
    input.click()
  }

  const pathParts = currentPath ? currentPath.split('/') : []

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-700 bg-surface-900">
        <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-1 text-xs font-semibold text-surface-300">
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          Files
        </button>
        <div className="flex gap-1">
          <button onClick={handleUpload} className="p-1 hover:bg-surface-700 rounded" title="Upload files">
            <Upload size={14} />
          </button>
          <button className="p-1 hover:bg-surface-700 rounded" title="New file">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div
          className={`flex-1 overflow-y-auto p-1 ${dragOver ? 'bg-surface-800 border-2 border-dashed border-emerald-500' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {pathParts.length > 0 && (
            <button
              onClick={() => setCurrentPath(pathParts.slice(0, -1).join('/'))}
              className="flex items-center gap-1 px-2 py-1 text-xs text-surface-400 hover:bg-surface-800 rounded w-full"
            >
              ..
            </button>
          )}

          {files.map(f => (
            <div
              key={f.path}
              onClick={() => f.is_dir ? setCurrentPath(f.path) : handleFileClick(f.path)}
              className={`flex items-center gap-2 px-2 py-1 text-xs cursor-pointer rounded ${
                activeFile === f.path ? 'bg-surface-700 text-emerald-400' : 'text-surface-300 hover:bg-surface-800'
              }`}
            >
              {f.is_dir ? <Folder size={14} className="text-amber-400" /> : <File size={14} className="text-blue-400" />}
              <span className="truncate">{f.name}</span>
            </div>
          ))}

          {files.length === 0 && (
            <div className="text-xs text-surface-500 px-2 py-4 text-center">
              No files yet. Upload or create one.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
