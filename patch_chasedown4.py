with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "logMsg(`【チェイスダウン】イニシアチブ10超過により、捨札から自動回収されました！`, 'important');" in line:
        lines.insert(i+1, "            updateUI();\n")
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
