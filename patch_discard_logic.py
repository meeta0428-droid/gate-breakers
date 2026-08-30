with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const isDiscardOnly = (card.effect.includes('捨札にある間') && card.effect.includes('持続')) || card.effect.includes('捨札にある場合');" in line:
        lines[i] = "            const isDiscardOnly = (card.effect.match(/捨[て]?札にある[間場合]/) && card.effect.match(/(持続|続く)/)) || card.effect.includes('捨札にある場合');\n"
        break

with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
