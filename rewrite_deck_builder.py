import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_click = """        div.addEventListener('click', () => {
            const currentCost = selectedCardsForDeck.reduce((sum, c) => sum + c.cost, 0);
            if (currentCost + card.cost > player.deckCapacity) {
                alert(`コストオーバーです！（上限: ${player.deckCapacity}）`);
                return;
            }
            if (card.effect.includes('制限：デッキ1枚') || card.effect.includes('【制限：デッキ1枚')) {
                if (selectedCardsForDeck.some(c => c.name === card.name)) {
                    alert(`「${card.name}」はデッキに1枚しか入れられません。`);
                    return;
                }
            }
            selectedCardsForDeck.push(card);
            renderSelectedDeck();
        });"""

new_click = """        div.addEventListener('click', () => {
            const currentCost = selectedCardsForDeck.reduce((sum, c) => sum + c.cost, 0);
            if (currentCost + card.cost > player.deckCapacity) {
                alert(`コストオーバーです！（上限: ${player.deckCapacity}）`);
                return;
            }
            if (card.effect.includes('制限：デッキ1枚') || card.effect.includes('【制限：デッキ1枚')) {
                if (selectedCardsForDeck.some(c => c.name === card.name)) {
                    alert(`「${card.name}」はデッキに1枚しか入れられません。`);
                    return;
                }
            }
            
            // 「ブーステッド」選択時の特別ルール
            const hasBoosted = selectedCardsForDeck.some(c => c.name === '『ブーステッド』');
            
            if (card.name === '『ブーステッド』') {
                // ブーステッドを追加しようとした場合、すでにデッキにあるコスト4以上のアクション・リアクションを除外
                const originalLength = selectedCardsForDeck.length;
                selectedCardsForDeck = selectedCardsForDeck.filter(c => {
                    const isActionOrReaction = c.category.includes('アクション') || c.category.includes('リアクション');
                    if (isActionOrReaction && c.cost >= 4) {
                        return false; // 除外
                    }
                    return true;
                });
                if (selectedCardsForDeck.length < originalLength) {
                    alert('【ブーステッド制限】デッキに入っていたコスト4以上のアクション/リアクションカードを自動除外しました。');
                }
            } else if (hasBoosted) {
                // すでにブーステッドがデッキにある場合、コスト4以上のアクション・リアクションは追加できない
                const isActionOrReaction = card.category.includes('アクション') || card.category.includes('リアクション');
                if (isActionOrReaction && card.cost >= 4) {
                    alert('【ブーステッド制限】コスト4以上のアクション/リアクションカードはデッキに追加できません。');
                    return;
                }
            }
            
            selectedCardsForDeck.push(card);
            renderSelectedDeck();
        });"""
content = content.replace(old_click, new_click)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
