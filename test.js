const effect = "イニシアチブタイミングで使用する。イニシアチブ＋４。この効果は捨札にある間は戦闘中持続する。";

const isDiscardOnly = effect.includes('捨札にある間') && effect.includes('持続');
const isBattleLong = effect.includes('戦闘中持続する') && !effect.includes('捨札にある間');

console.log('isDiscardOnly:', isDiscardOnly);
console.log('isBattleLong:', isBattleLong);

let total = 0;
if (isBattleLong || (true /*!isVoid*/ && isDiscardOnly)) {
    const matchPlus = effect.match(/イニシアチブ\s*[＋\+]\s*(\d+)/);
    console.log('matchPlus:', matchPlus);
    if (matchPlus) total += parseInt(matchPlus[1]);
}
console.log('total:', total);
