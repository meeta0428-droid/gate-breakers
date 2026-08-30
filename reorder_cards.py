import json

with open('cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

# Find the 23 newly added cards at the end
new_cards = cards[-23:]
remaining_cards = cards[:-23]

# Find the first NPC card in remaining_cards
first_npc_index = -1
for i, card in enumerate(remaining_cards):
    if 'NPC' in card.get('category', ''):
        first_npc_index = i
        break

if first_npc_index != -1:
    reordered_cards = remaining_cards[:first_npc_index] + new_cards + remaining_cards[first_npc_index:]
else:
    reordered_cards = remaining_cards + new_cards

with open('cards.json', 'w', encoding='utf-8') as f:
    json.dump(reordered_cards, f, ensure_ascii=False, indent=4)

print(f"Moved 23 cards before index {first_npc_index}.")
