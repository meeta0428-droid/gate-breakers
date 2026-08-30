import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 防御ボタン
old_def = """                if (s.card.name === '砂幻の魔蛇') {
                    logMsg(`【砂幻の魔蛇の効果】任意のコスト3までのカード1枚の効果を無効化する！`, 'important');
                }
                
                updateUI();"""

new_def = """                if (s.card.name === '砂幻の魔蛇') {
                    logMsg(`【砂幻の魔蛇の効果】任意のコスト3までのカード1枚の効果を無効化する！`, 'important');
                }
                
                if (s.card.name === '屍殻の巨蟹') {
                    logMsg(`【屍殻の巨蟹の効果】相手が使用したコスト3以下のカード効果をすべて無効化する！`, 'important');
                }
                
                updateUI();"""
content = content.replace(old_def, new_def)


with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
