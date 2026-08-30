with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

insert_code = """
        if (player.deck.discard.some(c => c.name === 'ワイヤートラップ')) {
            summonLog += `<span style="color:#ffcc00; font-weight:bold;">・【ワイヤートラップ】捨札時効果 (攻撃してきた対象のイニシアチブ-2)</span><br>`;
        }
        summonLog += passiveDefLog;
"""

content = content.replace(
    "summonLog += passiveDefLog;",
    insert_code.lstrip('\n')
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
