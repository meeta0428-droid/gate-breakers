import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. updateDiscardModalUI の修正
old_calc_cost = """        let costBody = 0, costInt = 0, costMen = 0, costAll = 0;
        recoveringCards.forEach(idx => {
            const card = player.deck.discard[idx];
            let actualCost = getDisplayCost(card, player);"""

new_calc_cost = """        // ★回収可能リストの生成（不死者対応）
        window._currentRecoverableCards = player.deck.discard.map((card, originalIdx) => ({ card, originalIdx, source: 'discard' }));
        const hasUndead = player.deck.passives.some(p => p.name === '『不死者』');
        if (hasUndead) {
            const undeadVoidCards = player.deck.void
                .map((card, originalIdx) => ({ card, originalIdx, source: 'void' }))
                .filter(item => item.card.cost <= 3);
            window._currentRecoverableCards = window._currentRecoverableCards.concat(undeadVoidCards);
        }

        let costBody = 0, costInt = 0, costMen = 0, costAll = 0;
        recoveringCards.forEach(idx => {
            const cardItem = window._currentRecoverableCards[idx];
            if (!cardItem) return;
            const card = cardItem.card;
            let actualCost = getDisplayCost(card, player);"""
content = content.replace(old_calc_cost, new_calc_cost)

# 2. リスト生成部分の修正
old_render = """        els.discardList.innerHTML = '';
        if (player.deck.discard.length === 0) {
            els.discardList.innerHTML = '<p style="color:#aaa;">捨札はありません</p>';
        } else {
            player.deck.discard.forEach((card, idx) => {
                const item = document.createElement('div');
                item.className = 'discard-item';"""

new_render = """        els.discardList.innerHTML = '';
        if (window._currentRecoverableCards.length === 0) {
            els.discardList.innerHTML = '<p style="color:#aaa;">回収可能なカードがありません</p>';
        } else {
            window._currentRecoverableCards.forEach((cardItem, idx) => {
                const card = cardItem.card;
                const isFromVoid = cardItem.source === 'void';
                const item = document.createElement('div');
                item.className = 'discard-item';"""
content = content.replace(old_render, new_render)

old_target = """                            const targetCard = player.deck.discard[idx];
                            targetCard._fromDiscard = true;
                            currentCombo.push(targetCard);
                            logMsg(`【${targetCard.name}】の効果！捨札から場に出した！`);"""
new_target = """                            const targetCard = window._currentRecoverableCards[idx].card;
                            targetCard._fromDiscard = true;
                            currentCombo.push(targetCard);
                            logMsg(`【${targetCard.name}】の効果！捨札（または廃棄札）から場に出した！`);"""
content = content.replace(old_target, new_target)


old_item_html = """                    item.innerHTML = `
                        <div><strong>${card.name}</strong><br><small style="color:#aaa;">${card.category}</small></div>
                        <div style="text-align:right;">
                            <div>${costDisplay}</div>
                            ${useBtnHtml}
                        </div>
                    `;"""
new_item_html = """                    const voidBadge = isFromVoid ? `<span style="background-color:#552222; color:#ffaaaa; padding:2px 4px; border-radius:3px; font-size:0.7rem; margin-right:5px;">廃棄札</span>` : '';
                    item.innerHTML = `
                        <div>${voidBadge}<strong>${card.name}</strong><br><small style="color:#aaa;">${card.category}</small></div>
                        <div style="text-align:right;">
                            <div>${costDisplay}</div>
                            ${useBtnHtml}
                        </div>
                    `;"""
content = content.replace(old_item_html, new_item_html)

# 3. 実行ボタンの処理
old_exec = """    document.getElementById('btn-execute-recover').addEventListener('click', () => {
        if (recoveringCards.size === 0) return;
        
        // idxの降順で処理しないとspliceでズレるため、降順ソート
        const sortedIndices = Array.from(recoveringCards).sort((a, b) => b - a);
        let recoveredNames = [];
        for (const idx of sortedIndices) {
            const card = player.deck.discard[idx];
            player.deck.discard.splice(idx, 1);
            player.deck.hand.push(card);
            recoveredNames.push(card.name);
        }
        logMsg(`捨札から ${recoveredNames.length}枚 回収しました！<br><small>(${recoveredNames.join(', ')})</small>`);
        els.discardModal.classList.add('hidden');"""

new_exec = """    document.getElementById('btn-execute-recover').addEventListener('click', () => {
        if (recoveringCards.size === 0) return;
        
        const selectedItems = Array.from(recoveringCards).map(idx => window._currentRecoverableCards[idx]).filter(item => item);
        let recoveredNames = [];
        
        // 元の配列から削除するため、sourceごとに分けて originalIdx の降順でソート
        const discardItems = selectedItems.filter(i => i.source === 'discard').sort((a, b) => b.originalIdx - a.originalIdx);
        const voidItems = selectedItems.filter(i => i.source === 'void').sort((a, b) => b.originalIdx - a.originalIdx);
        
        for (const item of discardItems) {
            player.deck.discard.splice(item.originalIdx, 1);
            player.deck.hand.push(item.card);
            recoveredNames.push(item.card.name);
        }
        for (const item of voidItems) {
            player.deck.void.splice(item.originalIdx, 1);
            player.deck.hand.push(item.card);
            recoveredNames.push(item.card.name);
        }
        
        logMsg(`手札に ${recoveredNames.length}枚 回収しました！<br><small>(${recoveredNames.join(', ')})</small>`);
        els.discardModal.classList.add('hidden');"""
content = content.replace(old_exec, new_exec)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
