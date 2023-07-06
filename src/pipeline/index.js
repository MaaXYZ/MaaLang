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

export function $() {
  return new Proxy(
    {},
    {
      get(_, name) {
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
                  if (v in tasks) {
                    console.warn('task', name, 'already declared')
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
          }
        })
      }
    }
  )
}

export function $$() {
  const result = JSON.stringify(tasks, (key, value) => {
    if (process_keys.includes(key)) {
      if (value instanceof Array && value.length > 0 && value[0].name) {
        return value.map(x => x.name)
      } else if (value instanceof Object && value.name) {
        return value.name
      } else {
        return value
      }
    } else {
      return value
    }
  })

  return JSON.parse(result)
}
