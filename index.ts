import { readFileSync } from 'fs'
import ts from 'typescript'

console.log(
  ts.createSourceFile(
    'demo.ts',
    readFileSync('res/pipeline/demo.ts', { encoding: 'utf-8' }),
    ts.ScriptTarget.ESNext
  )
)
