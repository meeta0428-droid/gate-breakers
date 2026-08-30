import re

with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

scrap_logic = """
                    // スクラップリサイクル
                    const hasScrap = player.deck.passives.some(p => p.name === 'スクラップリサイクル' && !p.isDisabled);
                    if (hasScrap) {
                        const drawn = player.deck.draw(1);
                        if (drawn > 0) {
                            logMsg(`【スクラップリサイクル】の効果で召喚ユニットが廃棄札に移動したため、山札から1枚引きました！`, 'important');
                        }
                    }
"""

content = content.replace(
    'logMsg(`召喚ユニット「${s.card.name}」を廃棄札へ移動しました。`);',
    'logMsg(`召喚ユニット「${s.card.name}」を廃棄札へ移動しました。`);' + scrap_logic
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
