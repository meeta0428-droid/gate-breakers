with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "if (c.name === 'フルスロットルチャージ') {" in line:
        insert_code = """
            if (c.name === '神速領域') {
                currentCardDmg += player.initiative;
                detail += `（イニシアチブ加算ボーナス＋${player.initiative}）`;
            }
"""
        lines.insert(i, insert_code)
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
