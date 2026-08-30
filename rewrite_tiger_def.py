import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """            if (s.card.name === 'ノーム') {
                summonDef += 2;
                summonLog += `・【ノーム】常時効果 (軽減 2)<br>`;
            }
        });"""

new_logic = """            if (s.card.name === 'ノーム') {
                summonDef += 2;
                summonLog += `・【ノーム】常時効果 (軽減 2)<br>`;
            }
            
            if (s.card.name === 'アイアン・タイガー') {
                summonDef += 2;
                summonLog += `・【アイアン・タイガー】常時効果 (軽減 2)<br>`;
            }
        });"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
