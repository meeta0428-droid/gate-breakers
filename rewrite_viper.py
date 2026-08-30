import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                if (s.card.name === 'ヴェノムラプター') {
                    logMsg(`【ヴェノムラプターの攻撃】このユニットの攻撃がダメージを与えた時、対象は任意の手札1枚を捨札に移動する。`, 'damage');
                }
                
                updateUI();"""

new_logic = """                if (s.card.name === 'ヴェノムラプター') {
                    logMsg(`【ヴェノムラプターの攻撃】このユニットの攻撃がダメージを与えた時、対象は任意の手札1枚を捨札に移動する。`, 'damage');
                }
                
                if (s.card.name === 'ヴァイパーヴァイン') {
                    logMsg(`【ヴァイパーヴァインの攻撃】ダメージを与えた時、対象のコスト3以下の捨札1枚を廃棄札に移動させる！`, 'damage');
                }
                
                updateUI();"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
