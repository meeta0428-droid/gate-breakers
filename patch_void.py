import re

with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_function = """
function handleSummonVoided(player, voidedCard) {
    const hasScrapRecycle = player.deck.passives.some(p => p.name === 'スクラップリサイクル' && !p.isDisabled);
    if (hasScrapRecycle) {
        const drawn = player.deck.draw(1);
        if (drawn > 0) {
            logMsg(`【スクラップリサイクル】の効果発動！召喚ユニットが廃棄札に移動したため、山札から1枚引いた！`, 'important');
        }
    }
    
    const hasDistractOrder = player.deck.passives.some(p => p.name === 'ディストラクトオーダー' && !p.isDisabled);
    if (hasDistractOrder) {
        const dmg = 5 + (voidedCard ? voidedCard.cost : 0);
        enemyHp -= dmg;
        if (typeof showDamagePopup === 'function') {
            showDamagePopup(dmg);
        }
        logMsg(`【ディストラクトオーダー】の効果発動！召喚ユニットが廃棄札に移動したため、対象に <span class="damage">${dmg}</span> 点のダメージを与えた！（基礎5＋コスト${voidedCard ? voidedCard.cost : 0}）`, 'important');
    }
}
"""

content = re.sub(
    r'function checkScrapRecycle\(player\) \{.*?\}\n', 
    new_function.strip() + '\n', 
    content, 
    flags=re.DOTALL
)

# Now replace calls
content = content.replace("checkScrapRecycle(player);", "handleSummonVoided(player, arguments[0]);")

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
