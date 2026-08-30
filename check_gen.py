import json

with open('cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for i in range(114, 165):
    if i < len(cards):
        print(f"{i}: {cards[i].get('name')}")
