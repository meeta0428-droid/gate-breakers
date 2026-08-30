with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "if (card.name === 'フルスロットルチャージ' && player) {" in line:
        insert_code = """
        if (card.name === '神速領域' && player) {
            cardDamage += player.initiative;
        }
"""
        lines.insert(i, insert_code)
        break

with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
