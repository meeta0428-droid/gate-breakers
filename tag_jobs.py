import json

with open('cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

# Find all job start indices
job_starts = []
for i, card in enumerate(cards):
    if '◆ジョブカード' in card.get('effect', ''):
        job_starts.append((i, card['name']))

# Add NPC and General pseudo-jobs
job_starts.append((123, "汎用"))

# Sort job starts
job_starts.sort()

# Assign jobs
current_job = "汎用"
for i, card in enumerate(cards):
    if 'NPC' in card.get('category', ''):
        card['job'] = "NPC"
        continue
    
    # Check if we hit a new job start
    for j_idx, j_name in job_starts:
        if i == j_idx:
            current_job = j_name
            break
            
    card['job'] = current_job

with open('cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=4)

