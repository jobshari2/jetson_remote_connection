import { NavLink } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { useEffect } from 'react'

export default function Sidebar() {
  const projects = useProjectStore(s => s.projects)
  const fetchProjects = useProjectStore(s => s.fetchProjects)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return (
    <aside className="w-60 bg-surface-900 border-r border-surface-700 flex flex-col h-full">
      <div className="p-4 border-b border-surface-700">
        <h1 className="text-lg font-bold text-emerald-400">GPU Workbench</h1>
        <p className="text-xs text-surface-400 mt-0.5">NVIDIA Jetson Platform</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `block px-3 py-2 rounded text-sm mb-1 ${isActive ? 'bg-surface-700 text-emerald-400' : 'text-surface-300 hover:bg-surface-800'}`
          }
        >
          Dashboard
        </NavLink>

        <div className="text-xs text-surface-500 uppercase px-3 py-2 mt-2 font-semibold">Projects</div>
        {projects.map(p => (
          <NavLink
            key={p.id}
            to={`/project/${p.id}`}
            className={({ isActive }) =>
              `block px-3 py-1.5 rounded text-sm truncate mb-0.5 ${isActive ? 'bg-surface-700 text-emerald-400' : 'text-surface-300 hover:bg-surface-800'}`
            }
          >
            {p.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-surface-700 text-xs text-surface-500">
        AI GPU Workbench v1.0
      </div>
    </aside>
  )
}
