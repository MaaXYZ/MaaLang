import { mkdir, readdir, writeFile } from 'fs/promises'
import { $$ } from '@/pipeline'

async function build_pipeline() {
  for (const path of await readdir('res/pipeline')) {
    if (!/.ts$/.test(path)) {
      continue
    }
    await import(`./pipeline/${path}`)
  }
  await writeFile('dist/pipeline.json', JSON.stringify($$(), null, 2))
}

build_pipeline()
