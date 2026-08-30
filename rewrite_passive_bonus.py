import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 2. getPassiveBonus での isDisabled 除外
old_get_bonus = """                const getPassiveBonus = (categoryFilter) => {
                    return player.deck.passives.reduce((sum, p) => {
                        if (p.category.includes(categoryFilter) || p.category.includes('全て')) {
                            return sum + (p.strength || 0);
                        }
                        return sum;
                    }, 0);
                };"""

new_get_bonus = """                const getPassiveBonus = (categoryFilter) => {
                    return player.deck.passives.reduce((sum, p) => {
                        if (p.isDisabled) return sum; // 無効化されている場合は加算しない
                        if (p.category.includes(categoryFilter) || p.category.includes('全て')) {
                            return sum + (p.strength || 0);
                        }
                        return sum;
                    }, 0);
                };"""
content = content.replace(old_get_bonus, new_get_bonus)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete (2/3).")
