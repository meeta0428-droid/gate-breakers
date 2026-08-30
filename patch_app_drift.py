with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const enemyInitStr = prompt(" in line:
        # replace the block
        lines[i]   = "                    const enemyInitStr = prompt(`【ドリフトヴェイド】の効果：\\n攻撃してきた敵のイニシアチブを入力してください。\\n（自分のイニシアチブ ${player.initiative} との差分が軽減値に加算されます）`, \"0\");\n"
        lines[i+1] = "                    if (enemyInitStr !== null) {\n"
        lines[i+2] = "                        const cleanStr = enemyInitStr.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));\n"
        lines[i+3] = "                        const enemyInit = parseInt(cleanStr) || 0;\n"
        lines[i+4] = "                        const diff = Math.abs(enemyInit - player.initiative);\n"
        lines[i+5] = "                        def += diff;\n"
        lines[i+6] = "                        logMsg(`【ドリフトヴェイド】基本軽減3 ＋ イニシアチブ差分${diff} ＝ 合計軽減 <b>${def}</b>`, 'important');\n"
        lines[i+7] = "                    }\n"
        lines.insert(i+8, "                    c._driftDef = def;\n")
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
