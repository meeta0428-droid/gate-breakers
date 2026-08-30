with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "filterFunc: (c) => c.category.includes('召喚'),",
    "filterFunc: (c) => c.category.includes('召喚') || c.effect.includes('召喚'),"
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
