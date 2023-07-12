type OneOrArray<T> = T | T[]

type Rect = [number, number, number, number]

type ArrayFixLength<T, N extends number> = readonly T[] & { length: N }

type JsonValue =
  | null
  | number
  | string
  | boolean
  | JsonValue[]
  | {
      [key: string]: JsonValue
    }

type TemplateThresholdPair<N extends number> = {
  /**
   * 模板图片路径，绝对、相对均可
   *
   * 必选
   */
  template: ArrayFixLength<string, N> | [never]

  /**
   * 模板匹配阈值
   *
   * 可选，默认 0.7
   */
  threshold: ArrayFixLength<number, N & {}> | [never]
}

// RUST和GO发来贺电
type TemplateThreshold =
  | TemplateThresholdPair<1>
  | TemplateThresholdPair<2>
  | TemplateThresholdPair<3>
  | TemplateThresholdPair<4>
  | TemplateThresholdPair<5>
  | TemplateThresholdPair<6>
  | TemplateThresholdPair<7>
  | TemplateThresholdPair<8>

type TaskGeneral = {
  /**
   * 任务名
   *
   * 必选
   *
   * 任务的名称
   */
  name?: string

  /**
   * 基任务名
   *
   * 可选，默认无
   *
   * 若有，则所有没写的属性字段都使用基任务的值
   */
  base?: string

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
   * 接下来要执行的任务列表
   *
   * 可选，默认空
   *
   * 按序识别每个任务，只执行第一个识别到的
   */
  next?: OneOrArray<TaskInfoHandler>

  /**
   * 
   * 是否是子任务。
   * 
   * 可选，默认否。
   * 
   * 如果是子任务，执行完本任务（及后续 next 等）后，会返回最近的 **非子任务** 继续执行。
   * 
   */
  is_sub?: boolean

  /**
   * 超时时间，毫秒
   *
   * 默认`20 * 1000`
   */
  timeout?: number

  /**
   * 超时后执行的任务列表
   *
   * 可选，默认空
   */
  timeout_next?: OneOrArray<TaskInfoHandler>

  /**
   * 任务执行次数
   *
   * 可选，默认`UINT_MAX`
   */
  times_limit?: number

  /**
   * 任务执行次数达到了后执行的任务列表
   *
   * 可选，默认空
   */
  runout_next?: OneOrArray<TaskInfoHandler>

  /**
   * 识别到 到 执行动作前 的延迟，毫秒
   *
   * 可选，默认`200`
   *
   * 推荐尽可能增加中间过程任务，少用延迟，不然既慢还不稳定
   */
  pre_delay?: number

  /**
   * 执行动作后 到 下一个步骤 的延迟，毫秒
   *
   * 可选，默认`500`
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
   * 产生同步回调消息。
   *
   * 可选，默认空，即不产生。
   */
  notification?: string
}

type Recognition =
  | {
      /**
       * 识别算法类型
       *
       * 可选，默认`DirectHit`
       *
       * - *DirectHit*: 直接命中，即不进行识别，直接执行动作
       * - *TemplateMatch*: 模板匹配，即“找图”
       * - *OCR*: 文字识别
       */
      recognition?: 'DirectHit'
    }
  | ({
      recognition: 'TemplateMatch'

      /**
       * 模板匹配算法，即 cv::TemplateMatchModes
       *
       * 可选，默认 3
       *
       * 仅支持 1、3、5，可简单理解为越大的越精确，但也会更慢
       *
       * 详情请参考 [OpenCV 官方文档](https://docs.opencv.org/4.x/df/dfb/group__imgproc__object.html)
       */
      method?: 1 | 3 | 5

      /**
       * 是否进行绿色掩码
       *
       * 可选，默认 false
       *
       * 若为 true，可以将图片中不希望匹配的部分涂绿 RGB: (0, 255, 0)，则不对绿色部分进行匹配
       */
      green_mask?: boolean
    } & (
      | {
          /**
           * 模板图片路径，绝对、相对均可
           *
           * 必选
           */
          template: string | string[]

          /**
           * 模板匹配阈值
           *
           * 可选，默认 0.8
           */
          threshold?: number
        }
      | TemplateThreshold
    ))
  | {
      recognition: 'OCR'

      /**
       * 要匹配的文字，支持正则
       *
       * 必选
       */
      text: string | string[]

      /**
       * 部分文字识别结果不准确，进行替换
       *
       * 可选
       */
      replace?: [string, string] | [string, string][]

      /**
       * 是否仅识别（不进行检测，需要精确设置 roi）
       *
       * 可选，默认 false
       */
      only_rec?: boolean
    }

type Action =
  | {
      /**
       * 执行的动作
       *
       * 可选，默认`DoNothing`
       *
       * - *DoNothing*: 什么都不做
       * - *Click*: 点击
       * - *Swipe*: 滑动
       * - *WaitFreezes*: 等待画面静止需连续 `frozen_time` 毫秒 画面 **没有较大变化** 才会退出动作
       * - *StartApp*: 启动App
       * - *StopApp*: 停止App
       */
      action?: 'DoNothing'
    }
  | {
      action: 'Click'

      /**
       * 点击的位置
       *
       * 可选，默认 true
       *
       * - *true*: 点击本任务中刚刚识别到的目标
       * - *string*: 填写任务名，点击之前执行过的某任务识别到的目标
       * - *array<int, 4>*: 点击固定坐标区域内随机一点，[x, y, w, h]，若希望全屏可设为 [0, 0, 0, 0]
       */
      target?: true | TaskInfoHandler | Rect
    }
  | {
      action: 'Swipe'

      /**
       * 滑动起点
       *
       * 可选，默认 true
       *
       * - *true*: 点击本任务中刚刚识别到的目标
       * - *string*: 填写任务名，点击之前执行过的某任务识别到的目标
       * - *array<int, 4>*: 点击固定坐标区域内随机一点，[x, y, w, h]，若希望全屏可设为 [0, 0, 0, 0]
       */
      begin?: true | TaskInfoHandler | Rect

      /**
       * 滑动终点
       *
       * 必选
       *
       * - *true*: 点击本任务中刚刚识别到的目标
       * - *string*: 填写任务名，点击之前执行过的某任务识别到的目标
       * - *array<int, 4>*: 点击固定坐标区域内随机一点，[x, y, w, h]，若希望全屏可设为 [0, 0, 0, 0]
       */
      end: true | TaskInfoHandler | Rect

      /**
       * 滑动持续时间，单位毫秒
       *
       * 可选，默认 200
       */
      duration?: number
    }
  | {
      action: 'WaitFreezes'

      /**
       * 连续 frozen_time 毫秒 画面 *没有较大变化* 才会退出动作
       *
       * 可选，默认 5000
       */
      frozen_time?: number

      /**
       * 等待的目标
       *
       * 可选，默认 true
       *
       * - *true*: 点击本任务中刚刚识别到的目标
       * - *string*: 填写任务名，点击之前执行过的某任务识别到的目标
       * - *array<int, 4>*: 点击固定坐标区域内随机一点，[x, y, w, h]，若希望全屏可设为 [0, 0, 0, 0]
       */
      target?: true | TaskInfoHandler | Rect

      /**
       * 判断“没有较大变化”的模板匹配阈值
       *
       * 可选，默认 0.95
       */
      threshold?: number

      /**
       * 判断“没有较大变化”的模板匹配算法，即 cv::TemplateMatchModes
       *
       * 可选，默认 3
       *
       * 仅支持 1、3、5，可简单理解为越大的越精确，但也会更慢
       *
       * 详情请参考 [OpenCV 官方文档](https://docs.opencv.org/4.x/df/dfb/group__imgproc__object.html)
       */
      method?: 1 | 3 | 5
    }
  | {
      action: 'StartApp'

      /**
       * 启动入口
       *
       * 可选，默认空
       *
       * 需要填入 activity，例如 `com.hypergryph.arknights/com.u8.sdk.U8UnityContext`
       *
       * 若为空，将启动 `MaaControllerSetOption` - `MaaCtrlOption_DefaultAppPackageEntry` 设置的入口
       */
      package: string
    }
  | {
      action: 'StopApp'

      /**
       * 要关闭的程序
       *
       * 可选，默认空
       *
       * 需要填入 package name，例如 `com.hypergryph.arknights`
       *
       * 若为空，将关闭 `MaaControllerSetOption` - `MaaCtrlOption_DefaultAppPackage` 设置的 APP
       */
      package: string
    }
  | {
      action: 'CustomTask'

      /**
       * 任务名
       *
       * bixuan
       *
       * 同 `MaaRegisterCustomTask` 接口传入的任务名
       */
      custom_task: string

      /**
       * 任务参数
       *
       * 可选，默认空json，即`{}`
       *
       * 任意json类型，通过 `MaaCustomTaskAPI.set_param` 传入json string
       */
      custom_param?: Record<string, JsonValue>
    }

export type TaskInfo = TaskGeneral & Recognition & Action

export type TaskInfoHandler = {
  $: TaskInfo
  $next: TaskInfoHandler
  $timeout_next: TaskInfoHandler
  $runout_next: TaskInfoHandler
}
