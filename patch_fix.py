with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "handleSummonVoided(player, arguments[0]);" in line:
        if "nohmCard" in line:
            lines[i] = line.replace("arguments[0]", "nohmCard")
        elif "salamanderCard" in line:
            lines[i] = line.replace("arguments[0]", "salamanderCard")
        elif "undineCard" in line:
            lines[i] = line.replace("arguments[0]", "undineCard")
        elif "s.card" in line:
            lines[i] = line.replace("arguments[0]", "s.card")

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
