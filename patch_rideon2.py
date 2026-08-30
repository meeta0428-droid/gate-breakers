with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "updateDiscardModalUI();" in line and "els.discardModal.classList.remove('hidden');" in lines[i+1]:
        insert_code = """
        // ライドオンの処理
        const hasRideOn = player.deck.passives.some(p => p.name === 'ライドオン' && !p.isDisabled);
        if (hasRideOn && player.deck.summons.length > 0) {
            const validCards = [...player.deck.discard, ...player.deck.void].filter(c => c.cost <= 3);
            if (validCards.length > 0) {
                window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                    detail: {
                        title: "ライドオンの効果",
                        desc: "捨札または廃棄札から、コスト3以下のカードを1枚選んで手札に加えてください。",
                        playerObj: player,
                        source: 'void_or_discard',
                        filterFunc: (c) => c.cost <= 3,
                        onSelect: (selectedCard) => {
                            player.deck.hand.push(selectedCard);
                            logMsg(`【ライドオン】回収フェイズ効果発動！コスト3以下の「${selectedCard.name}」を手札に回収しました！`, 'important');
                            updateUI();
                            updateDiscardModalUI();
                        }
                    }
                }));
            }
        }
"""
        lines.insert(i+2, insert_code)
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
