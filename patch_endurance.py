with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace in multi-attack logic (around line 1900)
content = content.replace(
    "if (dmgToTake > endurance) {\n                        summonsToDestroy.push(s);\n                        logMsg(`「${s.card.name}」はダメージ（${dmgToTake}）に耐えきれず破壊された！`, 'damage');\n                    } else {\n                        logMsg(`「${s.card.name}」はダメージ（${dmgToTake}）に耐えた！(場に残る)`, 'important');\n                    }",
    "if (dmgToTake >= endurance) {\n                        summonsToDestroy.push(s);\n                        logMsg(`「${s.card.name}」はダメージ（${dmgToTake}）に耐えきれず破壊された！`, 'damage');\n                    } else {\n                        logMsg(`「${s.card.name}」はダメージ（${dmgToTake}）に耐えた！(場に残る)`, 'important');\n                    }"
)

# Replace in manual allocation logic (around line 2212)
content = content.replace(
    "} else if (dmgToTake > endurance) {\n                        // 破壊される",
    "} else if (dmgToTake >= endurance) {\n                        // 破壊される"
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
