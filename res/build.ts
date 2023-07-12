import { mkdir, readdir, writeFile } from 'fs/promises'
import { $$ } from '@/pipeline'

async function build_pipeline() {
  for (const path of await readdir('res/pipeline')) {
    if (!/.ts$/.test(path)) {
      continue
    }
    await import(`./pipeline/${path}`)
  }
  try {
    let dist = 'dist'
    if (process.argv.length >= 3) {
      dist = process.argv[2]
    }
    const obj = $$()
    await mkdir(`${dist}/partial`, { recursive: true })

    const writeObject = async (
      outDir: string,
      fileScope: string,
      obj: unknown
    ) => {
      await writeFile(
        `${outDir}/${fileScope}.meta.json`,
        JSON.stringify(obj, null, 2)
      )
      await writeFile(
        `${outDir}/${fileScope}.json`,
        JSON.stringify(obj, (key, value) => {
          if (value instanceof Array) {
            return value
          } else if (typeof value === 'object') {
            const res = {}
            for (const k in value) {
              if (!k.endsWith('@meta')) {
                res[k] = value[k]
              }
            }
            return res
          } else {
            return value
          }
        })
      )
    }

    await writeObject(dist, 'all', obj)
    const objs: Record<string, Record<string, unknown>> = {}
    for (const k in obj) {
      const m = /^(.+)\.([^.]+)$/.exec(k)
      if (!m) {
        console.warn(`Unknown key: ${k}`)
        continue
      }
      const sc = m[1]
      const kk = m[2]
      if (!(sc in objs)) {
        objs[sc] = {}
      }
      objs[sc][kk] = obj[k]
    }
    for (const sc in objs) {
      await writeObject(`${dist}/partial`, sc, objs[sc])
    }
  } catch (err) {
    console.error(err)
  }
}

build_pipeline()
