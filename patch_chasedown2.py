with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "// チェイスダウンの自動回収チェック" in line:
        skip = True
    if skip and "logMsg(`【チェイスダウン】" in line:
        pass
    if skip and "            }\n" == line:
        pass # there are two of these
    
    if skip and "        }\n" == line:
        # End of the block
        skip = False
        continue
    
    if not skip:
        new_lines.append(line)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
