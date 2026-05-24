import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { useGPUStore } from '../stores/gpuStore'
import GPUMetrics from '../components/GPUMetrics'
import NewProjectModal from '../components/NewProjectModal'
import Sidebar from '../components/Sidebar'
import { FolderOpen, Plus, Trash2, Copy, Cpu, HardDrive } from 'lucide-react'

export default function Dashboard() {
  const projects = useProjectStore(s => s.projects)
  const fetchProjects = useProjectStore(s => s.fetchProjects)
  const deleteProject = useProjectStore(s => s.deleteProject)
  const duplicateProject = useProjectStore(s => s.duplicateProject)
  const fetchStatus = useGPUStore(s => s.fetchStatus)
  const available = useGPUStore(s => s.available)
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
    fetchStatus()
  }, [fetchProjects, fetchStatus])

  const totalSize = projects.reduce((a, p) => a + p.size_bytes, 0)
  const totalFiles = projects.reduce((a, p) => a + p.file_count, 0)

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-surface-400 mt-1">AI GPU Workbench for Jetson Orin</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-surface-900 rounded-lg border border-surface-700 p-4">
              <div className="flex items-center gap-2 text-surface-400 mb-1">
                <FolderOpen size={16} />
                <span className="text-xs uppercase tracking-wide">Projects</span>
              </div>
              <div className="text-2xl font-bold">{projects.length}</div>
            </div>
            <div className="bg-surface-900 rounded-lg border border-surface-700 p-4">
              <div className="flex items-center gap-2 text-surface-400 mb-1">
                <HardDrive size={16} />
                <span className="text-xs uppercase tracking-wide">Total Files</span>
              </div>
              <div className="text-2xl font-bold">{totalFiles}</div>
            </div>
            <div className="bg-surface-900 rounded-lg border border-surface-700 p-4">
              <div className="flex items-center gap-2 text-surface-400 mb-1">
                <Cpu size={16} />
                <span className="text-xs uppercase tracking-wide">GPU Status</span>
              </div>
              <div className={`text-2xl font-bold ${available ? 'text-emerald-400' : 'text-amber-400'}`}>
                {available ? 'Active' : 'Fallback'}
              </div>
            </div>
          </div>

          <GPUMetrics />

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Projects</h2>
            {projects.length === 0 ? (
              <div className="bg-surface-900 border border-surface-700 rounded-lg p-8 text-center text-surface-500">
                <FolderOpen size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No projects yet</p>
                <button onClick={() => setModalOpen(true)} className="mt-2 text-emerald-400 hover:text-emerald-300 text-sm">
                  Create your first project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(p => (
                  <div
                    key={p.id}
                    className="bg-surface-900 border border-surface-700 rounded-lg p-4 hover:border-surface-500 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/project/${p.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{p.name}</h3>
                        <p className="text-xs text-surface-400 mt-0.5 truncate">{p.description || 'No description'}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateProject(p.id) }}
                          className="p-1.5 hover:bg-surface-700 rounded"
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProject(p.id) }}
                          className="p-1.5 hover:bg-surface-700 rounded text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-surface-500">
                      <span>{p.file_count} files</span>
                      <span>{p.runtime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </main>
    </div>
  )
}
