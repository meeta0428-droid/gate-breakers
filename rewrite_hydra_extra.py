import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                    if (s.card.name === 'ミストストーカー') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[「肉体」リアクション不可]</span>';
                    }"""

new_logic = """                    if (s.card.name === 'ミストストーカー') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[「肉体」リアクション不可]</span>';
                    }
                    if (s.card.name === 'フリップサイド・ヒュドラ') {
                        extraInfo = '<br><span style="color:#ffcc00; font-weight:bold;">※『多頭の暴虐』：任意の対象全員に4点のダメージ！</span>';
                    }"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
