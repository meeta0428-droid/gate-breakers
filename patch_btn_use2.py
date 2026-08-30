with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "els.btnUseCard.addEventListener('click', () => {" in line:
        start_idx = i
        break

if start_idx != -1:
    lines.insert(start_idx + 1, "        try {\n")
    # find the matching end
    for i in range(start_idx + 1, len(lines)):
        if "els.btnComboClose.addEventListener('click'" in lines[i]:
            # The end of the btnUseCard listener is right above this
            end_idx = i - 2
            break
    
    if end_idx != -1:
        lines.insert(end_idx, "        } catch (e) { alert('btnUseCard Error: ' + e.message + '\\n' + e.stack); console.error(e); }\n")

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
