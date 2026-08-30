import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                if (s.card.name === 'ヴァイパーヴァイン') {
                    logMsg(`【ヴァイパーヴァインの攻撃】ダメージを与えた時、対象のコスト3以下の捨札1枚を廃棄札に移動させる！`, 'damage');
                }
                
                updateUI();"""

new_logic = """                if (s.card.name === 'ヴァイパーヴァイン') {
                    logMsg(`【ヴァイパーヴァインの攻撃】ダメージを与えた時、対象のコスト3以下の捨札1枚を廃棄札に移動させる！`, 'damage');
                }
                
                if (s.card.name === 'テクトニックライノ') {
                    logMsg(`【テクトニックライノの効果】任意の全ての対象は、手札からコスト3以下のカード1枚を選び捨札に移動する！`, 'damage');
                }
                
                updateUI();"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
