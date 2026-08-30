import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                    if (s.card.name === 'フリップサイド・ヒュドラ') {
                        extraInfo = '<br><span style="color:#ffcc00; font-weight:bold;">※『多頭の暴虐』：任意の対象全員に4点のダメージ！</span>';
                    }"""

new_logic = """                    if (s.card.name === 'フリップサイド・ヒュドラ') {
                        extraInfo = '<br><span style="color:#ffcc00; font-weight:bold;">※『多頭の暴虐』：任意の対象全員に4点のダメージ！</span>';
                    }
                    if (s.card.name === '泥瘴の悪鬼') {
                        extraInfo = '<br><span style="color:#ff5252; font-weight:bold;">※任意の対象全ての回収ポイントを-1する！</span>';
                    }"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
