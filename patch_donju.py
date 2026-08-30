with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const card = selectedCardSource === 'psychometry'" in line:
        insert_code = """
            // 鈍重な鉄槌の制限チェック
            if (currentCombo.some(c => c.name === '鈍重な鉄槌')) {
                alert('「鈍重な鉄槌」が既にコンボに含まれているため、これ以上このコンボに自身のカードを繋ぐことはできません。');
                return;
            }
"""
        lines.insert(i-1, insert_code)
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
