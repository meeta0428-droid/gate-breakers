import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. オープン時のボタン表記
old_open = """                } else if (card.name === 'ウンディーネ') {
                    els.btnTriggerPassive.innerText = '効果を発動（廃棄札2枚を山札へ）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === 'サラマンダー') {
                    els.btnTriggerPassive.innerText = '効果を発動（ダメージ＋9）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else {
                    els.btnTriggerPassive.classList.add('hidden');
                }
            }"""

new_open = """                } else if (card.name === 'ウンディーネ') {
                    els.btnTriggerPassive.innerText = '効果を発動（廃棄札2枚を山札へ）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === 'サラマンダー') {
                    els.btnTriggerPassive.innerText = '効果を発動（ダメージ＋9）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '『不死者』') {
                    if (player._undeadUsed) {
                        els.btnTriggerPassive.innerText = '使用済み';
                        els.btnTriggerPassive.disabled = true;
                        els.btnTriggerPassive.classList.remove('hidden');
                    } else {
                        els.btnTriggerPassive.innerText = '効果を発動（コスト3以下を無償回収）';
                        els.btnTriggerPassive.disabled = false;
                        els.btnTriggerPassive.classList.remove('hidden');
                    }
                } else {
                    els.btnTriggerPassive.classList.add('hidden');
                }
            }"""
content = content.replace(old_open, new_open)

# 2. トリガー処理
old_trigger = """                if (passiveCard.name === '武具錬成') {
                    logMsg(`【武具錬成】効果を対象に共有しました！<br><span style="color:#ffcc00; font-size:0.9rem;">（対象の攻撃ダメージ＋1、または受けるダメージ1点軽減）</span>`, 'important');
                    return;
                }"""
new_trigger = """                if (passiveCard.name === '武具錬成') {
                    logMsg(`【武具錬成】効果を対象に共有しました！<br><span style="color:#ffcc00; font-size:0.9rem;">（対象の攻撃ダメージ＋1、または受けるダメージ1点軽減）</span>`, 'important');
                    return;
                }

                if (passiveCard.name === '『不死者』') {
                    if (player._undeadUsed) {
                        alert('この効果は1ラウンドに1回しか使用できません。');
                        return;
                    }
                    const voidCards = player.deck.void.filter(c => c.cost <= 3);
                    if (voidCards.length === 0) {
                        alert('廃棄札にコスト3以下のカードがありません。');
                        return;
                    }
                    
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: "『不死者』：無償回収",
                            desc: "手札に戻すカードを1枚選んでください。",
                            playerObj: player,
                            source: 'void',
                            filterFunc: (c) => c.cost <= 3,
                            onSelect: (selectedCard) => {
                                player.deck.hand.push(selectedCard);
                                player._undeadUsed = true;
                                logMsg(`【『不死者』の効果】廃棄札から「${selectedCard.name}」を無償で手札に戻しました！`, 'important');
                                updateUI();
                            }
                        }
                    }));
                    return;
                }"""
content = content.replace(old_trigger, new_trigger)


# 3. ラウンド更新時のリセット
old_reset = """        // 新ラウンド開始時に各ターン1回フラグをリセット
        player.deck.hasUsedCyomancer = false;
        player.deck.hasUsedKyoudousensen = false;
        
        updateUI();"""

new_reset = """        // 新ラウンド開始時に各ターン1回フラグをリセット
        player.deck.hasUsedCyomancer = false;
        player.deck.hasUsedKyoudousensen = false;
        player._undeadUsed = false;
        
        updateUI();"""
content = content.replace(old_reset, new_reset)

# 4. v236の updateDiscardModalUI から不死者関連を削除 (元に戻す)
old_v236 = """        // ★回収可能リストの生成（不死者対応）
        window._currentRecoverableCards = player.deck.discard.map((card, originalIdx) => ({ card, originalIdx, source: 'discard' }));
        const hasUndead = player.deck.passives.some(p => p.name === '『不死者』');
        if (hasUndead) {
            const undeadVoidCards = player.deck.void
                .map((card, originalIdx) => ({ card, originalIdx, source: 'void' }))
                .filter(item => item.card.cost <= 3);
            window._currentRecoverableCards = window._currentRecoverableCards.concat(undeadVoidCards);
        }"""
new_v236 = """        // ★回収可能リストの生成
        window._currentRecoverableCards = player.deck.discard.map((card, originalIdx) => ({ card, originalIdx, source: 'discard' }));"""
content = content.replace(old_v236, new_v236)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
