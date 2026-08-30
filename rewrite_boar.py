import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """            const mitigation = stat.takeDamage();
            pendingDamage -= mitigation;
            logMsg(`${stat.name}で受けた！(現在値-1) ダメージを ${mitigation} 点軽減！`);
            
            if (pendingDamage <= 0) {"""

new_logic = """            const mitigation = stat.takeDamage();
            pendingDamage -= mitigation;
            logMsg(`${stat.name}で受けた！(現在値-1) ダメージを ${mitigation} 点軽減！`);
            
            const hasBoar = player.deck.summons.some(s => s.card.name === 'ライトニングボア');
            if (hasBoar) {
                logMsg('【ライトニングボアの効果】ダメージを受けたため、対象へ「1点」のダメージを返す！', 'important');
                if (typeof enemyHp !== 'undefined') {
                    enemyHp -= 1;
                }
                if (typeof showDamagePopup === 'function') {
                    showDamagePopup(1);
                }
            }
            
            if (pendingDamage <= 0) {"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
