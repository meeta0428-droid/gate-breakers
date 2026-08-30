with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any strict condition with the relaxed one
content = content.replace(
    "card.category.includes('召喚') || card.effect.includes('召喚・攻') || card.effect.includes('召喚　攻') || card.effect.includes('召喚 攻')",
    "card.category.includes('召喚') || card.effect.includes('召喚・攻') || card.effect.includes('召喚　攻') || card.effect.includes('召喚 攻')"
)

content = content.replace(
    "card.category.includes('召喚') || card.effect.includes('召喚・攻')",
    "card.category.includes('召喚') || card.effect.includes('召喚・攻') || card.effect.includes('召喚　攻') || card.effect.includes('召喚 攻')"
)

content = content.replace(
    "c.category.includes('召喚') || c.effect.includes('召喚・攻')",
    "c.category.includes('召喚') || c.effect.includes('召喚・攻') || c.effect.includes('召喚　攻') || c.effect.includes('召喚 攻')"
)

content = content.replace(
    "selectedCard.effect.includes('召喚・攻')",
    "selectedCard.effect.includes('召喚・攻') || selectedCard.effect.includes('召喚　攻') || selectedCard.effect.includes('召喚 攻')"
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
