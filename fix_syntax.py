with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "                updateUI();" in line and not skip:
        # Check next few lines to see if it's the garbage
        idx = lines.index(line)
        if "}, 50);" in lines[idx+1] and "function updateUI()" in lines[idx+5]:
            skip = True
            continue
    
    if skip:
        if "function updateUI()" in line:
            skip = False
            new_lines.append(line)
        continue
    
    new_lines.append(line)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
