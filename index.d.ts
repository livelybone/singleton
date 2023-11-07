/**
 * 兼容Map接口的Cache
 * 轮换内存里的若干个Map，满了则清空最老的Map
 * - 优点: 快，占有空间最小
 * - 缺点: 不像LRU因为不是per-key维护过期时间，所以不能保证及时的释放
 *
 * 可以用来兜底不会发生内存泄漏。
 */
declare class TransientMap<K, V> {
    private static UNDEFINED_VALUE;
    private maps;
    private currentSlice;
    readonly sliceCount: number;
    private _maxSize;
    private maxSliceSize;
    private itemCount;
    constructor();
    constructor(entries: readonly (readonly [K, V])[] | null, maxSize?: number, sliceCount?: number);
    constructor(maxSize: number);
    constructor(maxSize: number, sliceCount: number);
    shink(): void;
    clear(): void;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    entries(): (readonly [K, V])[];
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
    get size(): number;
    get maxSize(): number;
    set maxSize(v: number);
}

declare type Fn<T = any> = () => T;
/**
 * 每个单例的 id
 *
 * The id of a singleton
 * */
declare type ID = string | number;
interface PromiseOnPendingOptions {
    id?: ID;
    /**
     * 用于延迟 Promise 实例删除，
     * 如果为 undefined，则在 promise 状态改变之后立即删除
     *
     * Used to delay the deletion of Promise instance,
     * if it is undefined, the promise will be deleted immediately after the state changed
     *
     * This option will be deprecated in next version
     * */
    delayTime?: number;
    /**
     * 同 delayTime
     * 推荐使用这个属性
     *
     * As same as delayTime
     * */
    cacheTime?: number;
}
/**
 * @desc 设置单例对象缓存的最大数量
 *
 *       Config maxSize for all singleton instances
 * */
declare function setSingletonMaxSize(maxSize: number): void;
/**
 * @desc 返回 id 对应的一个单例对象
 *
 *       Return a singleton of an object(such as Promise, Function, Object...) corresponding to the id.
 * */
declare function singletonObj<T extends any>(id: ID, defaultValue?: () => T): T;
/**
 * @desc 返回 id 对应的一个单例对象
 *
 *       Return a singleton of an object(such as Promise, Function, Object...) corresponding to the id.
 * */
declare function singleton<T extends any>(id: ID, defaultValue?: () => T): {
    value: T;
    delete(): void;
    update(action: T | ((pre: T) => T)): T;
};
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
declare function promiseOnPending<P extends PromiseLike<any>>(proFn: () => P, options: PromiseOnPendingOptions): P;
/**
 * @desc 封装 setInterval 函数，
 *       保证同一个 id 对应的计时器只有一个在运行，
 *       并且返回一个清除计时器的函数，方便随时终止计时器
 *
 *       A wrapper of the setInterval function,
 *       make sure only one timer for the same id is running,
 *       and returns a function to clear the timer so it can be terminated at any time
 * */
declare function runInterval(id: ID, createFn: Fn): () => void;
/**
 * @desc 保证传入的函数在程序的运行期间只运行一次
 *
 *       Ensure that the incoming function runs only once during the run time of the program
 * */
declare function onceRun(fn: Fn, id?: any): void;

export { PromiseOnPendingOptions, TransientMap, onceRun, promiseOnPending, runInterval, setSingletonMaxSize, singleton, singletonObj };
