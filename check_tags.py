import json

with open('cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for i in [0, 8, 9, 122, 123, 158, 159, 181, 182]:
    if i < len(cards):
        print(f"{i}: {cards[i]['name']} -> {cards[i]['job']}")
