/**
 * 兼容Map接口的Cache
 * 轮换内存里的若干个Map，每隔一段时间清空最老的Map
 * - 优点: 快，占有空间最小
 * - 缺点: 不像LRU因为不是per-key维护过期时间，所以不能保证及时的释放
 *
 * 可以用来兜底不会发生内存泄漏。
 */
export class TransientMap<K, V> {
  private static UNDEFINED_VALUE = '$_fcm_uv';
  private maps: Map<K, V>[];
  private currentSlice: number;
  public readonly sliceCount: number;
  private _maxSize: number;
  private maxSliceSize: number;
  private itemCount: number;
  constructor();
  constructor(entries: readonly (readonly [K, V])[] | null, maxSize?: number, sliceCount?: number);
  constructor(maxSize: number);
  constructor(maxSize: number, sliceCount: number);
  /**
   * @param entries entries 初始值
   * @param maxSize 最大容量 默认1w
   * @param sliceCount 更大的 sliceCount 会有更及时的内存释放，gc压力小，但单次访问时遍历数增加。
   */
  constructor(...args: any[]) {
    let entries: readonly (readonly [K, V])[] | null;
    let maxSize;
    let sliceCount;
    if (args.length && typeof args[0] === 'number') {
      entries = null;
      [maxSize, sliceCount] = args;
    }else{
      [entries, maxSize, sliceCount] = args;
    }
    if (entries === undefined) {
      entries = null;
    }
    if (maxSize === undefined) {
      maxSize = 10000;
    }
    if (sliceCount === undefined) {
      sliceCount = 2;
    }
    if (sliceCount < 2 || Math.floor(sliceCount) != sliceCount) {
      throw new Error(`FastCacheMap sliceCount must be int >= 2, got ${sliceCount}`);
    }
    if (maxSize < 1 || Math.floor(maxSize) != maxSize || sliceCount > maxSize) {
      throw new Error(`FastCacheMap maxSize must be int >= 1 && >= sliceCount ${sliceCount}, got ${maxSize}`);
    }
    this._maxSize = maxSize;
    this.maxSliceSize = Math.floor(maxSize / sliceCount);
    this.currentSlice = 0;
    this.sliceCount = sliceCount;
    this.maps = [new Map<K, V>(entries)];
    this.itemCount = this.maps[0].size;
    for (let i = 1; i < sliceCount; i++) {
      this.maps.push(new Map<K, V>());
    }
  }
  shink(): void {
    // clear oldest slice
    const nextSlice = (this.currentSlice + 1) % this.sliceCount;
    this.itemCount -= this.maps[nextSlice].size
    this.maps[nextSlice].clear();
    // update currentSlice
    this.currentSlice = nextSlice;
  }
  clear(): void {
    this.maps.forEach((b) => b.clear());
    this.itemCount = 0;
  }
  delete(key: K): boolean {
    for (let i = 0; i < this.sliceCount; i++) {
      if (this.maps[(this.currentSlice + i) % this.sliceCount].delete(key)) {
        this.itemCount --;
        return true;
      }
    }
    return false;
  }
  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    for (let i = 0; i < this.sliceCount; i++) {
      this.maps[(this.currentSlice + i + 1) % this.sliceCount].forEach(callbackfn, thisArg);
    }
  }
  entries() {
    const result: (readonly [K, V])[] = [];
    this.forEach((v,k) => result.push([k, v]));
    return result;
  }
  get(key: K): V | undefined {
    for (let i = 0; i < this.sliceCount; i++) {
      const v = this.maps[(this.currentSlice + i) % this.sliceCount].get(key);
      if (v !== undefined) return (v as any) === TransientMap.UNDEFINED_VALUE ? undefined : v;
    }
    return undefined;
  }
  has(key: K): boolean {
    for (let i = 0; i < this.sliceCount; i++) {
      if (this.maps[(this.currentSlice + i) % this.sliceCount].has(key)) return true;
    }
    return false;
  }
  set(key: K, value: V): this {
    const exist = this.delete(key);
    if (!exist) {
      this.itemCount ++;
      while (this.maps[this.currentSlice].size >= this.maxSliceSize || this.itemCount > this._maxSize) {
        this.shink();
      }
    }
    this.maps[this.currentSlice].set(
      key,
      value === undefined ? (TransientMap.UNDEFINED_VALUE as any) : value,
    );
    return this;
  }
  get size(): number {
    return this.itemCount;
  }
  get maxSize(): number {
    return this._maxSize;
  }
  set maxSize(v: number) {
    if (v < 1 || Math.floor(v) != v || this.sliceCount > v) {
      throw new Error(`FastCacheMap maxSize must be int >= 1 && >= sliceCount ${this.sliceCount}, got ${v}`);
    }
    this._maxSize = v;
    this.maxSliceSize = Math.floor(v / this.sliceCount);
  }
}