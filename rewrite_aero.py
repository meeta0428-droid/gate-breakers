import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                if (s.card.name === 'ブラッドピット・バット') {
                    logMsg(`【ブラッドピット・バットの攻撃】攻撃でダメージを与えた時、対象の任意の手札を捨札へ送る。その後、自身の山札から1枚ドローする。`, 'damage');
                }
                
                updateUI();"""

new_logic = """                if (s.card.name === 'ブラッドピット・バット') {
                    logMsg(`【ブラッドピット・バットの攻撃】攻撃でダメージを与えた時、対象の任意の手札を捨札へ送る。その後、自身の山札から1枚ドローする。`, 'damage');
                }
                
                if (s.card.name === 'エアロタロン') {
                    logMsg(`【エアロタロンの効果】任意の一体のイニシアチブを「-2」する！`, 'important');
                }
                
                updateUI();"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
