# -*- coding: utf-8 -*-
with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Familiar
for i, line in enumerate(lines):
    if "ファミリア：召喚ユニットを選択" in line:
        # Search down for onSelect: (selectedCard) => {
        for j in range(i, i+10):
            if "onSelect: (selectedCard) => {" in lines[j]:
                check_code = "                                if (!canSummonCard(selectedCard, player)) return;\n"
                lines.insert(j + 1, check_code)
                break
        break

# 2. Apocrypha
for i, line in enumerate(lines):
    if "『アポクリファ』：ユニットを召喚" in line:
        for j in range(i, i+10):
            if "onSelect: (selectedCard) => {" in lines[j]:
                check_code = "                                if (!canSummonCard(selectedCard, player)) return;\n"
                lines.insert(j + 1, check_code)
                break
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print("Patched app_v6.js correctly")
