import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 防御ボタン
old_def = """                if (s.card.name === '深淵の触魔') {
                    logMsg(`【深淵の触魔の効果】対象の任意の手札1枚を指定し、その戦闘中使用不可（ロック）にする！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、指定された手札をこの戦闘中使わないようにしてください）</span>`, 'important');
                }
                
                updateUI();"""

new_def = """                if (s.card.name === '深淵の触魔') {
                    logMsg(`【深淵の触魔の効果】対象の任意の手札1枚を指定し、その戦闘中使用不可（ロック）にする！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、指定された手札をこの戦闘中使わないようにしてください）</span>`, 'important');
                }
                
                if (s.card.name === '砂幻の魔蛇') {
                    logMsg(`【砂幻の魔蛇の効果】任意のコスト3までのカード1枚の効果を無効化する！`, 'important');
                }
                
                updateUI();"""
content = content.replace(old_def, new_def)


with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
