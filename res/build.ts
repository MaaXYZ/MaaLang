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
    const obj = $$()
    await mkdir('dist', { recursive: true })
    await writeFile('dist/all.meta.json', JSON.stringify(obj, null, 2))
    await writeFile(
      'dist/all.json',
      JSON.stringify(obj, (key, value) => {
        if (key == 'name') {
            return undefined
        }
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
      }, 2)
    )
  } catch (err) {
    console.error(err)
  }
}

build_pipeline()
