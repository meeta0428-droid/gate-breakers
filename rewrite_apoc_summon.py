import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. requestRecoverCard の source 分岐の追加
old_source = """        let sourceArray;
        if (source === 'void') sourceArray = playerObj.deck.void;
        else if (source === 'hand') sourceArray = playerObj.deck.hand;
        else if (source === 'mountain') sourceArray = playerObj.deck.mountain;
        else if (source === 'void_or_discard') sourceArray = [...playerObj.deck.void, ...playerObj.deck.discard];
        else if (source === 'hand_or_discard') sourceArray = [...playerObj.deck.hand, ...playerObj.deck.discard];
        else sourceArray = playerObj.deck.discard;"""

new_source = """        let sourceArray;
        if (source === 'void') sourceArray = playerObj.deck.void;
        else if (source === 'hand') sourceArray = playerObj.deck.hand;
        else if (source === 'mountain') sourceArray = playerObj.deck.mountain;
        else if (source === 'all') sourceArray = cardPool;
        else if (source === 'void_or_discard') sourceArray = [...playerObj.deck.void, ...playerObj.deck.discard];
        else if (source === 'hand_or_discard') sourceArray = [...playerObj.deck.hand, ...playerObj.deck.discard];
        else sourceArray = playerObj.deck.discard;"""
content = content.replace(old_source, new_source)


# 2. アポクリファの発動処理の変更
old_trigger = """            // 『アポクリファ』
            if (card.name === '『アポクリファ』') {
                logMsg(`【『アポクリファ』の効果宣言！】<br><span style="color:#ffcc00; font-weight:bold;">※指定する「召喚」カードを手札から使用し、召喚エリアに配置してください。<br>その後は、その召喚ユニットの「攻撃」「防御」「ダメージを受ける」ボタンを利用することで、自動的に数値が適用されます。</span>`, 'important');
                els.cardDetailModal.classList.add('hidden');
                updateUI();
                return;
            }"""

new_trigger = """            // 『アポクリファ』
            if (card.name === '『アポクリファ』') {
                window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                    detail: {
                        title: "『アポクリファ』：指定する召喚ユニットを選択",
                        desc: "ゲーム内のすべての「召喚」カードから1枚選んでください。",
                        playerObj: player,
                        source: 'all',
                        filterFunc: (c) => c.effect.includes('召喚'),
                        onSelect: (selectedCard) => {
                            // 選んだカードをJSONの参照から複製して扱う
                            const clonedCard = JSON.parse(JSON.stringify(selectedCard));
                            const initStance = clonedCard.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'attack';
                            player.deck.summons.push({ card: clonedCard, stance: initStance, isApocrypha: true });
                            logMsg(`【『アポクリファ』】効果発動！<br><span style="color:#ffcc00; font-weight:bold;">全カードから「${clonedCard.name}」を指定し、召喚エリアに配置しました！</span><br>（※以降は、この召喚ユニットの「攻撃」「防御」「ダメージを受ける」ボタンを利用することで、自動的に数値が適用されます）`, 'important');
                        }
                    }
                }));
                els.cardDetailModal.classList.add('hidden');
                return;
            }"""
content = content.replace(old_trigger, new_trigger)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
