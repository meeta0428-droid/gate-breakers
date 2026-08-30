with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "if (card.name === 'トラップコンボ' && player) {" in line:
        insert_code = """
        if (card.name === 'ドリフトヴェイド') {
            let def = 3;
            if (player) {
                const enemyInitStr = prompt(`【ドリフトヴェイド】の効果：\\n攻撃してきた敵のイニシアチブを入力してください。\\n（自分のイニシアチブ ${player.totalInitiative} との差分が軽減値に加算されます）`, "0");
                if (enemyInitStr !== null) {
                    const enemyInit = parseInt(enemyInitStr) || 0;
                    const diff = Math.abs(enemyInit - player.totalInitiative);
                    def += diff;
                }
            }
            total += def;
            continue;
        }
"""
        lines.insert(i, insert_code)
        break

with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
