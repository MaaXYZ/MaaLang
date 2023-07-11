import { $ } from '@/pipeline'

import { _import, _other, _task } from './path/of/script/without/suffix/dot/ts'

export const { create, task, here } = $('set.task.scope.here')

task.$ = {
  // put attribs here
}
