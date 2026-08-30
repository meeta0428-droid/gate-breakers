with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "if (c.name === 'ロックオンアサルト'" in line:
        insert_code = """
            if (c.name === 'フルスロットルチャージ') {
                if (player.initiative + 4 > 10) {
                    currentCardDmg += 3;
                    detail += `（イニシアチブ超過ボーナス＋3）`;
                }
            }
"""
        lines.insert(i, insert_code)
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
