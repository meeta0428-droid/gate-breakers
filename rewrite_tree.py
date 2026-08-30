import re
import json

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for card in cards:
    if card['name'] == '怨樹 of 角魔':
        card['name'] = '怨樹の角魔'

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=4)

print("cards.json updated.")
