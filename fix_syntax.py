with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "s.(card.effect.includes('攻撃行動を行わない') || card.name === 'セントリードローン')",
    "(s.card.effect.includes('攻撃行動を行わない') || s.card.name === 'セントリードローン')"
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
