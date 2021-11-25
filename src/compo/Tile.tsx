import {  MouseEvent, useState } from 'react'
import { Coordinate, Tile, TILE_STATUS } from '../mine'
import { createUseStyles } from 'react-jss'
import clsx from 'clsx'
export interface TileProps {
    tile: Tile
    onClick: TileClickHandler
}
export type TileClickHandler = (pos: Coordinate, mouseEvent: MouseEvent, tileStatus: TILE_STATUS) => void
const NUMBER_COLOR = ["#1976D2"
    , "#388E3C"
    , "#D32F2F"
    , "#7B1FA2"
    , "#FF8F00"
    , "#0097A7"
    , "#424242"
    , "#9E9E9E"]
const useStyles = createUseStyles({
    tile: {
        backgroundColor: 'gray',
        width: '20px', height: '20px',
        '&.discovered': {
            backgroundColor: 'bisque',
            ...Object.fromEntries(NUMBER_COLOR.map((color, index) => ['&.n' + (index + 1), { color }]))
        }, '&:not(.discovered).pressed': {
            backgroundColor: 'whitesmoke'
        }
    }
})
export default function TileCompo({ tile: { discovered, status, neighborMineCount, pos }, onClick }: TileProps) {
    const styles = useStyles()
    const [pressed, setPressed] = useState(false)
    let content = ''
    let extra_className
    switch (status) {
        case TILE_STATUS.flagged:
            content = '🚩'
            break
        case TILE_STATUS.number:
            //@ts-ignore
            content = neighborMineCount
            extra_className = 'n' + content
            break
        case TILE_STATUS.questioned:
            content = '?'
            break
        case TILE_STATUS.mine:
            content = '💣'
            break
        case TILE_STATUS.misflagged:
            content = '😅'
            break
        case TILE_STATUS.flagged | TILE_STATUS.mine:
            content = '😊'
    }
    return <div className={clsx(styles.tile, discovered && 'discovered', extra_className, pressed && 'pressed')}
        onPointerUp={(e) => {
            setPressed(false)
            onClick(pos, e, status)
        }} 
        onPointerDown={()=> {
            setPressed(true)
        }} 
        onPointerLeave={()=>{
            setPressed(false)
        }}>{content}</div>
}