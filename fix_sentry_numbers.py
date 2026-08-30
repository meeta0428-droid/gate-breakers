import json

with open('cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for c in cards:
    if c['name'] == 'セントリードローン':
        c['effect'] = '召喚　攻0／防3。このユニットが配置されている間は味方陣営は受けるダメージ1点軽減。'

with open('cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=4)
