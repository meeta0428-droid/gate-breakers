import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic1 = """                    if (s.card.name === 'フォレストコング') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[身代わり無視／狙い撃ち]</span>';
                    }"""

new_logic1 = """                    if (s.card.name === 'フォレストコング') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[身代わり無視／狙い撃ち]</span>';
                    }
                    if (s.card.name === 'ミストストーカー') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[「肉体」リアクション不可]</span>';
                    }"""

content = content.replace(old_logic1, new_logic1)


old_logic2 = """                if (s.card.name === 'フォレストコング') {
                    logMsg(`【フォレストコングの攻撃】任意のカードを指定して攻撃する！（身代わり無視／狙い撃ち）`, 'damage');
                }
                
                updateUI();"""

new_logic2 = """                if (s.card.name === 'フォレストコング') {
                    logMsg(`【フォレストコングの攻撃】任意のカードを指定して攻撃する！（身代わり無視／狙い撃ち）`, 'damage');
                }
                
                if (s.card.name === 'ミストストーカー') {
                    logMsg(`【ミストストーカーの攻撃】この攻撃に対し、対象は「肉体」カテゴリーのリアクションを使用することができない！`, 'damage');
                }
                
                updateUI();"""

content = content.replace(old_logic2, new_logic2)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
