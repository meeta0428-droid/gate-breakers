with open('game_logic_v9.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "return total;" in line and "total += (this.initiativeModifier || 0);" in lines[i-2]:
        insert_code = """
        // 機動騎兵のジョブカード効果：配置されている召喚ユニットの強度をイニシアチブに足す（最大のもの）
        const hasKidoKihei = this.deck.passives.some(p => p.name === '機動騎兵' && !p.isDisabled);
        if (hasKidoKihei && this.deck.summons && this.deck.summons.length > 0) {
            let maxStr = 0;
            for (const s of this.deck.summons) {
                if (s.card.strength > maxStr) maxStr = s.card.strength;
            }
            total += maxStr;
        }
"""
        lines.insert(i, insert_code)
        break

with open('game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
