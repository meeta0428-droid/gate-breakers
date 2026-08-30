import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_sacrifice = """                cDiv.querySelector('button').addEventListener('click', () => {
                    const dmgToTake = pendingDamage;
                    const endurance = s.card.cost;
                    
                    if (dmgToTake > endurance) {"""

new_sacrifice = """                cDiv.querySelector('button').addEventListener('click', () => {
                    const dmgToTake = pendingDamage;
                    const endurance = s.card.cost;
                    
                    if (s.card.name === '彷徨う砂塵霊') {
                        // ダメージを全て無効化し、捨札へ移動する
                        player.deck.summons.splice(idx, 1);
                        player.deck.discard.push(s.card);
                        pendingDamage = 0;
                        logMsg(`「${s.card.name}」がダメージを身代わりにした！<br><span style="color:#00ffff; font-weight:bold;">【特殊効果】自身が受けるダメージを0にし、自身の捨札へ移動した！</span>`, 'important');
                    } else if (dmgToTake > endurance) {"""

content = content.replace(old_sacrifice, new_sacrifice)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
