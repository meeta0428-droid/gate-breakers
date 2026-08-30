with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "s.card.originalCards.forEach(c => player.deck.void.push(c));",
    "s.card.originalCards.forEach(c => player.deck.void.push(c)); checkScrapRecycle(player);"
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
