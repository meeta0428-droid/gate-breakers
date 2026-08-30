import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. openCardModal
old_cond = """                } else if (card.name === 'バディビースト') {
                    els.btnTriggerPassive.innerText = '自身を召喚する';
                    els.btnTriggerPassive.classList.remove('hidden');"""
new_cond = """                } else if (card.name === 'バディビースト' || card.name === '相棒の獣' || card.name === '相棒の鳥' || card.name === '相棒の竜') {
                    els.btnTriggerPassive.innerText = '自身を召喚する';
                    els.btnTriggerPassive.classList.remove('hidden');"""
content = content.replace(old_cond, new_cond)

# 2. btnTriggerPassive
old_logic = """                if (passiveCard.name === 'バディビースト') {
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
new_logic = """                if (passiveCard.name === 'バディビースト' || passiveCard.name === '相棒の獣' || passiveCard.name === '相棒の鳥' || passiveCard.name === '相棒の竜') {
                    const pIdx = player.deck.passives.findIndex(p => p === passiveCard);
                    if (pIdx > -1) {
                        player.deck.passives.splice(pIdx, 1);
                        player.deck.summons.push({ card: passiveCard, stance: 'both' });
                        logMsg(`【${passiveCard.name}】自身を召喚エリアに配置しました！`, 'important');
                        els.modal.classList.add('hidden');
                        updateUI();
                    }
                    return;
                }"""
content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
