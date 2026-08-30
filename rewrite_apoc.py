import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()


old_passive = """            // 発動可能なパッシブ効果の判定
            if (els.btnTriggerPassive) {
                if (card.name === '錬金術師') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '武具錬成') {"""

new_passive = """            // 発動可能なパッシブ効果の判定
            if (els.btnTriggerPassive) {
                if (card.name === '錬金術師') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '『アポクリファ』') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '武具錬成') {"""
content = content.replace(old_passive, new_passive)


old_trigger = """            // 錬金術師
            if (card.name === '錬金術師') {
                if (player.deck.hand.length === 0) {
                    alert('手札がありません。');
                    return;
                }
                window.dispatchEvent(new CustomEvent('requestDiscardForSkill', {
                    detail: {
                        title: "錬金術師の効果",
                        desc: "手札から1枚選んで捨札に送り、山札から1枚引きます。",
                        playerObj: player,
                        source: 'hand',
                        count: 1,
                        onSelect: (discardedCards) => {
                            const c = discardedCards[0];
                            const idx = player.deck.hand.indexOf(c);
                            if (idx > -1) {
                                player.deck.hand.splice(idx, 1);
                                player.deck.discard.push(c);
                                player.deck.draw(1);
                                logMsg(`【錬金術師】の効果で「${c.name}」を捨て、1枚ドローしました。`);
                                updateUI();
                            }
                        }
                    }
                }));
                return;
            }"""

new_trigger = """            // 錬金術師
            if (card.name === '錬金術師') {
                if (player.deck.hand.length === 0) {
                    alert('手札がありません。');
                    return;
                }
                window.dispatchEvent(new CustomEvent('requestDiscardForSkill', {
                    detail: {
                        title: "錬金術師の効果",
                        desc: "手札から1枚選んで捨札に送り、山札から1枚引きます。",
                        playerObj: player,
                        source: 'hand',
                        count: 1,
                        onSelect: (discardedCards) => {
                            const c = discardedCards[0];
                            const idx = player.deck.hand.indexOf(c);
                            if (idx > -1) {
                                player.deck.hand.splice(idx, 1);
                                player.deck.discard.push(c);
                                player.deck.draw(1);
                                logMsg(`【錬金術師】の効果で「${c.name}」を捨て、1枚ドローしました。`);
                                updateUI();
                            }
                        }
                    }
                }));
                return;
            }
            
            // 『アポクリファ』
            if (card.name === '『アポクリファ』') {
                logMsg(`【『アポクリファ』の効果宣言！】<br><span style="color:#ffcc00; font-weight:bold;">※指定する「召喚」カードを手札から使用し、召喚エリアに配置してください。<br>その後は、その召喚ユニットの「攻撃」「防御」「ダメージを受ける」ボタンを利用することで、自動的に数値が適用されます。</span>`, 'important');
                els.cardDetailModal.classList.add('hidden');
                updateUI();
                return;
            }"""
content = content.replace(old_trigger, new_trigger)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
