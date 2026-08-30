import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                    } else {
                        // 耐え切る
                        pendingDamage = 0;
                        logMsg(`「${s.card.name}」でダメージを受け止めた！`, 'important');
                    }
                    
                    if (pendingDamage <= 0) {"""

new_logic = """                    } else {
                        // 耐え切る
                        pendingDamage = 0;
                        logMsg(`「${s.card.name}」でダメージを受け止めた！`, 'important');
                    }
                    
                    if (s.card.name === 'ライトニングボア') {
                        logMsg('【ライトニングボアの効果】自身がダメージを受けたため、対象へ「1点」のダメージを返す！', 'important');
                        if (typeof enemyHp !== 'undefined') enemyHp -= 1;
                        if (typeof showDamagePopup === 'function') showDamagePopup(1);
                    }
                    
                    if (pendingDamage <= 0) {"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
