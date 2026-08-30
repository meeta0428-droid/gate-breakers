import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                if (s.card.name === 'マインドブレイク・フラウ') {
                    logMsg(`【マインドブレイク・フラウの宣言】このユニットが場に存在する限り、相手陣営は回収タイミングの合計ポイントが-1される！`, 'important');
                }
                
                if (s.card.name === 'テクトニックライノ') {"""

new_logic = """                if (s.card.name === 'マインドブレイク・フラウ') {
                    logMsg(`【マインドブレイク・フラウの宣言】このユニットが場に存在する限り、相手陣営は回収タイミングの合計ポイントが-1される！`, 'important');
                }
                
                if (s.card.name === 'フリップサイド・ヒュドラ') {
                    logMsg(`【フリップサイド・ヒュドラの攻撃】①『多頭の暴虐』：任意の対象全員に4点のダメージ！`, 'damage');
                }
                
                if (s.card.name === 'テクトニックライノ') {"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
