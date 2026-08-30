import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/card_effects_v5.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """            return {};
        }
    }
};"""

new_logic = """            return {};
        }
    },
    // 魔導銃イグニス：ダメージ＋1。効果「弾丸」のカードを使用した時、ダメージ＋2に変更。捨札2枚につきダメージ＋1。
    "魔導銃イグニス": {
        onAttack: (context) => {
            if (!context.currentCombo || context.totalDmg <= 0) return {};
            if (!context._ignisApplied) {
                const hasBullet = context.currentCombo.some(c => c.effect.includes('弾丸'));
                const pureDiscardCount = context.player.deck.discard.filter(c => !context.currentCombo.includes(c)).length;
                const discardBonus = Math.floor(pureDiscardCount / 2);
                
                const baseBonus = hasBullet ? 2 : 1;
                const totalBonus = baseBonus + discardBonus;
                
                context._ignisApplied = true;
                if (context.logMsg) {
                    let msg = `・【パッシブ】魔導銃イグニスの効果！ ダメージ ＋${totalBonus}`;
                    if (hasBullet) msg += ` <small>（弾丸ボーナス適用）</small>`;
                    if (discardBonus > 0) msg += ` <small>（捨札 ${pureDiscardCount}枚ボーナス ＋${discardBonus}）</small>`;
                    context.logMsg(msg);
                }
                return { totalDmg: context.totalDmg + totalBonus, _ignisApplied: true };
            }
            return {};
        }
    }
};"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/card_effects_v5.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
