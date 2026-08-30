with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

insert_code = """
                if (s.card.effect.includes('攻撃行動を行わない')) {
                    alert('このユニットは攻撃行動を行いません。');
                    return;
                }
                
                if (s.card.isChimera || s.card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') || s.card.effect.includes('このユニットは攻撃と防御を1回ずつ行うことができる')) {
"""

content = content.replace(
    "if (s.card.isChimera || s.card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') || s.card.effect.includes('このユニットは攻撃と防御を1回ずつ行うことができる')) {",
    insert_code.lstrip('\n')
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
