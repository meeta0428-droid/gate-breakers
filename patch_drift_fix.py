with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
drift_block = []
in_drift = False

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

# Now insert drift_block at the very top of the loop
for i, line in enumerate(new_lines):
    if "for (const card of cards) {" in line:
        for j, dline in enumerate(drift_block):
            new_lines.insert(i + 1 + j, dline)
        break

with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
