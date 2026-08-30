with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "if (player.initiative + 4 > 10) {" in line:
        lines[i] = "                if (player.initiative > 10) {\n"
        break
with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "const tempInit = player.initiative + 4;" in line:
        lines[i] = "            const tempInit = player.initiative;\n"
        break
with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
