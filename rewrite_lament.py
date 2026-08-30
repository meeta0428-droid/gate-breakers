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
    // 魔剣ラメント：ダメージ＋1。廃棄札2枚につきダメージ＋1。能力値に受けたダメージと同じ数値だけダメージを上昇。
    "魔剣ラメント": {
        onAttack: (context) => {
            if (!context.currentCombo || context.totalDmg <= 0) return {};
            if (!context._lamentApplied) {
                const voidCount = context.player.deck.void.length;
                const voidBonus = Math.floor(voidCount / 2);
                
                const stats = context.player.stats;
                const bodyDmg = Math.max(0, stats.body.maxVal - stats.body.currentVal);
                const intDmg = Math.max(0, stats.int.maxVal - stats.int.currentVal);
                const menDmg = Math.max(0, stats.men.maxVal - stats.men.currentVal);
                const statDmgBonus = bodyDmg + intDmg + menDmg;
                
                const baseBonus = 1;
                const totalBonus = baseBonus + voidBonus + statDmgBonus;
                
                context._lamentApplied = true;
                if (context.logMsg) {
                    let msg = `・【パッシブ】魔剣ラメントの効果！ ダメージ ＋${totalBonus}`;
                    let detail = [];
                    if (voidBonus > 0) detail.push(`廃棄札 ${voidCount}枚ボーナス ＋${voidBonus}`);
                    if (statDmgBonus > 0) detail.push(`負傷ボーナス ＋${statDmgBonus}`);
                    if (detail.length > 0) {
                        msg += ` <small>（${detail.join(' / ')}）</small>`;
                    }
                    context.logMsg(msg);
                }
                return { totalDmg: context.totalDmg + totalBonus, _lamentApplied: true };
            }
            return {};
        }
    }
};"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/card_effects_v5.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
