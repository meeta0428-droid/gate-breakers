with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "} else if (card.name === '機工士') {" in line:
        insert_code = """                } else if (card.name === '機工士') {
                    if (card.hasUsed) {
                        els.btnTriggerPassive.innerText = '使用済み (0/1)';
                        els.btnTriggerPassive.disabled = true;
                    } else {
                        els.btnTriggerPassive.innerText = '召喚ユニットを回収 (1/1)';
                        els.btnTriggerPassive.disabled = false;
                    }
                    els.btnTriggerPassive.classList.remove('hidden');
"""
        lines[i:i+3] = [insert_code]
        break

for i, line in enumerate(lines):
    if "if (passiveCard.name === '機工士') {" in line:
        for j in range(i, i+30):
            if "onSelect: (selectedCard) => {" in lines[j]:
                insert_code = """                            onSelect: (selectedCard) => {
                                const voidIdx = player.deck.void.indexOf(selectedCard);
                                if (voidIdx > -1) player.deck.void.splice(voidIdx, 1);
                                player.deck.hand.push(selectedCard);
                                logMsg(`【機工士】の効果で、廃棄札から「${selectedCard.name}」を手札に戻しました！`, 'important');
                                passiveCard.hasUsed = true;
                                updateUI();
                            }
"""
                # find end of onSelect
                for k in range(j+1, j+20):
                    if "}" in lines[k] and "}" in lines[k+1] and "));" in lines[k+2]:
                        lines[j:k+1] = [insert_code]
                        break
                break
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
