import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. openCardModal の条件追加
old_modal_cond = """                } else if (card.name === 'バディビースト') {
                    els.btnTriggerPassive.innerText = '自身を召喚する';
                    els.btnTriggerPassive.classList.remove('hidden');"""
new_modal_cond = """                } else if (card.name === 'バディビースト') {
                    els.btnTriggerPassive.innerText = '自身を召喚する';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '金の加護') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');"""
content = content.replace(old_modal_cond, new_modal_cond)


# 2. btnTriggerPassive に効果処理を追加
old_trigger_logic = """                if (passiveCard.name === 'バディビースト') {
                    const pIdx = player.deck.passives.findIndex(p => p === passiveCard);
                    if (pIdx > -1) {
                        player.deck.passives.splice(pIdx, 1);
                        player.deck.summons.push({ card: passiveCard, stance: 'both' });
                        logMsg(`【バディビースト】自身を召喚エリアに配置しました！`, 'important');
                        els.modal.classList.add('hidden');
                        updateUI();
                    }
                    return;
                }"""
new_trigger_logic = """                if (passiveCard.name === 'バディビースト') {
                    const pIdx = player.deck.passives.findIndex(p => p === passiveCard);
                    if (pIdx > -1) {
                        player.deck.passives.splice(pIdx, 1);
                        player.deck.summons.push({ card: passiveCard, stance: 'both' });
                        logMsg(`【バディビースト】自身を召喚エリアに配置しました！`, 'important');
                        els.modal.classList.add('hidden');
                        updateUI();
                    }
                    return;
                }
                
                if (passiveCard.name === '金の加護') {
                    const passiveVoidCards = player.deck.void.filter(c => c.category.includes('パッシブ'));
                    if (passiveVoidCards.length === 0) {
                        alert('廃棄札の中にパッシブカテゴリーのカードがありません。');
                        return;
                    }
                    
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: "金の加護：山札に戻すカードを選択",
                            desc: "廃棄札からパッシブカードを1枚選んでください。",
                            playerObj: player,
                            source: 'void',
                            filterFunc: (c) => c.category.includes('パッシブ'),
                            onSelect: (recoveredCard) => {
                                // 山札に戻す（シャッフルするわけではないが、一番下でも上でもシステム上山札に入ればドローできるようになる。末尾に追加。）
                                player.deck.mountain.push(recoveredCard);
                                
                                // 金の加護自身を廃棄札へ移動
                                const pIdx = player.deck.passives.indexOf(passiveCard);
                                if (pIdx > -1) {
                                    player.deck.passives.splice(pIdx, 1);
                                }
                                player.deck.void.push(passiveCard);
                                
                                logMsg(`【金の加護】効果発動！廃棄札から「${recoveredCard.name}」を山札に戻しました。<br><small>※金の加護は使用されたため廃棄札に移動しました。</small>`, 'important');
                                updateUI();
                            }
                        }
                    }));
                    return;
                }"""
content = content.replace(old_trigger_logic, new_trigger_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
