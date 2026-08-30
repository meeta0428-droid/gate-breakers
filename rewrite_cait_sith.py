import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. finalizeAttackCombo の召喚処理 (約1055行目付近)
old_summon_atk = """                        if (card.name === 'ウィスプ') {
                            const drawn = player.deck.draw(1);
                            if (drawn > 0) logMsg(`【ウィスプ】召喚時効果：山札からカードを1枚引いた！`, 'important');
                        }
                    }
                } else if (toVoid.has(idx)) {"""
new_summon_atk = """                        if (card.name === 'ウィスプ') {
                            const drawn = player.deck.draw(1);
                            if (drawn > 0) logMsg(`【ウィスプ】召喚時効果：山札からカードを1枚引いた！`, 'important');
                        }
                        if (card.name === 'ケットシー') {
                            const drawn = player.deck.draw(2);
                            if (drawn > 0) logMsg(`【ケットシー】召喚時効果：山札からカードを${drawn}枚引いた！`, 'important');
                        }
                    }
                } else if (toVoid.has(idx)) {"""
content = content.replace(old_summon_atk, new_summon_atk)


# 2. finalizeDefendCombo の召喚処理 (約1470行目付近)
old_summon_def = """                    if (card.name === 'ウィスプ') {
                        const drawn = player.deck.draw(1);
                        if (drawn > 0) logMsg(`【ウィスプ】召喚時効果：山札からカードを1枚引いた！`, 'important');
                    }
                }
            } else if (toVoid.has(idx)) {"""
new_summon_def = """                    if (card.name === 'ウィスプ') {
                        const drawn = player.deck.draw(1);
                        if (drawn > 0) logMsg(`【ウィスプ】召喚時効果：山札からカードを1枚引いた！`, 'important');
                    }
                    if (card.name === 'ケットシー') {
                        const drawn = player.deck.draw(2);
                        if (drawn > 0) logMsg(`【ケットシー】召喚時効果：山札からカードを${drawn}枚引いた！`, 'important');
                    }
                }
            } else if (toVoid.has(idx)) {"""
content = content.replace(old_summon_def, new_summon_def)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
