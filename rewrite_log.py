import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """            if (continuousMatch) {
                continuousBonus += parseInt(continuousMatch[1]);
                detail += `（これ以降のダメージに＋${continuousMatch[1]}）`;
            }
            
            if (toVoid.has(idx)) detail += ` [廃棄へ]`;
            return `・「${c.name}」${detail}`;
        }).join('<br>');"""

new_block = """            if (continuousMatch) {
                continuousBonus += parseInt(continuousMatch[1]);
                detail += `（これ以降のダメージに＋${continuousMatch[1]}）`;
            }
            
            if (!isDamageCard) {
                detail += `<br><span style="color:#aaa; font-size:0.8rem; margin-left:1em;">【効果】${c.effect}</span>`;
            }
            
            if (toVoid.has(idx)) detail += ` [廃棄へ]`;
            return `・「${c.name}」${detail}`;
        }).join('<br>');"""

content = content.replace(old_block, new_block)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
