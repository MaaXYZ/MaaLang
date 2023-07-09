import { mkdir, readFile, writeFile } from 'fs/promises'
import path, { join, parse } from 'path'

const refKeys = [
  'next',
  'timeout_next',
  'runout_next',
  'target',
  'begin',
  'end'
]

function parse_name(key: string): [string, string] {
  const match = /^(.+)\.([^.]+)$/.exec(key)
  if (!match) {
    console.warn('Unknown key', key)
    return ['', '']
  }
  return [match[1], match[2]]
}

function fixName(name: string) {
  // return name.replace(/[+-]/g, '_')
  return name
}

async function parse_pipeline() {
  const result: Record<string, unknown> = JSON.parse(
    await readFile('dist/pipeline.json', {
      encoding: 'utf-8'
    })
  )

  const scopeInfo: Record<
    string,
    {
      import: Record<string, Set<string>>
      names: string[]
    }
  > = {}

  for (const key in result) {
    const [scope, name] = parse_name(key)
    if (!scope) {
      continue
    }
    if (!(scope in scopeInfo)) {
      scopeInfo[scope] = { import: {}, names: [] }
    }
    const info = scopeInfo[scope]

    info.names.push(name)

    for (const sk of refKeys) {
      let v = (result[key] as any)[sk]
      if (!(v instanceof Array)) {
        v = v ? [v] : []
      }
      for (const k of v) {
        if (typeof k !== 'object') {
          continue
        }
        const rk = k.ref ?? k.refk ?? null
        if (!rk) {
          return
        }
        const [ss, sn] = parse_name(rk)
        if (!ss || ss === scope) {
          continue
        }
        if (!(ss in info.import)) {
          info.import[ss] = new Set()
        }
        info.import[ss].add(sn)
      }
    }
  }

  for (const scope in scopeInfo) {
    const info = scopeInfo[scope]
    const scopes = scope.split('.')
    const file = scopes.pop()
    const folder = path.join('res', 'pipeline.parse', ...scopes)
    await mkdir(folder, {
      recursive: true
    })
    const output: string[] = ["import { $ } from '@/pipeline'", '']

    for (const other in info.import) {
      const impInfo = info.import[other]
      const impScopes = other.split('.')
      const target = path.join(
        ...Array.from({ length: scopes.length }, () => '..'),
        ...impScopes
      )
      output.push(
        `import { ${Array.from(impInfo)
          .map(x => `${x} as ${other}.${x}`.replace('.', '$'))
          .join(', ')} } from './${target}'`
      )
    }

    output.push('')

    output.push(
      `export const { ${info.names.map(fixName).join(', ')} } = $('${scope}') `,
      ''
    )

    const resolve = (name: string) => {
      const [s, n] = parse_name(name)
      if (s === scope) {
        return n
      } else {
        return `${s}.${n}`.replaceAll('.', '$')
      }
    }

    const resolveRef = (val: any) => {
      if (val instanceof Array) {
        return `[${val.map(resolveRef).join(', ')}]`
      } else if (typeof val === 'object') {
        if (val.ref) {
          return resolve(val.ref)
        } else if (val.refk) {
          return `${resolve(val.refk)}.$${val.key}`
        }
      }
      return JSON.stringify(val)
    }

    for (const task of info.names) {
      output.push(`${task}.$ = {`)
      const fullName = `${scope}.${task}`
      const data = result[fullName] as Record<string, unknown>
      for (const key in data) {
        if (refKeys.includes(key)) {
          const val = data[key + '@meta']
          output.push(`  ${key}: ${resolveRef(val)},`)
        } else if (key.endsWith('@meta')) {
          continue
        } else {
          if (key === 'name') {
            // TODO
            continue
          }
          output.push(`  ${key}: ${JSON.stringify(data[key])},`)
        }
      }

      output.push('}', '')
    }

    await writeFile(`${folder}/${file}.ts`, output.join('\n'))
  }
}

parse_pipeline()
