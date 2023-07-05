import { $, $$ } from '@/pipeline'

const { EmptyTask, OtherTask } = $()

OtherTask.$ = {
  next: [EmptyTask]
}

EmptyTask.name = 'NavigateTo1-7'

export default $$()
