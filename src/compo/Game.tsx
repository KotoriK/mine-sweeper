import { Component, createRef, MouseEvent, } from "react";
import { MineGame, } from "../game";
import { cleanPool, Coordinate, MineMatrix, TILE_STATUS } from "../mine";
import MinePool from "./MinePool";
import { createUseStyles, } from 'react-jss'
import { Classes } from 'jss'
import LabeledInputField from "./LabeledInputField";
import Timer from "./Timer";
import { loadInitStateFromLocalStorage, saveInitStateFromLocalStorge as saveInitStateToLocalStorge } from "../helper";
export interface GameState {
    height: number, width: number, mineAmount: number, minePool: MineMatrix, status: 'ready' | 'win' | 'fail' | 'gaming',
    startTime: number, mineMayRemain
}
const useStyles = createUseStyles(
    {
        toolbar: {
            display: "flex",
            "& > *": {
                paddingRight: '5px'
            }
        },
        game: {
            font: '15px 500 "Robot"',
        }
    }
)
const StyleProvider = (props: { children: (classes: Classes) => React.ReactElement }) => props.children(useStyles())
export interface GameInitState{
    height: number
    width: number
    mineAmount: number
}
export interface GameProp {
    initState?: GameInitState
}
export default class Game extends Component<GameProp, GameState>  {

    constructor(prop: GameProp) {
        super(prop)
        const { height = 10, width = 8, mineAmount = 10 } = prop.initState ?? loadInitStateFromLocalStorage() ??{}
        this.createGame(height, width, mineAmount)
        this.state = {
            height, width, mineAmount, minePool: this.game.minePool, status: 'ready', startTime: 0, mineMayRemain: mineAmount
        }
        this.widthInput = createRef<HTMLInputElement>()
        this.heightInput = createRef<HTMLInputElement>()
        this.mineAmountInput = createRef<HTMLInputElement>()

    }
    destroyGame() {
        cleanPool(this.game.minePool)
        this.game.offAllEvent()
        this.game = null
    }
    createGame(height: number, width: number, mineAmount: number) {
        this.game = new MineGame(height, width, mineAmount)
            .on('start', () => {
                this.setState({ status: 'gaming', startTime: Date.now() })
            })
            .on('win', () => {
                console.log('win')
                this.setState({ status: 'win' })
            })
            .on('fail', () => {
                console.log('fail')
                this.setState({ status: 'fail' })
                setTimeout(() => {
                    this.game.discoverAll()
                    this.refreshState()
                }, 1000)
            })
    }
    widthInput: React.RefObject<HTMLInputElement>
    heightInput: React.RefObject<HTMLInputElement>
    mineAmountInput: React.RefObject<HTMLInputElement>
    game: MineGame
    onTileClicked(pos: Coordinate, mouseEvent: MouseEvent, tileStatus: TILE_STATUS) {
        if (this.game.ended) return
        mouseEvent.stopPropagation()
        mouseEvent.preventDefault()
        /**按下左键 */
        if (mouseEvent.button == 0) {
            if (mouseEvent.ctrlKey == true) {
                this.game.specialCheck(pos)
            } else {
                this.game.check(pos)
            }
        }
        /**按下右键 */
        else if (mouseEvent.button == 2) {
            if (!this.game.started) { return }
            switch (tileStatus) {
                case TILE_STATUS.none:
                    this.game.flag(pos)
                    break
                case TILE_STATUS.flagged:
                    this.game.question(pos)
                    break
                case TILE_STATUS.questioned:
                    this.game.clear(pos)
            }
        }
        this.refreshState()
    }
    onApplyClicked() {
        this.onResetClicked()
        this.setState({
            width: parseInt(this.widthInput.current.value),
            height: parseInt(this.heightInput.current.value),
            mineAmount: parseInt(this.mineAmountInput.current.value),

        }, () => {
            this.destroyGame()
            this.createGame(this.state.height, this.state.width, this.state.mineAmount)
            saveInitStateToLocalStorge({
                height:this.state.height,
                width:this.state.width,
                mineAmount:this.state.mineAmount
            })
            this.refreshState()
        })
    }
    refreshState() {
        this.setState({ minePool: this.game.minePool, mineMayRemain: this.game.mineMayRemain })
    }
    onResetClicked() {
        this.game.reset()
        this.refreshState()
        this.setState({
            startTime: 0,
            status: 'ready'
        })
    }
    onCopyPoolClicked(){
        navigator.clipboard.writeText(this.game.savePool())
    }
    render() {
        const runTimer = this.state.status == 'gaming'
        return <StyleProvider>

            {styles => <div className={styles.game}>
                <p>Status now:{this.state.status}, time passed:{<Timer startTime={this.state.startTime} run={runTimer} />}, mine remained: {this.state.mineMayRemain}</p>
                <div className={styles.toolbar}>
                    <LabeledInputField ref={this.widthInput} caption="width" defaultValue={this.state.width.toString()} />
                    <LabeledInputField ref={this.heightInput} caption="height" defaultValue={this.state.height.toString()} />
                    <LabeledInputField ref={this.mineAmountInput} caption="mine amount" defaultValue={this.state.mineAmount.toString()} />
                    <button onClick={this.onApplyClicked.bind(this)}>Apply</button>
                    <button onClick={this.onResetClicked.bind(this)}>Reset</button>
                    <button onClick={this.onCopyPoolClicked.bind(this)}>Save Pool</button>
                </div>
                <MinePool pool={this.state.minePool} onTileClicked={this.onTileClicked.bind(this)}></MinePool>
            </div>}

        </StyleProvider>
    }
}