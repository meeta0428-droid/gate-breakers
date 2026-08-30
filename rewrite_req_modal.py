import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_req_display = """                const hasMadanjushi = playerObj.deck.passives.some(p => p.name === '魔弾銃士');
                const isBullet = card.effect.includes('弾丸');
                let costDisplay = `コスト: ${card.cost}`;
                if (hasMadanjushi && isBullet) {
                    costDisplay = `コスト: <span style="text-decoration: line-through;">${card.cost}</span> <span style="color:#ffcc00;">${Math.max(0, card.cost - 1)}</span> <span style="color:#ffcc00; font-size:0.7rem;">(魔弾)</span>`;
                }"""
new_req_display = """                const dCost = getDisplayCost(card, playerObj);
                let costDisplay = `コスト: ${card.cost}`;
                if (dCost < card.cost) {
                    costDisplay = `コスト: <span style="text-decoration: line-through;">${card.cost}</span> <span style="color:#ffcc00;">${dCost}</span> <span style="color:#ffcc00; font-size:0.7rem;">(軽減適用)</span>`;
                }"""
content = content.replace(old_req_display, new_req_display)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
