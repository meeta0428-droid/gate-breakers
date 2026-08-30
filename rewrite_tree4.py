import re
import json

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for card in cards:
    if card['name'] == '浸食の骸樹':
        card['effect'] = "召喚・攻1 / 防1<br>**【特殊効果】**任意の対象の捨札1枚を廃棄札に移動する。さらに山札から1枚手札に加える。<br>未知の寄生植物によって操られている動く屍。"

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=4)

print("cards.json updated.")
