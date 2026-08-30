import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                    if (s.card.name === 'サラマンダー' || s.card.name === 'ファントムレオ' || s.card.name === '狂雷の凶鳥') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[リアクション不可]</span>';
                    }"""

new_logic = """                    if (s.card.name === 'サラマンダー' || s.card.name === 'ファントムレオ') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[リアクション不可]</span>';
                    }
                    if (s.card.name === '狂雷の凶鳥') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[リアクション不可]</span><br><span style="color:#ff5252; font-weight:bold;">※このユニットのダメージはリアクションすることができない！</span>';
                    }"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
