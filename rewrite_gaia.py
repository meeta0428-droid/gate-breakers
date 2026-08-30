import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """            sDiv.querySelector('.btn-def').addEventListener('click', () => {
                if (s.card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる')) {
                    if (s.stance === 'attack' || s.stance === 'both') s.stance = 'both';
                    else s.stance = 'both';
                } else {
                    s.stance = 'defend';
                }
                updateUI();
            });"""

new_logic = """            sDiv.querySelector('.btn-def').addEventListener('click', () => {
                if (s.card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる')) {
                    if (s.stance === 'attack' || s.stance === 'both') s.stance = 'both';
                    else s.stance = 'both';
                } else {
                    s.stance = 'defend';
                }
                
                if (s.card.name === 'ガイアグリズリー') {
                    logMsg(`【ガイアグリズリーの防御】コスト1のカードを無効化する！`, 'important');
                }
                
                updateUI();
            });"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
