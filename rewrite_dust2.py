import re
import json

# 1. cards.json の更新
with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for card in cards:
    if card['name'] == '彷徨う砂塵霊':
        card['effect'] = "召喚・攻4 / 防4<br>**【特殊効果】**ダメージを0にする。このカードは効果を適用した後、廃棄札へと移動する。<br>ゲートの中で命を落とした者たちの怨念が、巻き上げられた砂塵そのものとなった怨霊。"

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=4)


# 2. app_v6.js の更新
with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                    if (s.card.name === '彷徨う砂塵霊') {
                        // ダメージを全て無効化し、捨札へ移動する
                        player.deck.summons.splice(idx, 1);
                        player.deck.discard.push(s.card);
                        pendingDamage = 0;
                        logMsg(`「${s.card.name}」がダメージを身代わりにした！<br><span style="color:#00ffff; font-weight:bold;">【特殊効果】自身が受けるダメージを0にし、自身の捨札へ移動した！</span>`, 'important');
                    } else if (dmgToTake > endurance) {"""

new_logic = """                    if (s.card.name === '彷徨う砂塵霊') {
                        // ダメージを全て無効化し、廃棄札へ移動する
                        player.deck.summons.splice(idx, 1);
                        player.deck.void.push(s.card);
                        pendingDamage = 0;
                        logMsg(`「${s.card.name}」がダメージを身代わりにした！<br><span style="color:#00ffff; font-weight:bold;">【特殊効果】ダメージを0にし、廃棄札へ移動した！</span>`, 'important');
                    } else if (dmgToTake > endurance) {"""
content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
