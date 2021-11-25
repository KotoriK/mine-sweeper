import { MineMatrix, Tile, Coordinate, cleanPool, TILE_STATUS } from "./mine";
export type MineGameEvent = 'start' | 'win' | 'fail'
export class MineGame {
    private _eventListeners: Map<string, Set<Function>> = new Map()
    private _emit(eventName: MineGameEvent) {
        this._eventListeners.get(eventName)?.forEach(func => func())
    }
    on(eventName: MineGameEvent, cb: Function) {
        const _listeners = this._eventListeners.get(eventName)
        const hasRegistered = _listeners ? true : false
        const listeners = hasRegistered ? _listeners as Set<Function> : new Set<Function>()
        listeners.add(cb)
        if (!hasRegistered) this._eventListeners.set(eventName, listeners)
        return this
    }
    off(eventName: MineGameEvent, cb: Function) {
        const listeners = this._eventListeners.get(eventName)
        if (listeners) {
            listeners.delete(cb)
        }
        return this
    }
    offAll(eventName: MineGameEvent) {
        this._eventListeners.delete(eventName)
        return this
    }
    offAllEvent() {
        this._eventListeners.clear()
        return this
    }
    height: number
    width: number

    /**
     * 地雷相关统计
     */

    /**地雷总数 */
    mineTotal: number
    mineFlagged: number
    public get mineMayRemain(): number {
        return this.mineTotal - this.mineFlagged;
    }
    /**统计标记正确的雷的数量 */
    mineFlaggedCorrectly: number
    /**
     * 时间相关统计
     */
    /**游戏开始时间 */
    timeStart: number
    timeEnd: number
    /**
     * 指示雷池是加载得到的
     */
    poolLoaded: boolean = false
    private _started: boolean
    public get started(): boolean {
        return this._started
    }
    private _ended: boolean;
    /**
     * 指示这盘游戏是否已经结束，应当用此属性判断是否继续接受用户输入
     */
    public get ended(): boolean {
        return this._ended;
    }
    constructor(height: number, width: number, mineAmount: number) {
        this.height = height
        this.width = width
        this.mineTotal = mineAmount
        this.minePool = initMinePoolFrom(this.height, this.width, makeEmptyInitArray(this.height * this.width))
        this._resetStat()

    }
    minePool: MineMatrix
    private _summonMinePool(func: Function, firstClickPos?: Coordinate) {
        this.minePool = initMinePoolFrom(this.height, this.width, func(this.height, this.width, this.mineTotal, firstClickPos))
    }
    /**
     * 重置
     */
    reset() {
        this._resetStat()
        cleanPool(this.minePool)
        this.minePool = initMinePoolFrom(this.height, this.width, makeEmptyInitArray(this.height * this.width))
        this._ended = false
        this._started = false
        return this
    }
    private _resetStat() {
        this.timeStart = 0
        this.timeEnd = 0

        this.mineFlagged = 0
        this.mineFlaggedCorrectly = 0
    }
    restart(firstClickPos?: Coordinate) {
        this._summonMinePool(makeRandomInitArray, firstClickPos)
        return this.start()
    }
    start() {
        this.timeStart = Date.now()
        this._emit('start')
        this._started = true
        return this
    }
    specialCheck(pos: Coordinate) {
        const tile = this.tileAtPos(pos)
        const [flaggedCount, correctlyFlaggedCount] = Tile.countNeighborFlagged(tile)
        if (flaggedCount == tile.neighborMineCount) {
            if (correctlyFlaggedCount < tile.neighborMineCount) {
                this.fail()
                return
            }
            Tile.checkNeighbor(tile)
        }
    }
    check(pos: Coordinate) {
        if (this._started) {
            if (this.poolLoaded) return
            const tile = this.tileAtPos(pos)
            if (tile.status != TILE_STATUS.questioned && tile.status != TILE_STATUS.flagged) {
                this._check(tile)
            }
        } else {
            this.restart(pos)
            const tile = this.tileAtPos(pos)
            //第一次点击
            Tile.check(tile)
            Tile.checkNeighbor(tile)
        }
        return this
    }
    private _check(tile: Tile) {
        Tile.check(tile)
        if (tile.isMine) this.fail()
        if (tile.neighborMineCount == 0) Tile.checkNeighbor(tile)
    }
    checkNeighbor(pos: Coordinate) {
        const tile = this.tileAtPos(pos)
        Tile.checkNeighbor(tile)
        return this
    }
    flag(pos: Coordinate) {
        const tile = this.tileAtPos(pos)
        Tile.flag(tile)
        this.mineFlagged++
        if (tile.isMine) this.mineFlaggedCorrectly++
        this.checkWin()
        return this
    }
    unflag(tile: Tile) {
        if (tile.status == TILE_STATUS.flagged) {
            this.mineFlagged--
            if (tile.isMine) this.mineFlaggedCorrectly--
        }
        this.checkWin()
        return this
    }
    question(pos: Coordinate) {
        const tile = this.tileAtPos(pos)
        this.unflag(tile)
        Tile.question(tile)
        return this
    }
    clear(pos: Coordinate) {
        const tile = this.tileAtPos(pos)
        this.unflag(tile)
        Tile.clear(tile)
        return this
    }
    tileAtPos(pos: Coordinate) {
        return this.minePool[pos[0]][pos[1]]
    }
    checkWin() {
        if (this.mineFlaggedCorrectly == this.mineTotal) {
            this._win()
        }
    }
    discoverAll() {
        for (const row of this.minePool) {
            for (const tile of row) {
                Tile.discover(tile)
            }
        }
        return this
    }
    private _win() {
        this._emit('win')
        this._end()
    }
    fail() {
        this._emit('fail')
        this._end()
        return this
    }
    private _end() {
        this.timeEnd = Date.now()
        this._ended = true
    }
    savePool() {
        const json = JSON.stringify(this.minePool.map(row => row.map(tile => {
            const { minePool, ...others } = tile
            return { ...others }
        })))
        return btoa(json)
    }
    loadPool(base64encoded: string) {
        const pool: MineMatrix = JSON.parse(atob(base64encoded))
        pool.forEach(row => row.forEach(tile => tile.minePool = pool))
        this.minePool = pool
        this.poolLoaded = true
    }
    /**
     * 重新盖上
     */
    recover() {
        this.minePool.forEach(row => row.forEach(tile => {
            Tile.recover(tile)
        }))
        this.mineFlagged = 0
        this.mineFlaggedCorrectly = 0
    }
}
export const makeRandomInitArray = (length: number, width: number, mineAmount: number, firstClickPos?: Coordinate) => {
    const tileAmount = length * width
    if (mineAmount < 0) throw new Error('mineAmount < 0, get:' + mineAmount)
    if (tileAmount < 0) throw new Error(`tileAmount < 0, get:[${length},${width}](length,width)`)
    if (mineAmount >= tileAmount) throw new Error('tileAmount bigger than or equal to mineAmount')
    const initArray = new Array<boolean>(tileAmount - 1)
    const possibility_tile_is_mine = mineAmount / tileAmount
    //第一次散布
    let mine_placed = 0
    const setTile = (i: number) => {
        if (Math.random() <= possibility_tile_is_mine) {
            mine_placed++
            initArray[i] = true
        } else {
            initArray[i] = false
        }
    }
    for (let i = 0; i < tileAmount; i++) {
        setTile(i)
        if (mine_placed === mineAmount) break
    }
    //第二次散布
    if (mine_placed < mineAmount) {
        for (let i = 0; i < tileAmount; i++) {
            if (initArray[i]) continue
            setTile(i)
            if (mine_placed === mineAmount) break
        }
    }
    //TODO 性能？
    //若第一次点击处有雷，抽取一个幸运方块对换之
    if (firstClickPos && (mineAmount != tileAmount)) {
        const initArray_firstClickPos = firstClickPos[0] * width + firstClickPos[1]
        if (initArray[initArray_firstClickPos]) {
            for (; ;) {
                const rnd_pos = Math.floor(Math.random() * tileAmount)
                if (rnd_pos === initArray_firstClickPos) continue
                if (initArray[rnd_pos] === false) {
                    initArray[rnd_pos] = true
                    break
                }
            }
            initArray[initArray_firstClickPos] = false
        }
    }
    return initArray
}
export const makeEmptyInitArray = (count: number) => new Array(count).fill(0)
export function initMinePoolFrom(height: number, width: number, init_array: boolean[]) {
    const initArray_iterator = init_array.values()
    const minePool = new Array(height)
    for (let i = 0; i < height; i++) {
        const row = new Array(width)
        for (let j = 0; j < width; j++) {
            row[j] = new Tile(minePool, [i, j], initArray_iterator.next().value)
        }
        minePool[i] = row
    }
    return minePool
}
export function transformToInitArray(pool: MineMatrix) {
    return pool.flat().map(tile => tile.isMine ? 1 : 0)
}
export function validate() {

}