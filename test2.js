const effect = "ダメージを1点軽減する。コスト3までの捨札を1枚山札に戻す。";
const returnMatch = effect.match(/コスト(\d+)までの捨札を(\d+)枚山札に戻す/);
console.log(returnMatch);
