with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

insert_code = """
function checkScrapRecycle(player) {
    const hasScrapRecycle = player.deck.passives.some(p => p.name === 'スクラップリサイクル' && !p.isDisabled);
    if (hasScrapRecycle) {
        const drawn = player.deck.draw(1);
        if (drawn > 0) {
            // setTimeout to avoid interfering with current log output flow
            setTimeout(() => {
                const originalLogMsg = typeof window.logMsg === 'function' ? window.logMsg : console.log;
                const logEl = document.getElementById('battle-log');
                if (logEl) {
                    const el = document.createElement('div');
                    el.className = 'log-msg log-important';
                    el.innerHTML = `【スクラップリサイクル】の効果発動！召喚ユニットが廃棄札に移動したため、山札から1枚引いた！`;
                    logEl.appendChild(el);
                    logEl.scrollTop = logEl.scrollHeight;
                }
                updateUI();
            }, 50);
        }
    }
}
"""

for i, line in enumerate(lines):
    if "function updateUI()" in line:
        lines.insert(i, insert_code)
        break

# Now replace where summons are pushed to void
for i, line in enumerate(lines):
    if "player.deck.void.push(s.card);" in line:
        # Avoid the cases where it's not a summon being destroyed
        # Actually s.card implies it's from `player.deck.summons.forEach(s => ...)`
        lines[i] = line.rstrip() + " checkScrapRecycle(player);\n"
        
with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
