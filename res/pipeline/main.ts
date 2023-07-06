import { $, $$ } from '@/pipeline'

const { EmptyTask, OtherTask } = $()

OtherTask.$ = {
  next: [EmptyTask],
  action: 'WaitFreezes'
}

EmptyTask.$ = {
  action: 'Click',
  target: OtherTask
}

export default $$()
