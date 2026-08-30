with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "sDiv.querySelector('.btn-def').addEventListener('click', () => {" in line:
        # Next few lines should be deleted
        del lines[i+1:i+5]
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
