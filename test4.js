let baseSize = 3;
const activeCards = [
    { effect: '場に配置されている召喚ユニット1体を指定。指定したユニットの強度と同じ値をイニシアチブに足す。◆ジョブカード' }
];
for (const card of activeCards) {
    const matchPlus = card.effect.match(/手札上限\s*[＋\+]\s*([0-9０-９]+)/);
    if (matchPlus) baseSize += parseInt(matchPlus[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
    
    const matchMinus = card.effect.match(/手札上限\s*[\-ー\-－]\s*([0-9０-９]+)/);
    if (matchMinus) baseSize -= parseInt(matchMinus[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
}
print(baseSize);
