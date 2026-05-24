import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import Sidebar from '../components/Sidebar'
import FileBrowser from '../components/FileBrowser'
import MonacoEditor from '../components/MonacoEditor'
import Terminal from '../components/Terminal'
import GPUMetrics from '../components/GPUMetrics'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { ArrowLeft, Cpu, Monitor, Play } from 'lucide-react'

export default function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setCurrentProject = useProjectStore(s => s.setCurrentProject)
  const fetchProjects = useProjectStore(s => s.fetchProjects)
  const currentProject = useProjectStore(s => s.currentProject)
  const [showGPU, setShowGPU] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProjects()
      const found = useProjectStore.getState().projects.find(p => p.id === id)
      if (found) setCurrentProject(found)
    }
    return () => setCurrentProject(null)
  }, [id, fetchProjects, setCurrentProject])

  if (!id) return null

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-4 py-2 bg-surface-900 border-b border-surface-700">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-1 hover:bg-surface-700 rounded">
              <ArrowLeft size={16} />
            </button>
            <h2 className="text-sm font-semibold">{currentProject?.name || 'Project'}</h2>
            {currentProject && (
              <span className="text-xs bg-surface-800 text-surface-400 px-2 py-0.5 rounded">{currentProject.runtime}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGPU(!showGPU)}
              className={`p-1.5 rounded ${showGPU ? 'bg-emerald-600 text-white' : 'text-surface-400 hover:bg-surface-700'}`}
              title="GPU Metrics"
            >
              <Cpu size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex">
          <div className="w-52 border-r border-surface-700 bg-surface-900 flex-shrink-0">
            <FileBrowser projectId={id} />
          </div>

          <div className="flex-1 flex flex-col">
            <PanelGroup direction="vertical">
              <Panel defaultSize={65} minSize={30}>
                <MonacoEditor projectId={id} />
              </Panel>
              <PanelResizeHandle className="h-1 bg-surface-700 hover:bg-surface-500 transition-colors cursor-row-resize" />
              <Panel defaultSize={35} minSize={15}>
                <Terminal projectId={id} />
              </Panel>
            </PanelGroup>
          </div>

          {showGPU && (
            <div className="w-64 border-l border-surface-700 bg-surface-900 p-3 flex-shrink-0 overflow-y-auto">
              <GPUMetrics />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
