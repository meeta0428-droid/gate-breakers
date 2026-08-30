import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                if (s.card.name === 'ガイアグリズリー') {
                    logMsg(`【ガイアグリズリーの防御】コスト1のカードを無効化する！`, 'important');
                }
                
                updateUI();"""

new_logic = """                if (s.card.name === 'ガイアグリズリー') {
                    logMsg(`【ガイアグリズリーの防御】コスト1のカードを無効化する！`, 'important');
                }
                
                if (s.card.name === 'ガイアギガース') {
                    logMsg(`【ガイアギガースの防御】そのラウンドの「精神」または「知性」カテゴリーの効果を1枚無効化する！`, 'important');
                }
                
                updateUI();"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
