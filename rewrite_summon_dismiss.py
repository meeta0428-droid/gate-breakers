import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_dismiss = """            sDiv.querySelector('.summon-btn-dismiss').addEventListener('click', () => {
                if (confirm(`${s.card.name} を廃棄してよろしいですか？`)) {
                    player.deck.summons.splice(idx, 1);
                    if (s.card.name === 'シルフ') {
                        player.deck.hand.push(s.card);
                        logMsg(`「${s.card.name}」は破壊され、手札に戻った！`);
                    } else {
                        player.deck.discard.push(s.card);
                    }
                    updateUI();
                }
            });"""

new_dismiss = """            sDiv.querySelector('.summon-btn-dismiss').addEventListener('click', () => {
                if (confirm(`${s.card.name} を廃棄札へ移動してよろしいですか？\\n（※「廃棄札に移動することで〜」等の効果を発動する場合に使用します）`)) {
                    player.deck.summons.splice(idx, 1);
                    if (s.card.name === 'シルフ') {
                        player.deck.hand.push(s.card);
                        logMsg(`「${s.card.name}」は破壊され、手札に戻った！`);
                    } else {
                        player.deck.void.push(s.card);
                        logMsg(`召喚ユニット「${s.card.name}」を廃棄札へ移動しました！<br><span style="color:#aaa; font-size:0.8rem;">【効果】${s.card.effect}</span>`, 'important');
                    }
                    updateUI();
                }
            });"""
            
content = content.replace(old_dismiss, new_dismiss)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
