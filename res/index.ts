import { mkdir, readdir, writeFile } from 'fs/promises'

async function build_pipeline() {
  const result: Record<string, unknown> = {}
  await mkdir('dist/pipeline', {
    recursive: true
  })
  for (const path of await readdir('res/pipeline')) {
    if (!/.ts$/.test(path)) {
      continue
    }
    const data = (await import(`./pipeline/${path}`)).default
    await writeFile(
      `dist/pipeline/${path.replace('.ts', '.json')}`,
      JSON.stringify(data, null, 2)
    )
    for (const key in data) {
      if (key in result) {
        console.warn('Meet duplicated key', key)
      } else {
        result[key] = data[key]
      }
    }
  }
  await writeFile('dist/pipeline.json', JSON.stringify(result))
}

build_pipeline()
