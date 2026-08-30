import re

def update_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    new_code = """const match = card.effect.match(/ダメージ[＋\+]([0-9０-９]+)/);
        if (match) {
            const valStr = match[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            cardDamage += parseInt(valStr);
        }"""
        
    new_code_app = """const match = c.effect.match(/ダメージ[＋\+]([0-9０-９]+)/);
            if (match) {
                const valStr = match[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
                currentCardDmg += parseInt(valStr);
            }"""

    if filename == 'game_logic_v9.js':
        content = re.sub(
            r'const match = card\.effect\.match\(/ダメージ\[＋\\\+\]\(\\d\+\)/\);\s*if \(match\) \{\s*cardDamage \+= parseInt\(match\[1\]\);\s*\}',
            new_code,
            content
        )
    elif filename == 'app_v6.js':
        content = re.sub(
            r'const match = c\.effect\.match\(/ダメージ\[＋\\\+\]\(\\d\+\)/\);\s*if \(match\) currentCardDmg \+= parseInt\(match\[1\]\);',
            new_code_app,
            content
        )
        
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

update_file('game_logic_v9.js')
update_file('app_v6.js')
