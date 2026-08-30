with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "for (const card of activeCards) {" in line:
        lines.insert(i+1, "                if (!card || !card.effect) continue;\n")
        break

with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
