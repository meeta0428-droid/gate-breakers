import json

with open('cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for i, card in enumerate(cards):
    if '◆ジョブカード' in card.get('effect', ''):
        print(f"Index {i}: {card['name']}")
