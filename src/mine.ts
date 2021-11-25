import { checkExistAndPush, tco } from "./helper"

/**
 * [row,col]
 */
export type Coordinate = [number, number]
export type MineMatrix = Array<Array<Tile>>

/**
 * 描述方块的视觉状态
 */
export enum TILE_STATUS {
    /**空标记 */
    none = 0,
    /**被标记为雷 */
    flagged = 0b100,
    /**被怀疑是雷 */
    questioned = 0b010,
    /**显示数字 */
    number = 0b1,
    /**显示雷 */
    mine = 0b1000,
    /**错误标记的 */
    misflagged = 0b1001
}

export class Tile {
    id: string
    discovered: boolean = false
    status: TILE_STATUS = TILE_STATUS.none
    readonly pos: Coordinate
    minePool: MineMatrix
    readonly isMine: boolean
    /**
     * -1:未计算，0:显示为空白方块，1~8:周围一格范围内地雷的数目
     */
    neighborMineCount: number = -1
    constructor(pool: MineMatrix, pos: Coordinate, isMine: boolean) {
        this.minePool = pool
        this.pos = pos
        this.id = `${pos[0]}x${pos[1]}`
        this.isMine = isMine
    }
    static getAllNeighbors(tile: Tile) {
        const { minePool } = tile
        const pos_row = tile.pos[0], pos_col = tile.pos[1]
        const upperRow = minePool[pos_row - 1],
            currentRow = minePool[pos_row],
            netherRow = minePool[pos_row + 1]
        const neighbors: Array<Tile> = []
        if (upperRow) {
            checkExistAndPush(neighbors, upperRow[pos_col - 1])
            neighbors.push(upperRow[pos_col])
            checkExistAndPush(neighbors, upperRow[pos_col + 1])
        }
        checkExistAndPush(neighbors, currentRow[pos_col - 1])
        checkExistAndPush(neighbors, currentRow[pos_col + 1])
        if (netherRow) {
            checkExistAndPush(neighbors, netherRow[pos_col - 1])
            neighbors.push(netherRow[pos_col])
            checkExistAndPush(neighbors, netherRow[pos_col + 1])
        }
        return neighbors
    }
    /**
     * 计算周围一格内地雷的数量，并更新neighborMineCount
     * @param _neighbors 内部参数，若之前已经调用过getAllNeighbors()，通过此参数避免本函数内部再次调用。
     * @sideeffect 更新neighborMineCount
     * @returns 周围一格内地雷的数量
     */
    static countNeighborMine(tile: Tile, _neighbors?: Tile[]) {
        let mineCount = 0
        const neighbors = _neighbors ?? Tile.getAllNeighbors(tile)
        for (const tile of neighbors) {
            if (tile.isMine) mineCount++
        }
        tile.neighborMineCount = mineCount
        return mineCount
    }
    /**
     * 
     * @param tile 
     * @param _neighbors 
     * @returns [flaggedCount,correctlyFlaggedCount]
     */
    static countNeighborFlagged(tile: Tile, _neighbors?: Tile[]) {
        let flaggedCount = 0
        let correctlyFlaggedCount = 0
        const neighbors = _neighbors ?? Tile.getAllNeighbors(tile)
        for (const tile of neighbors) {
            if (tile.status == TILE_STATUS.flagged) {
                flaggedCount++
                if (tile.isMine) {
                    correctlyFlaggedCount++
                }
            }
        }
        return [flaggedCount, correctlyFlaggedCount]
    }
    /**
     * 设置旗子标记
     * @param tile 
     * @returns 
     */
    static flag(tile: Tile) {
        if (tile.discovered) {
            return
        }
        tile.status = TILE_STATUS.flagged
    }
    /**
     * 设置疑问标记
     * @param tile 
     * @returns 
     */
    static question(tile: Tile) {
        if (tile.discovered) {
            return
        }
        tile.status = TILE_STATUS.questioned
    }
    /**
     * 清除标记
     * @param tile 
     * @returns 
     */
    static clear(tile: Tile) {
        if (tile.discovered) {
            return
        }
        tile.status = TILE_STATUS.none
    }
    /**
     * 踩！
     * @param tile 
     * @returns 
     */
    static check(tile: Tile) {
        if (tile.discovered) {
            return
        }
        tile.discovered = true
        if (tile.isMine) { tile.status = TILE_STATUS.mine; return }
        if (tile.neighborMineCount == -1) Tile.countNeighborMine(tile)
        if (tile.neighborMineCount == 0) {
            tile.status = TILE_STATUS.none
        } else {
            tile.status = TILE_STATUS.number
        }
    }
    /**
     * 忽略而直接显示
     * @param tile 
     */
    static discover(tile: Tile) {
        tile.discovered = true
        if (tile.status != TILE_STATUS.number) {
            if (tile.isMine) {
                if (tile.status == TILE_STATUS.flagged) {
                    tile.status |= TILE_STATUS.mine
                } else {
                    tile.status = TILE_STATUS.mine
                }
            }
            else {
                if (tile.status == TILE_STATUS.flagged)
                    tile.status = TILE_STATUS.misflagged
                else tile.status = TILE_STATUS.none
            }
        }
    }
    static recover(tile:Tile){
        tile.discovered=false
        tile.status=TILE_STATUS.none
    }
    static checkNeighbor = tco((tile: Tile, _neighbors?: Tile[]) => {
        const neighbors = _neighbors ?? Tile.getAllNeighbors(tile)
        neighbors.forEach(neighbor => {
            if (!neighbor.discovered && !neighbor.isMine) {
                if (neighbor.neighborMineCount == -1) Tile.countNeighborMine(neighbor)
                Tile.check(neighbor)
                if (neighbor.neighborMineCount == 0) {
                    Tile.checkNeighbor(neighbor)
                }
            }
        })
    })
}
export function cleanPool(pool: MineMatrix) {
    for (const i of pool) {
        for (const j of i) {
            j.minePool = null
        }
    }
}