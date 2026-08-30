import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                if (s.card.name === 'フリップサイド・ヒュドラ') {
                    logMsg(`【フリップサイド・ヒュドラの攻撃】①『多頭の暴虐』：任意の対象全員に4点のダメージ！`, 'damage');
                }
                
                if (s.card.name === 'テクトニックライノ') {"""

new_logic = """                if (s.card.name === 'フリップサイド・ヒュドラ') {
                    logMsg(`【フリップサイド・ヒュドラの攻撃】①『多頭の暴虐』：任意の対象全員に4点のダメージ！`, 'damage');
                }
                
                if (s.card.name === '泥瘴の悪鬼') {
                    logMsg(`【泥瘴の悪鬼の攻撃】任意の対象全ての回収ポイントを-1する！`, 'damage');
                }
                
                if (s.card.name === 'テクトニックライノ') {"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
