with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "if (actualCard.category.includes('パッシブ') && !hasCustomLogic) {",
    "if (actualCard.name === 'ディストラクトオーダー') { hasCustomLogic = true; }\n        if (actualCard.category.includes('パッシブ') && !hasCustomLogic) {"
)

with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.write(content)
