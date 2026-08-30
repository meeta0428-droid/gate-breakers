with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "logMsg(`手札に ${recoveredNames.length}枚 回収しました！<br><small>(${recoveredNames.join(', ')})</small>`);" in line:
        insert_code = """
        // チェイスダウンの自動回収チェック
        if (player.initiative > 10) {
            for (let i = player.deck.discard.length - 1; i >= 0; i--) {
                const c = player.deck.discard[i];
                if (c.name === 'チェイスダウン') {
                    player.deck.discard.splice(i, 1);
                    player.deck.hand.push(c);
                    recoveredNames.push(c.name);
                    logMsg(`【チェイスダウン】イニシアチブ10超過により、捨札から自動回収されました！`, 'important');
                }
            }
        }
"""
        lines.insert(i, insert_code)
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
