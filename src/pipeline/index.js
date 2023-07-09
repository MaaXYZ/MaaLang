const tasks = {}

const process_keys = [
  'next',
  'timeout_next',
  'runout_next',
  'target',
  'begin',
  'end'
]

function checkFloat(n, k, v) {
  if (v - Math.floor(v) > 0) {
    console.warn(n, k, v, 'is float number; rounded')
  }
  if (v < 0) {
    console.warn(n, k, v, 'is negative; set to 0')
    v = 0
  }
  return Math.round(v)
}

function checkRect(n, r) {
  return r.map(x => {
    if (x - Math.floor(x) > 0) {
      console.warn(n, 'rect', r, 'contains float number; rounded')
    }
    return Math.round(x)
  })
}

function checkThres(n, v) {
  if (v instanceof Array) {
    return v.map(x => {
      if (x < 0 || x > 1) {
        console.warn(n, 'threshold', x, 'is not in [0, 1], set to 0.8')
        return 0.8
      } else {
        return x
      }
    })
  } else {
    if (v < 0 || v > 1) {
      console.warn(n, 'threshold', v, 'is not in [0, 1], set to 0.8')
      return 0.8
    } else {
      return v
    }
  }
}

export function $(module) {
  return new Proxy(
    {},
    {
      get(_, name) {
        name = `${module}.${name}`
        const t = {
          name
        }
        if (name in tasks) {
          console.warn('task', name, 'already declared')
        }
        tasks[name] = t
        return new Proxy(t, {
          set(target, key, value) {
            if (key !== '$') {
              return false
            }
            for (const k in value) {
              let v = value[k]
              switch (k) {
                case 'name':
                  v = `${module}.${v}`
                  if (v in tasks) {
                    console.warn('task', v, 'already declared')
                  }
                  target.name = v
                  delete tasks[target.name]
                  tasks[v] = target
                  name = v
                  break
                case 'threshold':
                  target.threshold = checkThres(name, v)
                  break
                case 'text':
                  if (v instanceof Array && v.length === 0) {
                    console.warn(name, 'text array is []')
                  }
                  target.text = v
                  break
                case 'roi':
                case 'target':
                case 'begin':
                case 'end':
                  if (v instanceof Array) {
                    v = checkRect(name, v)
                  }
                  target[k] = v
                  break
                case 'frozen_time':
                case 'timeout':
                case 'times_limit':
                case 'pre_delay':
                case 'post_delay':
                  target[k] = checkFloat(n, k, v)
                  break
                default:
                  target[k] = v
              }
            }
            return false
          },
          get(target, key) {
            const keys = ['$next', '$timeout_next', '$runout_next']
            if (!keys.includes(key)) {
              return target[key]
            }
            return {
              ref: t,
              key: key.substring(1)
            }
          }
        })
      }
    }
  )
}

export function $$() {
  const process = []
  const cache = {}

  const transferItem = x => {
    if (typeof x !== 'object') {
      return x
    }
    if (x.name) {
      return [x.name]
    } else if (x.ref) {
      const k = `${x.ref.name}->${x.key}`
      if (k in cache) {
        return cache[k]
      } else if (process.includes(k)) {
        process.push(k)
        throw 'Loop detected!\n' + process.join(' => ')
      } else {
        process.push(k)
        const res = []
        let raw = x.ref[x.key] ?? []
        if (!(raw instanceof Array)) {
          raw = [raw]
        }
        for (const t of raw) {
          res.push(...transferItem(t))
        }
        cache[k] = res
        process.pop()
        return res
      }
    } else {
      return [x]
    }
  }

  const result = {}

  const metaInfo = x => {
    if (x instanceof Array) {
      return x.map(metaInfo)
    } else if (typeof x === 'object') {
      if (x.name) {
        return {
          ref: x.name
        }
      } else if (x.ref) {
        return {
          refk: x.ref.name,
          key: x.key
        }
      } else {
        return x
      }
    } else {
      return x
    }
  }

  for (const taskName in tasks) {
    const task = tasks[taskName]
    const res = {}
    result[taskName] = res
    for (const key in task) {
      if (process_keys.includes(key)) {
        const val = task[key]
        res[key + '@meta'] = metaInfo(val)
        if (val instanceof Array) {
          res[key] = val.map(transferItem).flat(1)
        } else if (val instanceof Object) {
          res[key] = transferItem(val)[0]
        } else {
          res[key] = val
        }
      } else {
        res[key] = task[key]
      }
    }
  }

  return result
}
