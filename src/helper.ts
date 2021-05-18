import { GameInitState } from "./compo/Game";

export function checkExistAndPush<T>(toArray: Array<T>, element: T) {
    if (typeof element != 'undefined') toArray.push(element)
}
/** 
 *  @author 梁青竹
 * @seealso https://juejin.cn/post/6844903661273874446
 */
export function tco<T extends (...args: any) => any>(f: T) {
    let value: ReturnType<T>
    let active = false
    const accumulated = [];
    return function accumulator(...args) {
        accumulated.push(args);
        if (active == false) {
            active = true;
            while (accumulated.length) {
                value = f.apply(this, accumulated.shift())
            }
            active = false;
            return value;
        }
    }
}
export function loadInitStateFromLocalStorage() {
    try{
            return JSON.parse(localStorage.getItem('_minesweeper'))?.init as GameInitState

    }catch(e){
        console.warn(e)
        return undefined
    }
}
export function saveInitStateFromLocalStorge(init: GameInitState) {
    localStorage.setItem('_minesweeper', JSON.stringify({ init }))
}