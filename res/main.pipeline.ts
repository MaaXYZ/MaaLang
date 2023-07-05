import { $, $$ } from '@/pipeline'

$('OtherTask', () => ({
  next: [EmptyTask]
}))

const EmptyTask = $('EmptyTask', () => ({}))

$$()
