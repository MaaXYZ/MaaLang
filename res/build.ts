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
    await writeFile('dist/pipeline.json', JSON.stringify(obj, null, 2))
  } catch (err) {
    console.error(err)
  }
}

build_pipeline()
