declare type ID = string | number

interface PromiseOnPendingOptions {
  id?: ID

  /**
   * 用于延迟 Promise 实例删除，
   * 如果为 undefined，则在 promise 状态改变之后立即删除
   *
   * Used to delay the deletion of Promise instance,
   * if it is undefined, the promise will be deleted immediately after the state changed
   * */
  delayTime?: number
}

declare class Singleton {
  static ids: Map<any, any>

  /**
   * @desc 返回 id 对应的一个对象
   *
   *       Return a singleton of any object(such as Promise, Function, Object...) corresponding to the id
   * */
  static any<T = any>(id: ID, defaultValue: any): T

  /**
   * @desc 保证一个 id 对应的 promise 在同一时间只存在一个，
   *       并且生成 promise 的函数在 promise pending 状态的时间段内只执行一次，
   *       这个方法可以用来减少同一时间的多余请求
   *
   *       Ensure that only one promise corresponding to the id exists at the same time,
   *       and the function that generates the promise executes only once
   *       during the period of promise pending.
   *       This method can be used to reduce redundant requests at the same time
   * */
  static promiseOnPending<T = any>(
    proFn: () => Promise<T>,
    options: PromiseOnPendingOptions,
  ): Promise<T>

  /**
   * @desc 封装 setInterval 函数，
   *       保证同一个 id 对应的计时器只有一个在运行，
   *       并且返回一个清除计时器的函数，方便随时终止计时器
   *
   *       A wrapper of the setInterval function,
   *       make sure only one timer for the same id is running,
   *       and returns a function to clear the timer so it can be terminated at any time
   * */
  static runInterval(id: ID, createFn: Function): () => void

  /**
   * @desc 保证传入的函数在程序的运行期间只运行一次
   *
   *       Ensure that the incoming function runs only once during the run time of the program
   * */
  static onceRun(fn: Function, id?: any): void
}

export default Singleton
