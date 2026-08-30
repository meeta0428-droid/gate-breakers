with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "} else if (card.name === '武具錬成') {" in line:
        insert_code = """                } else if (card.name === 'リアクティブアーマー') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');
"""
        lines.insert(i, insert_code)
        break

for i, line in enumerate(lines):
    if "if (passiveCard.name === '武具錬成') {" in line:
        insert_code = """
                if (passiveCard.name === 'リアクティブアーマー') {
                    const pIdx = player.deck.passives.findIndex(p => p === passiveCard);
                    if (pIdx > -1) {
                        player.deck.passives.splice(pIdx, 1);
                        player.deck.void.push(passiveCard);
                        logMsg(`【リアクティブアーマー】効果を発動！ダメージ以外の不利な効果を全て無効化し、自身は廃棄札に移動した！`, 'important');
                        updateUI();
                    }
                    els.modal.classList.add('hidden');
                    return;
                }
"""
        lines.insert(i, insert_code)
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
