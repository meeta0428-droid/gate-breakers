with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "player.deck.void.push(salamanderCard);",
    "player.deck.void.push(salamanderCard); checkScrapRecycle(player);"
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
