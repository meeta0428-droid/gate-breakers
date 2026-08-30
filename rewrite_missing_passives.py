import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 共同戦線の後に追加する
old_block = """                if (passiveCard.name === '共同戦線') {
                    if (player.deck.hasUsedKyoudousensen) {
                        alert('【共同戦線】の効果は1ラウンドに1回しか使用できません。（手札補充でラウンドが更新されます）');
                        return;
                    }
                    logMsg(`【共同戦線】効果発動！<br><span style="color:#ffcc00; font-weight:bold;">※味方の捨札にあるコスト4以下のカード1枚を指定し、自身がコストを支払う（能力値を消費する）ことで即座に使用してください！<br>（手動で能力値を消費し、使用処理を行ってください）</span>`, 'important');
                    player.deck.hasUsedKyoudousensen = true;
                    updateUI();
                    return;
                }"""


new_block = """                if (passiveCard.name === '共同戦線') {
                    if (player.deck.hasUsedKyoudousensen) {
                        alert('【共同戦線】の効果は1ラウンドに1回しか使用できません。（手札補充でラウンドが更新されます）');
                        return;
                    }
                    logMsg(`【共同戦線】効果発動！<br><span style="color:#ffcc00; font-weight:bold;">※味方の捨札にあるコスト4以下のカード1枚を指定し、自身がコストを支払う（能力値を消費する）ことで即座に使用してください！<br>（手動で能力値を消費し、使用処理を行ってください）</span>`, 'important');
                    player.deck.hasUsedKyoudousensen = true;
                    updateUI();
                    return;
                }

                if (passiveCard.name === '『ブーステッド』') {
                    const statList = ['肉体', '知性', '精神'];
                    const chosen = prompt("上昇させる能力値を選択してください（肉体、知性、精神のいずれかを入力）：", "肉体");
                    if (chosen && statList.includes(chosen)) {
                        if (chosen === '肉体') { player.stats.body.maxVal += 2; player.stats.body.currentVal += 2; }
                        if (chosen === '知性') { player.stats.int.maxVal += 2; player.stats.int.currentVal += 2; }
                        if (chosen === '精神') { player.stats.men.maxVal += 2; player.stats.men.currentVal += 2; }
                        
                        logMsg(`【『ブーステッド』効果発動】<br><span style="color:#ffcc00; font-weight:bold;">任意の能力値「${chosen}」の最大値・現在値が ＋2 された！</span>`, 'important');
                        updateUI();
                    } else if (chosen) {
                        alert('無効な入力です。肉体、知性、精神のいずれかを入力してください。');
                    }
                    return;
                }

                if (passiveCard.name === '『キメラドライブ』') {
                    if (player.deck.summons.length < 2) {
                        alert('合成するには、召喚エリアに2体以上のユニットが必要です。');
                        return;
                    }
                    
                    const synthesisConfirm = confirm(`【『キメラドライブ』】\n現在配置されている全ての召喚ユニットを合成しますか？\n（合成されたユニットは1体として扱われ、コスト・攻撃・防御が合算されます。また1ラウンドの間に攻撃と防御を1回ずつ行えます）`);
                    
                    if (synthesisConfirm) {
                        let totalCost = 0;
                        let totalAtk = 0;
                        let totalDef = 0;
                        const originalCards = [];
                        
                        // 合算処理
                        player.deck.summons.forEach(s => {
                            totalCost += s.card.cost;
                            const atkMatch = s.card.effect.match(/攻([0-9０-９]+)/);
                            const defMatch = s.card.effect.match(/防([0-9０-９]+)/);
                            if (atkMatch) totalAtk += parseInt(atkMatch[1], 10);
                            if (defMatch) totalDef += parseInt(defMatch[1], 10);
                            originalCards.push(s.card);
                        });
                        
                        // 全召喚ユニットを消去
                        player.deck.summons = [];
                        
                        // 合成獣オブジェクトの生成
                        const chimeraCard = {
                            name: '【合成獣（キメラ）】',
                            category: '召喚',
                            cost: totalCost,
                            strength: 0,
                            effect: `召喚・攻${totalAtk}／防${totalDef}<br>※『キメラドライブ』によって合成されたユニット。1ターンの間に攻撃と防御を1回ずつ行うことができる。<br>※このユニットが破壊された、または廃棄された場合、合成素材となった元のカードはすべて廃棄札へ移動する。`,
                            isChimera: true,
                            originalCards: originalCards
                        };
                        
                        player.deck.summons.push({ card: chimeraCard, stance: 'both' });
                        logMsg(`【『キメラドライブ』効果発動】<br><span style="color:#ffcc00; font-weight:bold;">配置されていた全ての召喚ユニットが合成され、1体の『合成獣（キメラ）』となった！（耐久コスト:${totalCost} / 攻:${totalAtk} / 防:${totalDef}）</span>`, 'important');
                        updateUI();
                    }
                    return;
                }

                if (passiveCard.name === '『アポクリファ』') {
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: "『アポクリファ』：ユニットを召喚",
                            desc: "山札（全カードリスト）から「召喚」カードを1枚指定して、召喚エリアに配置します。",
                            playerObj: player,
                            source: 'all',
                            filterFunc: (c) => c.category.includes('召喚'),
                            onSelect: (selectedCard) => {
                                // 召喚時のスタンス判定
                                let initStance = 'attack'; // デフォルトは攻撃
                                if (selectedCard.effect.includes('召喚・防')) {
                                    initStance = 'defend';
                                } else if (selectedCard.effect.includes('召喚・攻')) {
                                    initStance = 'attack';
                                }
                                if (selectedCard.effect.includes('1ターンの間に攻撃と防御を1回ずつ行うことができる')) {
                                    initStance = 'both';
                                }
                                
                                player.deck.summons.push({ card: selectedCard, stance: initStance });
                                logMsg(`【『アポクリファ』効果発動】<br><span style="color:#00ffff; font-weight:bold;">データベースから「${selectedCard.name}」を指定して召喚した！</span>`, 'important');
                                updateUI();
                            }
                        }
                    }));
                    return;
                }"""
content = content.replace(old_block, new_block)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement check:", content != open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r').read())
