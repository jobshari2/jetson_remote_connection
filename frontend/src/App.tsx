import { Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore } from './stores/themeStore'
import Dashboard from './pages/Dashboard'
import ProjectWorkspace from './pages/ProjectWorkspace'

export default function App() {
  const dark = useThemeStore(s => s.dark)

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="h-screen flex flex-col bg-surface-950 text-surface-100 overflow-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectWorkspace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
