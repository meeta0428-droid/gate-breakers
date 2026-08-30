import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 一旦、追加したライトニングボアの処理を削除
old_part = """                    if (s.card.name === 'ライトニングボア') {
                        logMsg('【ライトニングボアの効果】自身がダメージを受けたため、対象へ「1点」のダメージを返す！', 'important');
                        if (typeof enemyHp !== 'undefined') enemyHp -= 1;
                        if (typeof showDamagePopup === 'function') showDamagePopup(1);
                    }
                    
                    if (pendingDamage <= 0) {"""
content = content.replace(old_part, "                    if (pendingDamage <= 0) {")

# それぞれの分岐（破壊、耐え切る）の中に明示的に追加する
old_destroy = """                            player.deck.void.push(s.card);
                            logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                        }"""
new_destroy = """                            player.deck.void.push(s.card);
                            logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                        }
                        
                        if (s.card.name === 'ライトニングボア') {
                            logMsg('【ライトニングボアの効果】自身がダメージを受けたため、対象へ「1点」のダメージを返す！', 'important');
                            if (typeof enemyHp !== 'undefined') enemyHp -= 1;
                            if (typeof showDamagePopup === 'function') showDamagePopup(1);
                        }"""
content = content.replace(old_destroy, new_destroy)

old_survive = """                        // 耐え切る
                        pendingDamage = 0;
                        logMsg(`「${s.card.name}」でダメージを受け止めた！`, 'important');
                    }"""
new_survive = """                        // 耐え切る
                        pendingDamage = 0;
                        logMsg(`「${s.card.name}」でダメージを受け止めた！`, 'important');
                        
                        if (s.card.name === 'ライトニングボア') {
                            logMsg('【ライトニングボアの効果】自身がダメージを受けたため、対象へ「1点」のダメージを返す！', 'important');
                            if (typeof enemyHp !== 'undefined') enemyHp -= 1;
                            if (typeof showDamagePopup === 'function') showDamagePopup(1);
                        }
                    }"""
content = content.replace(old_survive, new_survive)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("app_v6.js boar fix done.")
