with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove from calculateDamageFromCards
drift_block = []
in_drift = False
new_lines = []

for line in lines:
    if "if (card.name === 'ドリフトヴェイド') {" in line:
        in_drift = True
        drift_block.append(line)
    elif in_drift:
        drift_block.append(line)
        if "        }" in line:
            in_drift = False
    else:
        new_lines.append(line)

# Insert into calculateDefenseFromCards
for i, line in enumerate(new_lines):
    if "export function calculateDefenseFromCards(" in line:
        # The next line is `let total = 0;`
        # The line after is `for (const card of cards) {`
        for j, dline in enumerate(drift_block):
            new_lines.insert(i + 3 + j, dline)
        break

with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
