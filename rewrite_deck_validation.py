import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. クリック時の「デッキ1枚制限」バリデーション
old_click = """            if (currentCost + card.cost > player.deckCapacity) {
                alert(`コストオーバーです！（上限: ${player.deckCapacity}）`);
                return;
            }
            selectedCardsForDeck.push(card);"""

new_click = """            if (currentCost + card.cost > player.deckCapacity) {
                alert(`コストオーバーです！（上限: ${player.deckCapacity}）`);
                return;
            }
            if (card.effect.includes('制限：デッキ1枚') || card.effect.includes('【制限：デッキ1枚')) {
                if (selectedCardsForDeck.some(c => c.name === card.name)) {
                    alert(`「${card.name}」はデッキに1枚しか入れられません。`);
                    return;
                }
            }
            selectedCardsForDeck.push(card);"""
content = content.replace(old_click, new_click)

# 2. 開始時の「他召喚カード」バリデーション
old_start = """    els.btnStartBattle.addEventListener('click', () => {
        const currentCost = selectedCardsForDeck.reduce((sum, c) => sum + c.cost, 0);
        if (selectedCardsForDeck.length === 0) {
            alert('カードを選択してください！');
            return;
        }
        if (currentCost !== player.deckCapacity) {"""

new_start = """    els.btnStartBattle.addEventListener('click', () => {
        const currentCost = selectedCardsForDeck.reduce((sum, c) => sum + c.cost, 0);
        if (selectedCardsForDeck.length === 0) {
            alert('カードを選択してください！');
            return;
        }
        
        // ウィスプ（他召喚カードを所有）のバリデーション
        const wispCards = selectedCardsForDeck.filter(c => c.name === 'ウィスプ');
        if (wispCards.length > 0) {
            const hasOtherSummon = selectedCardsForDeck.some(c => c.name !== 'ウィスプ' && (c.category.includes('召喚') || c.effect.includes('召喚・攻')));
            if (!hasOtherSummon) {
                alert('【制限】「ウィスプ」をデッキに入れるには、他に「召喚」カードを入れる必要があります。');
                return;
            }
        }
        
        if (currentCost !== player.deckCapacity) {"""
content = content.replace(old_start, new_start)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
