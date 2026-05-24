import { useState } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export default function NewProjectModal({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [runtime, setRuntime] = useState('pytorch')
  const createProject = useProjectStore(s => s.createProject)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const project = await createProject(name, description, runtime)
    if (project) {
      setName('')
      setDescription('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-800 border border-surface-600 rounded-lg w-96 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">New Project</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-700 rounded">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-surface-400 mb-1">Project Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-surface-900 border border-surface-600 rounded px-3 py-2 text-sm text-surface-100 placeholder-surface-500"
              placeholder="My AI Project"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-surface-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-surface-900 border border-surface-600 rounded px-3 py-2 text-sm text-surface-100 placeholder-surface-500 resize-none"
              rows={3}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-xs text-surface-400 mb-1">Runtime</label>
            <select
              value={runtime}
              onChange={e => setRuntime(e.target.value)}
              className="w-full bg-surface-900 border border-surface-600 rounded px-3 py-2 text-sm text-surface-100"
            >
              <option value="pytorch">PyTorch</option>
              <option value="tensorflow">TensorFlow</option>
              <option value="cnn">CNN</option>
              <option value="cuda">CUDA Generic</option>
              <option value="jupyter">Jupyter Notebook</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-surface-300 hover:bg-surface-700 rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
