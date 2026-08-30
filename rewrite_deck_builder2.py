import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_click = """            // 「ブーステッド」選択時の特別ルール
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
            }"""

new_click = """            // 「ブーステッド」選択時の特別ルール
            const hasBoosted = selectedCardsForDeck.some(c => c.name === '『ブーステッド』');
            
            const isProhibitedByBoosted = (c) => {
                if (c.effect && c.effect.includes('【メビウス専用】')) return false; // 専用カードは許可
                
                // コスト4以上の アクション・リアクション・召喚・弾丸 を禁止
                const isTargetCat = c.category.includes('アクション') || c.category.includes('リアクション') || c.category.includes('召喚') || c.category.includes('弾丸');
                if (isTargetCat && c.cost >= 4) {
                    return true;
                }
                return false;
            };
            
            if (card.name === '『ブーステッド』') {
                const originalLength = selectedCardsForDeck.length;
                selectedCardsForDeck = selectedCardsForDeck.filter(c => !isProhibitedByBoosted(c));
                if (selectedCardsForDeck.length < originalLength) {
                    alert('【ブーステッド制限】デッキに入っていたコスト4以上の対象カード（アクション/リアクション/召喚/弾丸）を自動除外しました。');
                }
            } else if (hasBoosted) {
                if (isProhibitedByBoosted(card)) {
                    alert('【ブーステッド制限】コスト4以上の対象カード（アクション/リアクション/召喚/弾丸）はデッキに追加できません。');
                    return;
                }
            }"""
content = content.replace(old_click, new_click)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
