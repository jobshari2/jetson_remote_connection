import { useEffect, useState } from 'react'
import { useGPUStore } from '../stores/gpuStore'
import { Activity, Thermometer, Zap, Memory, Cpu, RefreshCw } from 'lucide-react'

export default function GPUMetrics() {
  const metrics = useGPUStore(s => s.metrics)
  const fetchMetrics = useGPUStore(s => s.fetchMetrics)

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [fetchMetrics])

  if (!metrics || !metrics.available) {
    return (
      <div className="bg-surface-900 rounded-lg border border-surface-700 p-4">
        <div className="flex items-center gap-2 text-surface-400">
          <Cpu size={16} />
          <span className="text-sm">GPU not detected</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-900 rounded-lg border border-surface-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
          <Activity size={16} className="text-emerald-400" />
          GPU Metrics
        </h3>
        <button onClick={fetchMetrics} className="p-1 hover:bg-surface-700 rounded">
          <RefreshCw size={12} className="text-surface-400" />
        </button>
      </div>

      {metrics.gpus.map((gpu, i) => (
        <div key={i} className="space-y-3">
          <div className="text-xs font-medium text-surface-300">{gpu.name}</div>

          <div>
            <div className="flex justify-between text-xs text-surface-400 mb-1">
              <span className="flex items-center gap-1"><Cpu size={12} /> Utilization</span>
              <span>{gpu.utilization_percent}%</span>
            </div>
            <div className="w-full bg-surface-700 rounded-full h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                style={{ width: `${gpu.utilization_percent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-surface-400 mb-1">
              <span className="flex items-center gap-1"><Memory size={12} /> Memory</span>
              <span>{gpu.memory_used_mb}MB / {gpu.memory_total_mb}MB</span>
            </div>
            <div className="w-full bg-surface-700 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(gpu.memory_used_mb / gpu.memory_total_mb) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-4 text-xs text-surface-400">
            {gpu.temperature_c != null && (
              <span className="flex items-center gap-1"><Thermometer size={12} /> {gpu.temperature_c}°C</span>
            )}
            {gpu.power_w != null && (
              <span className="flex items-center gap-1"><Zap size={12} /> {gpu.power_w}W</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
