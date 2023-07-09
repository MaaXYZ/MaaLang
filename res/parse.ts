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

const splitKeys = ['next', 'timeout_next', 'runout_next']

function parse_name(key: string): [string, string, string | null] {
  const match = /^(.+)\.([^.#]+)(?:#(.+))?$/.exec(key)
  if (!match) {
    console.warn('Unknown key', key)
    return ['', '', null]
  }
  return [match[1], match[2], match[3] ?? null]
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

  const splitInfo: Record<string, undefined | string | string[]> = {}

  for (const key in result) {
    const [scope, name, subk] = parse_name(key)
    if (!scope) {
      continue
    }
    if (subk) {
      splitInfo[key] = result[key][subk]
      continue
    }
    if (!(scope in scopeInfo)) {
      scopeInfo[scope] = { import: {}, names: [] }
    }
    const info = scopeInfo[scope]

    info.names.push(name)

    for (const sk of refKeys) {
      let v = (result[key] as any)[sk] as undefined | string | string[]
      if (!(v instanceof Array)) {
        v = v ? [v] : []
      }
      for (const k of v) {
        const [ss, sn] = parse_name(k)
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

    const resolveRef = (name: string) => {
      const [s, n, sk] = parse_name(name)
      const tail = sk ? `.$${sk}` : ''
      if (s === scope) {
        return n + tail
      } else {
        return `${s}.${n}`.replace('.', '$') + tail
      }
    }

    for (const task of info.names) {
      output.push(`${task}.$ = {`)
      const fullName = `${scope}.${task}`
      const data = result[fullName] as Record<string, unknown>
      for (const key in data) {
        if (splitKeys.includes(key)) {
          const ref = `${fullName}#${key}`
          const val =
            ref in splitInfo ? splitInfo[ref] : (data[key] as string | string[])
          if (!val) {
            continue
          }
          if (val instanceof Array) {
            output.push(`  ${key}: [ ${val.map(resolveRef).join(', ')} ],`)
          } else {
            output.push(`  ${key}: [ ${resolveRef(val)} ],`)
          }
        } else if (refKeys.includes(key)) {
          const val = data[key] as true | string | number[]
          if (typeof val === 'string') {
            output.push(`  ${key}: ${resolveRef(val)},`)
          } else {
            output.push(`  ${key}: ${JSON.stringify(val)},`)
          }
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
