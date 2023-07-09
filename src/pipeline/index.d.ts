import type { TaskInfo, TaskInfoHandler } from './taskinfo'

export type { TaskInfo, TaskInfoHandler }

export declare function $(module: string): Record<string, TaskInfoHandler>
export declare function $$(): Record<string, unknown>
