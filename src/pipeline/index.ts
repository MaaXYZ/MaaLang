import fs from 'fs/promises'

type Rect = [number, number, number, number]

type TaskInfo = {
  /**
   * 基任务名
   *
   * 可选，默认无
   *
   * 若有，则所有没写的属性字段都使用基任务的值
   */
  base?: string

  /**
   * 识别算法类型
   *
   * 可选，默认`DirectHit`
   */
  recognition?:
    | 'DirectHit'
    | 'TemplateMatch'
    | 'OcrDetAndRec'
    | 'OcrOnlyRec'
    | 'FreezesWait'

  /**
   * 识别区域坐标
   *
   * 可选，默认全屏
   *
   * 四个值分别为`[x, y, w, h]`
   */
  roi?: Rect | Rect[]

  /**
   * 是否缓存
   *
   * 可选，默认关
   *
   * 缓存当次识别到的位置，下次只在该位置识别
   */
  cache?: boolean

  /**
   * 执行的动作
   *
   * 可选，默认`DoNothing`
   */
  action?:
    | 'DoNothing'
    | 'ClickSelf'
    | 'ClickRegion'
    | 'SwipeSelf'
    | 'SwipeRegion'

  /**
   * 接下来要执行的任务列表
   *
   * 可选，默认空
   *
   * 按序识别每个任务，只执行第一个识别到的
   */
  next?: Promise<Task> | Promise<Task>[]

  /**
   * 超时时间，毫秒
   *
   * 默认`10 * 1000`
   */
  timeout?: number

  /**
   * 超时后执行的任务列表
   *
   * 可选，默认空
   */
  timeout_next?: Promise<Task> | Promise<Task>[]

  /**
   * 任务执行次数
   *
   * 可选，默认`UINT_MAX`
   */
  run_times?: number

  /**
   * 任务执行次数达到了后执行的任务列表
   *
   * 可选，默认空
   */
  runout_next?: Promise<Task> | Promise<Task>[]

  /**
   * 识别到 到 执行动作前 的延迟，毫秒
   *
   * 可选，默认`0`
   *
   * 推荐尽可能增加中间过程任务，少用延迟，不然既慢还不稳定
   */
  pre_delay?: number

  /**
   * 执行动作后 到 下一个步骤 的延迟，毫秒
   *
   * 可选，默认`0`
   *
   * 推荐尽可能增加中间过程任务，少用延迟，不然既慢还不稳定
   */
  post_delay?: number

  /**
   * 当前任务是否为检查点
   *
   * 可选，默认否
   */
  checkpoint?: boolean

  /**
   * 是否产生同步回调消息
   *
   * 可选，默认否
   */
  notify?: boolean
}

class Task {
  name: string
  info: TaskInfo

  constructor(n: string, i: TaskInfo) {
    this.name = n
    this.info = i
  }
}

function poll<T>(f: () => T) {
  return new Promise<T>(resolve => {
    process.nextTick(() => {
      resolve(f())
    })
  })
}

async function getName(
  i?: Promise<Task> | Promise<Task>[]
): Promise<string | string[] | undefined> {
  if (!i) {
    return undefined
  } else if (i instanceof Array) {
    return (await Promise.all(i)).map(x => x.name)
  } else {
    return (await i).name
  }
}

const tasks: Promise<Task>[] = []

export function $(name: string, i: () => TaskInfo) {
  let r: any
  tasks.push(
    new Promise(resolve => {
      r = resolve
    })
  )

  return poll(() => {
    const t = new Task(name, i())
    r(t)
    return t
  })
}

export async function $$(path = 'pipeline.json') {
  const res: Record<string, unknown> = {}
  for (const t of await Promise.all(tasks)) {
    const i: any = t.info
    i.next = await getName(i.next)
    i.timeout_next = await getName(i.timeout_next)
    i.runout_next = await getName(i.runout_next)
    res[t.name] = i
  }
  fs.writeFile(path, JSON.stringify(res, null, 4))
}
