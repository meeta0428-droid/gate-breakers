with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'attack';",
    "const initStance = card.effect.includes('攻撃行動を行わない') ? 'defend' : (card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'attack');"
)

content = content.replace(
    "const initStance = (card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') || card.effect.includes('このユニットは攻撃と防御を1回ずつ行うことができる')) ? 'both' : 'defend';",
    "const initStance = card.effect.includes('攻撃行動を行わない') ? 'defend' : ((card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') || card.effect.includes('このユニットは攻撃と防御を1回ずつ行うことができる')) ? 'both' : 'defend');"
)

content = content.replace(
    "const initStance = selectedCard.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'attack';",
    "const initStance = selectedCard.effect.includes('攻撃行動を行わない') ? 'defend' : (selectedCard.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'attack');"
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
