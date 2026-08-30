import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic1 = """                    if (s.card.name === 'サラマンダー' || s.card.name === 'ファントムレオ') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[リアクション不可]</span>';
                    }"""

new_logic1 = """                    if (s.card.name === 'サラマンダー' || s.card.name === 'ファントムレオ') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[リアクション不可]</span>';
                    }
                    if (s.card.name === 'フォレストコング') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[身代わり無視／狙い撃ち]</span>';
                    }"""

content = content.replace(old_logic1, new_logic1)


old_logic2 = """                if (s.card.name === 'ファントムレオ') {
                    logMsg(`【ファントムレオの攻撃】この攻撃はリアクション不可！`, 'damage');
                }
                
                updateUI();"""

new_logic2 = """                if (s.card.name === 'ファントムレオ') {
                    logMsg(`【ファントムレオの攻撃】この攻撃はリアクション不可！`, 'damage');
                }
                
                if (s.card.name === 'フォレストコング') {
                    logMsg(`【フォレストコングの攻撃】任意のカードを指定して攻撃する！（身代わり無視／狙い撃ち）`, 'damage');
                }
                
                updateUI();"""

content = content.replace(old_logic2, new_logic2)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
