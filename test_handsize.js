const effect = "受けるダメージを3点軽減する。6点までのダメージを受ける場合、ダメージを無効化する。イニシアチブ-3。手札上限-1。◆ジョブカード";
const matchMinus = effect.match(/手札上限\s*[\-ー\-－]\s*([0-9０-９]+)/);
console.log("Match:", matchMinus);
if (matchMinus) {
    const val = parseInt(matchMinus[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
    console.log("Value:", val);
}
