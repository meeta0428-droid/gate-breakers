import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. finalizeAttackCombo の入れ替え
old_atk = """                if (/このカードは.*?廃棄札.*?移動する/.test(card.effect)) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        originalLogMsg(`「${card.name}」は使用されたため廃棄札に移動した。`);
                    }
                    return;
                }
                
                if (card.category.includes('召喚') || card.effect.includes('召喚・攻')) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'attack';
                        player.deck.summons.push({ card: card, stance: initStance });
                        if (card.name === 'ウィスプ') {
                            const drawn = player.deck.draw(1);
                            if (drawn > 0) logMsg(`【ウィスプ】召喚時効果：山札からカードを1枚引いた！`, 'important');
                        }
                        if (card.name === 'ケットシー') {
                            const drawn = player.deck.draw(2);
                            if (drawn > 0) logMsg(`【ケットシー】召喚時効果：山札からカードを${drawn}枚引いた！`, 'important');
                        }
                    }
                } else if (toVoid.has(idx)) {"""

new_atk = """                if (card.category.includes('召喚') || card.effect.includes('召喚・攻')) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'attack';
                        player.deck.summons.push({ card: card, stance: initStance });
                        if (card.name === 'ウィスプ') {
                            const drawn = player.deck.draw(1);
                            if (drawn > 0) logMsg(`【ウィスプ】召喚時効果：山札からカードを1枚引いた！`, 'important');
                        }
                        if (card.name === 'ケットシー') {
                            const drawn = player.deck.draw(2);
                            if (drawn > 0) logMsg(`【ケットシー】召喚時効果：山札からカードを${drawn}枚引いた！`, 'important');
                        }
                    }
                    return;
                }
                
                if (/このカードは.*?廃棄札.*?移動する/.test(card.effect)) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        originalLogMsg(`「${card.name}」は使用されたため廃棄札に移動した。`);
                    }
                    return;
                }
                
                if (toVoid.has(idx)) {"""
content = content.replace(old_atk, new_atk)


# 2. finalizeDefendCombo の入れ替え
old_def = """                if (/このカードは.*?廃棄札.*?移動する/.test(card.effect)) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        logMsg(`「${card.name}」は効果により廃棄札に移動した。`);
                    }
                    return;
                }

                if (card.category.includes('召喚') || card.effect.includes('召喚・攻')) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'defend';
                        player.deck.summons.push({ card: card, stance: initStance });
                        if (card.name === 'ウィスプ') {
                            const drawn = player.deck.draw(1);
                            if (drawn > 0) logMsg(`【ウィスプ】召喚時効果：山札からカードを1枚引いた！`, 'important');
                        }
                        if (card.name === 'ケットシー') {
                            const drawn = player.deck.draw(2);
                            if (drawn > 0) logMsg(`【ケットシー】召喚時効果：山札からカードを${drawn}枚引いた！`, 'important');
                        }
                    }
                } else if (toVoid.has(idx)) {"""

new_def = """                if (card.category.includes('召喚') || card.effect.includes('召喚・攻')) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'defend';
                        player.deck.summons.push({ card: card, stance: initStance });
                        if (card.name === 'ウィスプ') {
                            const drawn = player.deck.draw(1);
                            if (drawn > 0) logMsg(`【ウィスプ】召喚時効果：山札からカードを1枚引いた！`, 'important');
                        }
                        if (card.name === 'ケットシー') {
                            const drawn = player.deck.draw(2);
                            if (drawn > 0) logMsg(`【ケットシー】召喚時効果：山札からカードを${drawn}枚引いた！`, 'important');
                        }
                    }
                    return;
                }

                if (/このカードは.*?廃棄札.*?移動する/.test(card.effect)) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        logMsg(`「${card.name}」は効果により廃棄札に移動した。`);
                    }
                    return;
                }

                if (toVoid.has(idx)) {"""
content = content.replace(old_def, new_def)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
