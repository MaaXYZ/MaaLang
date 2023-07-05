import { writeFile } from 'fs/promises'
import { TaskInfo } from './types'

type TaskInfoWithProxy = TaskInfo & {
  $: Omit<TaskInfo, 'name'>
}

const tasks: Record<string, TaskInfo> = {}

export function $(): Record<string, TaskInfoWithProxy> {
  return new Proxy(
    {},
    {
      get(_, key: string) {
        const t = {
          name: key
        }
        tasks[key] = t
        return new Proxy(t, {
          set(target, key, value) {
            if (key === '$') {
              for (const k in value) {
                target[k] = value[k]
              }
              return false
            } else {
              target[key] = value
              return true
            }
          }
        })
      }
    }
  )
}

export function $$(): string
export function $$(path: ''): string
export function $$(path: string): Promise<void>
export function $$(path?: string): string | Promise<void> {
  const process_keys = ['next', 'timeout_next', 'runout_next']
  const result = JSON.stringify(
    tasks,
    (key, value) => {
      if (process_keys.includes(key)) {
        if (value instanceof Array) {
          return value.map(x => x.name)
        } else {
          return value.name
        }
      } else {
        return value
      }
    },
    4
  )

  if (path) {
    return writeFile(path, result)
  } else {
    return result
  }
}
