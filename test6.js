let baseSize = 3;
const activeCards = [
    { effect: '自身の召喚ユニットを廃棄札から手札へ移動する。この効果は戦闘中に1度しか使えない。◆ジョブカード' }
];
for (const card of activeCards) {
    const matchPlus = card.effect.match(/手札上限\s*[＋\+]\s*([0-9０-９]+)/);
    if (matchPlus) baseSize += parseInt(matchPlus[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
    
    const matchMinus = card.effect.match(/手札上限\s*[\-ー\-－]\s*([0-9０-９]+)/);
    if (matchMinus) baseSize -= parseInt(matchMinus[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
}
print(baseSize);
