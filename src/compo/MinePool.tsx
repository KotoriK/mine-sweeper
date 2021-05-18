import {  MineMatrix } from "../mine";
import TileCompo, { TileClickHandler } from "./Tile";

export interface MinePoolProp {
    pool: MineMatrix
    onTileClicked:TileClickHandler
}
export default function MinePool({ pool,onTileClicked }: MinePoolProp) {

    return <table onContextMenu={(e)=>e.preventDefault()}>
        <tbody>
            {pool.map(
                (row,row_id) => <tr key={row_id}>{row.map(
                    tile => <td key={tile.id}><TileCompo tile={tile} onClick={onTileClicked}/></td>)}</tr>)
            }
        </tbody>
    </table>
}