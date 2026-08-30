with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "player.deck.void.push(undineCard);",
    "player.deck.void.push(undineCard); checkScrapRecycle(player);"
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
