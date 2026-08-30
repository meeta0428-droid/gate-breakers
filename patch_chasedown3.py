with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "els.btnDiscardView.addEventListener('click', () => {" in line:
        insert_code = """
        // チェイスダウンの自動回収
        let autoRecovered = [];
        if (player.initiative > 10) {
            for (let j = player.deck.discard.length - 1; j >= 0; j--) {
                const c = player.deck.discard[j];
                if (c.name === 'チェイスダウン') {
                    player.deck.discard.splice(j, 1);
                    player.deck.hand.push(c);
                    autoRecovered.push(c.name);
                }
            }
        }
        if (autoRecovered.length > 0) {
            logMsg(`【チェイスダウン】イニシアチブ10超過により、捨札から自動回収されました！`, 'important');
        }
"""
        lines.insert(i+1, insert_code)
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
