import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                cDiv.querySelector('button').addEventListener('click', () => {
                    const dmgToTake = pendingDamage;
                    
                    let defVal = 0;
                    const match = s.card.effect.match(/攻(\\d+)\\s*[／/]\\s*(?:防)?(\\d+)/);
                    if (match) {
                        defVal = parseInt(match[2], 10);
                    }
                    if (s.elementalerBuff) defVal += 2 * s.elementalerBuff;
                    const honnouBuff = player.deck.discard.filter(c => c.name === '本能の覚醒').length * 2;
                    const jusoBuff = player.deck.passives.filter(c => c.name === '獣操棍').length * 1;
                    defVal += honnouBuff + jusoBuff;
                    
                    const endurance = s.card.cost + defVal;
                    
                    if (dmgToTake >= endurance) {"""

new_logic = """                cDiv.querySelector('button').addEventListener('click', () => {
                    const dmgToTake = pendingDamage;
                    const endurance = s.card.cost;
                    
                    if (dmgToTake > endurance) {"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("endurance fix done.")
