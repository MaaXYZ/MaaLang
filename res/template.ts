import { $ } from '@/pipeline'

export const { task, task2, task3, task4, task5 } = $('')

task.$ = {
  next: [task2, task3]
}

task4.$ = {
  next: [task5]
}
