with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = "const activeCards = [...this.deck.passives, ...this.deck.summons];"
new_code = "const activeCards = [...this.deck.passives, ...this.deck.summons.map(s => s.card ? s.card : s)];"

content = content.replace(old_code, new_code)

with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.write(content)
