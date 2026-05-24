export interface Project {
  id: string;
  name: string;
  description: string;
  runtime: string;
  created_at: string;
  updated_at: string;
  file_count: number;
  size_bytes: number;
}

export interface ProjectFile {
  name: string;
  path: string;
  size_bytes: number;
  is_dir: boolean;
  modified_at: string;
}

export interface GPUInfo {
  name: string;
  memory_total_mb: number;
  memory_used_mb: number;
  memory_free_mb: number;
  utilization_percent: number;
  temperature_c: number | null;
  power_w: number | null;
}

export interface GPUMetrics {
  available: boolean;
  gpus: GPUInfo[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  runtime: string;
  created_at: string;
}

export type RuntimeType = 'pytorch' | 'tensorflow' | 'cnn' | 'cuda' | 'jupyter';

export interface ExecutionMessage {
  type: 'stdout' | 'status' | 'error';
  data?: string;
  message?: string;
}
