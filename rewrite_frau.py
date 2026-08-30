import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                if (s.card.name === '熱砂の魔神') {
                    logMsg(`【熱砂の魔神の攻撃】ダメージを与えた時、対象のコスト3以下の捨札1枚を廃棄札に移動させる！`, 'damage');
                }
                
                if (s.card.name === 'テクトニックライノ') {"""

new_logic = """                if (s.card.name === '熱砂の魔神') {
                    logMsg(`【熱砂の魔神の攻撃】ダメージを与えた時、対象のコスト3以下の捨札1枚を廃棄札に移動させる！`, 'damage');
                }
                
                if (s.card.name === 'マインドブレイク・フラウ') {
                    logMsg(`【マインドブレイク・フラウの宣言】このユニットが場に存在する限り、相手陣営は回収タイミングの合計ポイントが-1される！`, 'important');
                }
                
                if (s.card.name === 'テクトニックライノ') {"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
