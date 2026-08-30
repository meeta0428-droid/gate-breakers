const fs = require('fs');
let code = fs.readFileSync('app_v6.js', 'utf8');

// 1. スクラップリサイクルの実装 (召喚ユニットが廃棄された時)
// 召喚ユニットが廃棄札に移動する場所を探す
// els.btnRemoveSummon.addEventListener 内
// updateUI 内の btn-remove-summon など
// 汎用的に triggerHook('onSummonDestroyed') 的なのがあればいいが。

// 手動で捨札から廃棄へ、などもあるが、主に「召喚ユニットの破壊」
// btn-remove-summon のロジックを探す
