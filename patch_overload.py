with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const mitigation = stat.takeDamage();" in line:
        insert_code = """            let mitigation = stat.takeDamage();
            const hasAnimaOverload = player.deck.passives.some(p => p.name === 'アニマオーバーロード' && !p.isDisabled);
            if (hasAnimaOverload) {
                mitigation += 2;
                logMsg(`【アニマオーバーロード】効果発動！能力値による軽減量が ＋2 された！（計 ${mitigation} 点軽減）`, 'important');
            }
"""
        lines[i] = insert_code
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
