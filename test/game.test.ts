import { makeRandomInitArray } from "../src/game"

test('summonMinePool', () => {
    for (let i = 0; i <= 100; i++) {
        const pool = makeRandomInitArray(100, 100, i, [1, 1])
        const mineCount = pool.filter(i => i === true).length
        expect(mineCount).toEqual(i)
        expect(pool[100] === false).toBeTruthy()
    }
})