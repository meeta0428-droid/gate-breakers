import json
import csv
import sys

cards = []
with open('new_cards.csv', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    for row in reader:
        if len(row) < 6: continue
        job, name, category, cost, strength, effect = row
        effect = effect.replace('◆ジョブカード', '<br>◆ジョブカード')
        cards.append({
            "name": name,
            "category": category,
            "cost": int(cost),
            "strength": int(strength),
            "effect": effect
        })

with open('cards.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data.extend(cards)

with open('cards.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print(f"Appended {len(cards)} cards.")
