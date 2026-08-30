with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "if (card.name === '獣の戦意'" in line:
        insert_code = """
        if (card.name === 'フルスロットルチャージ' && player) {
            // このカード自身のイニシアチブ+4を加味して判定
            const tempInit = player.initiative + 4;
            if (tempInit > 10) {
                // regex でダメージ+2 が既に加算されているため、+3して合計+5にする
                cardDamage += 3;
            }
        }
"""
        lines.insert(i, insert_code)
        break

with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
