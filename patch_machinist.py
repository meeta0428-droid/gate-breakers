import re

with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

btn_logic = """                } else if (card.name === '機工士') {
                    els.btnTriggerPassive.innerText = '召喚ユニットを回収 (1/1)';
                    els.btnTriggerPassive.classList.remove('hidden');
"""

content = content.replace(
    "} else if (card.name === '金の加護') {",
    btn_logic + "} else if (card.name === '金の加護') {"
)

trigger_logic = """                if (passiveCard.name === '機工士') {
                    if (passiveCard.hasUsed) {
                        alert('機工士の効果は戦闘中に1度しか使えません。');
                        return;
                    }
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: "機工士の効果",
                            desc: "廃棄札から手札に戻す召喚ユニットを1枚選んでください。",
                            playerObj: player,
                            source: 'void',
                            filterFunc: (c) => c.category.includes('召喚') || c.effect.includes('召喚'),
                            onSelect: (selectedCard) => {
                                player.deck.hand.push(selectedCard);
                                logMsg(`【機工士】の効果で、廃棄札から「${selectedCard.name}」を手札に戻しました！`, 'important');
                                passiveCard.hasUsed = true;
                                updateUI();
                            }
                        }
                    }));
                    els.cardModal.classList.add('hidden');
                    return;
                }
"""

content = content.replace(
    "if (passiveCard.name === 'バディビースト'",
    trigger_logic + "                if (passiveCard.name === 'バディビースト'"
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
