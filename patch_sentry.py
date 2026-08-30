import json

# Update cards.json
with open('cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for c in cards:
    if c['name'] == 'セントリードローン':
        c['effect'] = '召喚　攻０／防３。このユニットが配置されている間は味方陣営は受けるダメージ１点軽減。'

with open('cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=4)

# Update app_v6.js
with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "card.effect.includes('攻撃行動を行わない')",
    "(card.effect.includes('攻撃行動を行わない') || card.name === 'セントリードローン')"
)

content = content.replace(
    "selectedCard.effect.includes('攻撃行動を行わない')",
    "(selectedCard.effect.includes('攻撃行動を行わない') || selectedCard.name === 'セントリードローン')"
)

content = content.replace(
    "s.card.effect.includes('攻撃行動を行わない')",
    "(s.card.effect.includes('攻撃行動を行わない') || s.card.name === 'セントリードローン')"
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
