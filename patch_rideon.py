import re

with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

btn_logic = """                } else if (card.name === 'ライドオン') {
                    els.btnTriggerPassive.innerText = '回収フェイズ効果発動';
                    els.btnTriggerPassive.classList.remove('hidden');
"""

content = content.replace(
    "} else if (card.name === '金の加護') {",
    btn_logic + "} else if (card.name === '金の加護') {"
)

trigger_logic = """                if (passiveCard.name === 'ライドオン') {
                    if (player.deck.summons.length === 0) {
                        alert('場に召喚ユニットがいません！');
                        return;
                    }
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: "ライドオンの効果",
                            desc: "捨札または廃棄札から、コスト3以下のカードを1枚選んで手札に加えてください。",
                            playerObj: player,
                            source: 'all', // all means discard+void
                            filterFunc: (c) => c.cost <= 3,
                            onSelect: (selectedCard) => {
                                player.deck.hand.push(selectedCard);
                                logMsg(`【ライドオン】の効果で、コスト3以下の「${selectedCard.name}」を手札に回収しました！`, 'important');
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
