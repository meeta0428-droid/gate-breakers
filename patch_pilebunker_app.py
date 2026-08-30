import re

with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "const dmg = calculateDamageFromCards(currentCombo, player);",
    "const isNoReact = document.getElementById('chk-enemy-no-react')?.checked || false;\n        const dmg = calculateDamageFromCards(currentCombo, player, isNoReact);"
)

content = content.replace(
    "const prevDmg = calculateDamageFromCards([prevCard], player);",
    "const isNoReactTmp = document.getElementById('chk-enemy-no-react')?.checked || false;\n                const prevDmg = calculateDamageFromCards([prevCard], player, isNoReactTmp);"
)

insert_idx = content.find("if (c.name === '神速領域') {")
insert_code = """
            if (c.name === 'パイルバンカー' && isNoReact) {
                currentCardDmg += 9;
                detail += `（ノーリアクションボーナス＋9）`;
            }
            """
content = content[:insert_idx] + insert_code + content[insert_idx:]

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
