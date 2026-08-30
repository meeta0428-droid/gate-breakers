import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                if (s.card.name === 'シャドウストーカー') {
                    logMsg(`【シャドウストーカーの攻撃】相手の手札を全て公開させ、その中から1枚を指定して捨札に移動させる！<br><span style="color:#aaa; font-size:0.8rem;">（※対象以外が代わりに受けることはできない）</span>`, 'damage');
                    player.deck.summons.splice(idx, 1);
                    player.deck.void.push(s.card);
                    logMsg(`「シャドウストーカー」は攻撃使用後、自身の効果によって廃棄札に移動した。`, 'important');
                    updateUI();
                    return;
                }
                
                updateUI();"""

new_logic = """                if (s.card.name === 'シャドウストーカー') {
                    logMsg(`【シャドウストーカーの攻撃】相手の手札を全て公開させ、その中から1枚を指定して捨札に移動させる！<br><span style="color:#aaa; font-size:0.8rem;">（※対象以外が代わりに受けることはできない）</span>`, 'damage');
                    player.deck.summons.splice(idx, 1);
                    player.deck.void.push(s.card);
                    logMsg(`「シャドウストーカー」は攻撃使用後、自身の効果によって廃棄札に移動した。`, 'important');
                    updateUI();
                    return;
                }
                
                if (s.card.name === 'ブラッドピット・バット') {
                    logMsg(`【ブラッドピット・バットの攻撃】攻撃でダメージを与えた時、対象の任意の手札を捨札へ送る。その後、自身の山札から1枚ドローする。`, 'damage');
                }
                
                updateUI();"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
