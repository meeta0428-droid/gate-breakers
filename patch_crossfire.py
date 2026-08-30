with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    content = f.read()

insert_code = """
        if (card.name === 'クロス・ファイア' && player) {
            cardDamage -= 2;
            cardDamage += player.deck.summons.length * 2;
        }
"""

content = content.replace(
    "if (card.name === 'ロックオンアサルト'",
    insert_code.lstrip('\n') + "        if (card.name === 'ロックオンアサルト'"
)

with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.write(content)
