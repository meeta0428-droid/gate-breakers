import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/card_effects_v5.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_hook = """    "エルダースタッグ": {
        onBeforeDamageTaken: (context) => {
            let { pendingDamage, logMsg, card } = context;
            const reduced = Math.floor(pendingDamage / 2);
            if (pendingDamage > 0) {
                logMsg(`【${card.name}】の効果発動！ダメージを半減（${pendingDamage} → ${reduced}）`, 'important');
            }
            return { pendingDamage: reduced };
        }
    },"""

new_hook = """    "エルダースタッグ": {
        onBeforeDamageTaken: (context) => {
            let { pendingDamage, logMsg, card, player } = context;
            if (pendingDamage > 0) {
                const doStagHalf = confirm(`【エルダースタッグ】が場にいます。\\nエルダースタッグを廃棄して、受けるダメージ（${pendingDamage}点）を「半減」しますか？\\n（※OKを押すと廃棄札に移動し、計算後の最終ダメージが半分(端数切り上げ)になります）`);
                if (doStagHalf) {
                    const reduced = Math.ceil(pendingDamage / 2);
                    logMsg(`【${card.name}】ユニットを廃棄し、受けるダメージを半減した！（${pendingDamage} → ${reduced}）`, 'important');
                    
                    // 廃棄札へ移動
                    if (player && player.deck && player.deck.summons) {
                        const stagIdx = player.deck.summons.findIndex(s => s.card.name === 'エルダースタッグ');
                        if (stagIdx > -1) {
                            const stagCard = player.deck.summons[stagIdx].card;
                            player.deck.summons.splice(stagIdx, 1);
                            player.deck.void.push(stagCard);
                        }
                    }
                    
                    return { pendingDamage: reduced };
                }
            }
            return context;
        }
    },"""
content = content.replace(old_hook, new_hook)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/card_effects_v5.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("card_effects_v5.js update done.")
