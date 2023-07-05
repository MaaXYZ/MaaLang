import { $, $$ } from '@/pipeline'

const { EmptyTask, OtherTask } = $()

EmptyTask.$ = {
  base: 'abc',
  next: [OtherTask]
}

OtherTask.$ = EmptyTask

export default $$()
