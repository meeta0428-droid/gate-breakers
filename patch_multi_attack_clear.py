with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "isGuardStanceActive = false;\n        }",
    "isGuardStanceActive = false;\n        }\n        if (els.chkMultiAttack) els.chkMultiAttack.checked = false;"
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
