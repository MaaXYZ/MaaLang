import { writeFile } from 'fs/promises'
import type { TaskInfo, ProcessedTaskInfo } from './types'

export type { TaskInfo, ProcessedTaskInfo }

type TaskInfoWithProxy = TaskInfo & {
  $: Omit<TaskInfo, 'name'>
}

const tasks: Record<string, TaskInfo> = {}
const process_keys = ['next', 'timeout_next', 'runout_next']

export function $(): Record<string, TaskInfoWithProxy> {
  return new Proxy(
    {},
    {
      get(_, name: string) {
        const t = {
          name
        }
        if (name in tasks) {
          console.warn(name, 'already declared')
        }
        tasks[name] = t
        return new Proxy(t, {
          set(target, key, value) {
            if (key === '$') {
              for (const k in value) {
                if (k === 'name') {
                  continue
                }
                target[k] = value[k]
              }
              return false
            } else {
              if (key === 'name') {
                if (value !== name) {
                  if (value in tasks) {
                    console.warn(value, 'already declared')
                  }
                  tasks[value] = tasks[name]
                  delete tasks[name]
                }
              }
              target[key] = value
              return true
            }
          }
        })
      }
    }
  )
}

export function $$(): ProcessedTaskInfo
export function $$(path: ''): ProcessedTaskInfo
export function $$(path: string): Promise<void>
export function $$(path?: string): ProcessedTaskInfo | Promise<void> {
  const result = JSON.stringify(tasks, (key, value) => {
    if (process_keys.includes(key)) {
      if (value instanceof Array) {
        return value.map(x => x.name)
      } else {
        return value.name
      }
    } else {
      return value
    }
  })

  if (path) {
    return writeFile(path, result)
  } else {
    return JSON.parse(result)
  }
}
