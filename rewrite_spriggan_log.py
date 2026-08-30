import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_log = """                    if (s.card.name === 'シルフ') {
                        player.deck.hand.push(s.card);
                        logMsg(`「${s.card.name}」は破壊され、手札に戻った！`);
                    } else {
                        player.deck.void.push(s.card);
                        logMsg(`召喚ユニット「${s.card.name}」を廃棄札へ移動しました！<br><span style="color:#aaa; font-size:0.8rem;">【効果】${s.card.effect}</span>`, 'important');
                    }"""

new_log = """                    if (s.card.name === 'シルフ') {
                        player.deck.hand.push(s.card);
                        logMsg(`「${s.card.name}」は破壊され、手札に戻った！`);
                    } else {
                        player.deck.void.push(s.card);
                        let effectText = s.card.effect;
                        if (s.card.name === 'スプリガン') {
                            effectText = `<span style="color:#ffcc00; font-weight:bold;">※現在の「攻」の数値： ${atk} </span><br>` + effectText;
                        }
                        logMsg(`召喚ユニット「${s.card.name}」を廃棄札へ移動しました！<br><span style="color:#aaa; font-size:0.8rem;">【効果】${effectText}</span>`, 'important');
                    }"""
content = content.replace(old_log, new_log)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
