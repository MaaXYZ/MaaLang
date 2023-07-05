import { writeFile } from 'fs/promises'
import pipeline_main from './pipeline/main'

const result = {
  'dist/pipeline.main.json': pipeline_main
}

async function main() {
  await Promise.all(
    Object.keys(result).map(path => writeFile(path, result[path]))
  )
}

main()
