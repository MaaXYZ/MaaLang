import { $, $$ } from '@/pipeline'

const { EmptyTask, OtherTask } = $()

EmptyTask.$ = {
  base: 'abc',
  next: [OtherTask]
}

export default $$()
