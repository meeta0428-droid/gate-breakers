import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. finalizeAttackCombo の召喚処理 (約1049行目付近)
old_summon_atk = """                        const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'attack';
                        player.deck.summons.push({ card: card, stance: initStance });
                    }
                } else if (toVoid.has(idx)) {"""
new_summon_atk = """                        const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'attack';
                        player.deck.summons.push({ card: card, stance: initStance });
                        if (card.name === 'ウィスプ') {
                            const drawn = player.deck.draw(1);
                            if (drawn > 0) logMsg(`【ウィスプ】召喚時効果：山札からカードを1枚引いた！`, 'important');
                        }
                    }
                } else if (toVoid.has(idx)) {"""
content = content.replace(old_summon_atk, new_summon_atk)

# 2. finalizeDefendCombo の召喚処理 (約1462行目付近)
old_summon_def = """                    const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'defend';
                    player.deck.summons.push({ card: card, stance: initStance });
                }
            } else if (toVoid.has(idx)) {"""
new_summon_def = """                    const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'defend';
                    player.deck.summons.push({ card: card, stance: initStance });
                    if (card.name === 'ウィスプ') {
                        const drawn = player.deck.draw(1);
                        if (drawn > 0) logMsg(`【ウィスプ】召喚時効果：山札からカードを1枚引いた！`, 'important');
                    }
                }
            } else if (toVoid.has(idx)) {"""
content = content.replace(old_summon_def, new_summon_def)


# 3. updateDiscardModalUI の回収ポイント計算 (約2130行目付近)
old_recover = """        const maxBody = maxBodyBase + bonusBody + manualRecoveryBonus.body;
        const maxInt = maxIntBase + bonusInt + manualRecoveryBonus.int;
        const maxMen = maxMenBase + bonusMen + manualRecoveryBonus.men;"""

new_recover = """        let maxBody = maxBodyBase + bonusBody + manualRecoveryBonus.body;
        let maxInt = maxIntBase + bonusInt + manualRecoveryBonus.int;
        let maxMen = maxMenBase + bonusMen + manualRecoveryBonus.men;
        
        // ウィスプの召喚ボーナス（場にいれば精神回収ポイント＋1）
        const wispCount = player.deck.summons.filter(s => s.card.name === 'ウィスプ').length;
        if (wispCount > 0) {
            maxMen += wispCount;
        }"""
content = content.replace(old_recover, new_recover)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
