import re

with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "export function calculateDamageFromCards(cards, player) {", 
    "export function calculateDamageFromCards(cards, player, isNoReact = false) {"
)

insert_idx = content.find("if (card.name === 'ロックオンアサルト'")
insert_code = """
        if (card.name === 'パイルバンカー' && isNoReact) {
            cardDamage += 9; // 6 + 9 = 15
        }
        
        """
content = content[:insert_idx] + insert_code + content[insert_idx:]

with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.write(content)
