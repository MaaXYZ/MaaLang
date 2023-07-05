type OneOrArray<T> = T | T[]

type Rect = [number, number, number, number]

export type TaskInfo = {
  /**
   * 任务名
   *
   * 必选
   *
   * 任务的名称
   */
  name: string

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
  roi?: OneOrArray<Rect>

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
  next?: OneOrArray<TaskInfo>

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
  timeout_next?: OneOrArray<TaskInfo>

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
  runout_next?: OneOrArray<TaskInfo>

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
