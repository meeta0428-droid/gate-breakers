import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()


# 1. 発動可能なパッシブ判定
old_passive = """                } else if (card.name === '『ブーステッド』') {
                    els.btnTriggerPassive.innerText = '効果を発動（能力値+2）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '『アポクリファ』') {"""

new_passive = """                } else if (card.name === '『ブーステッド』') {
                    els.btnTriggerPassive.innerText = '効果を発動（能力値+2）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '『キメラドライブ』') {
                    els.btnTriggerPassive.innerText = '効果を発動（合成）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '『アポクリファ』') {"""
content = content.replace(old_passive, new_passive)


# 2. 発動時の処理
old_trigger = """            // 『アポクリファ』
            if (card.name === '『アポクリファ』') {"""

new_trigger = """            // 『キメラドライブ』
            if (card.name === '『キメラドライブ』') {
                if (player.deck.summons.length < 2) {
                    alert('合成するには召喚エリアに2体以上のユニットが必要です。');
                    return;
                }
                const doCombine = confirm('現在配置されている【すべての召喚ユニット】を合成して1体の「合成獣（キメラ）」にしますか？');
                if (doCombine) {
                    let totalCost = 0;
                    let totalAtk = 0;
                    let totalDef = 0;
                    const originalCards = [];
                    
                    player.deck.summons.forEach(s => {
                        totalCost += s.card.cost;
                        originalCards.push(s.card);
                        const match = s.card.effect.match(/攻(\d+)\s*[／/]\s*(?:防)?(\d+)/);
                        if (match) {
                            totalAtk += parseInt(match[1]);
                            totalDef += parseInt(match[2]);
                        }
                    });
                    
                    const chimeraCard = {
                        name: '合成獣（キメラ）',
                        category: 'NPC・召喚',
                        cost: totalCost,
                        strength: 3,
                        effect: `召喚・攻${totalAtk} / 防${totalDef}<br>**【特殊効果】**このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる。<br>【合成素材】${originalCards.map(c=>c.name).join(', ')}`,
                        isChimera: true,
                        originalCards: originalCards
                    };
                    
                    player.deck.summons = []; // エリアをリセット
                    player.deck.summons.push({ card: chimeraCard, stance: 'both', isChimera: true });
                    
                    logMsg(`【『キメラドライブ』の効果発動！】<br><span style="color:#ffcc00; font-weight:bold;">すべての召喚ユニットを合成し、「合成獣（キメラ）」を作り出した！<br>（コスト:${totalCost} / 攻${totalAtk} / 防${totalDef}）</span><br><span style="color:#aaa; font-size:0.8rem;">※このユニットは攻撃と防御の両方を同時に行えます。</span>`, 'important');
                    els.cardDetailModal.classList.add('hidden');
                    updateUI();
                }
                return;
            }
            
            // 『アポクリファ』
            if (card.name === '『アポクリファ』') {"""
content = content.replace(old_trigger, new_trigger)


# 3. 廃棄時／破壊時のキメラ分解処理
old_dismiss = """                sDiv.querySelector('.summon-btn-dismiss').addEventListener('click', () => {
                    if (confirm(`「${s.card.name}」を廃棄札へ移動しますか？`)) {
                        player.deck.summons.splice(idx, 1);
                        player.deck.void.push(s.card);
                        
                        if (s.card.name === '怨樹の角魔') {"""

new_dismiss = """                sDiv.querySelector('.summon-btn-dismiss').addEventListener('click', () => {
                    if (confirm(`「${s.card.name}」を廃棄札へ移動しますか？`)) {
                        player.deck.summons.splice(idx, 1);
                        if (s.card.isChimera) {
                            s.card.originalCards.forEach(c => player.deck.void.push(c));
                            logMsg(`【合成獣の分解】合成素材となったカード（${s.card.originalCards.length}枚）が廃棄札へ移動しました。`, 'important');
                        } else {
                            player.deck.void.push(s.card);
                        }
                        
                        if (s.card.name === '怨樹の角魔') {"""
content = content.replace(old_dismiss, new_dismiss)


old_sacrifice = """                cDiv.querySelector('button').addEventListener('click', () => {
                    let dmgToTake = pendingDamage;
                    let endurance = s.card.cost;
                    
                    if (s.card.name === '古の屍竜') {
                        const isFlesh = confirm("【古の屍竜】の特殊効果について確認します。\\nこの攻撃によるダメージは「肉体カテゴリー」によるものですか？\\n（※「OK」を押すと、自身に対するダメージを3点軽減して判定します）");
                        if (isFlesh) {
                            dmgToTake = Math.max(0, dmgToTake - 3);
                            logMsg(`【古の屍竜の効果】「肉体カテゴリー」のダメージを3点軽減！（${pendingDamage} → ${dmgToTake}）`, 'important');
                        }
                    }
                    
                    if (s.card.name === '彷徨う砂塵霊') {
                        // ダメージを全て無効化し、廃棄札へ移動する
                        player.deck.summons.splice(idx, 1);
                        player.deck.void.push(s.card);
                        pendingDamage = 0;
                        logMsg(`「${s.card.name}」がダメージを身代わりにした！<br><span style="color:#00ffff; font-weight:bold;">【特殊効果】ダメージを0にし、廃棄札へ移動した！</span>`, 'important');
                    } else if (dmgToTake > endurance) {
                        player.deck.summons.splice(idx, 1);
                        
                        // フリップサイド・ヒュドラの超再生チェック
                        if (s.card.name === 'フリップサイド・ヒュドラ') {
                            const doRegen = confirm('【フリップサイド・ヒュドラ】の『超再生』を発動しますか？\\n（※「OK」を押すと、廃棄札ではなく山札の1番上に移動します）');
                            if (doRegen) {
                                player.deck.mountain.unshift(s.card);
                                logMsg(`「${s.card.name}」がダメージを身代わりにして倒れたが、<span style="color:#00ff00; font-weight:bold;">『超再生』により山札の1番上に戻った！</span>`, 'important');
                            } else {
                                player.deck.void.push(s.card);
                                logMsg(`「${s.card.name}」がダメージを身代わりにして倒れた！（廃棄札へ移動）`, 'important');
                            }
                        } else {
                            player.deck.void.push(s.card);
                            logMsg(`「${s.card.name}」がダメージを身代わりにして倒れた！（廃棄札へ移動）`, 'important');
                        }
                        
                        if (s.card.name === '怨樹の角魔') {"""

new_sacrifice = """                cDiv.querySelector('button').addEventListener('click', () => {
                    let dmgToTake = pendingDamage;
                    let endurance = s.card.cost;
                    
                    if (s.card.name === '古の屍竜') {
                        const isFlesh = confirm("【古の屍竜】の特殊効果について確認します。\\nこの攻撃によるダメージは「肉体カテゴリー」によるものですか？\\n（※「OK」を押すと、自身に対するダメージを3点軽減して判定します）");
                        if (isFlesh) {
                            dmgToTake = Math.max(0, dmgToTake - 3);
                            logMsg(`【古の屍竜の効果】「肉体カテゴリー」のダメージを3点軽減！（${pendingDamage} → ${dmgToTake}）`, 'important');
                        }
                    }
                    
                    if (s.card.name === '彷徨う砂塵霊') {
                        // ダメージを全て無効化し、廃棄札へ移動する
                        player.deck.summons.splice(idx, 1);
                        player.deck.void.push(s.card);
                        pendingDamage = 0;
                        logMsg(`「${s.card.name}」がダメージを身代わりにした！<br><span style="color:#00ffff; font-weight:bold;">【特殊効果】ダメージを0にし、廃棄札へ移動した！</span>`, 'important');
                    } else if (dmgToTake > endurance) {
                        player.deck.summons.splice(idx, 1);
                        
                        if (s.card.isChimera) {
                            s.card.originalCards.forEach(c => player.deck.void.push(c));
                            logMsg(`「${s.card.name}」がダメージを身代わりにして倒れた！合成素材（${s.card.originalCards.length}枚）が廃棄札へ移動しました。`, 'important');
                        } else if (s.card.name === 'フリップサイド・ヒュドラ') {
                            const doRegen = confirm('【フリップサイド・ヒュドラ】の『超再生』を発動しますか？\\n（※「OK」を押すと、廃棄札ではなく山札の1番上に移動します）');
                            if (doRegen) {
                                player.deck.mountain.unshift(s.card);
                                logMsg(`「${s.card.name}」がダメージを身代わりにして倒れたが、<span style="color:#00ff00; font-weight:bold;">『超再生』により山札の1番上に戻った！</span>`, 'important');
                            } else {
                                player.deck.void.push(s.card);
                                logMsg(`「${s.card.name}」がダメージを身代わりにして倒れた！（廃棄札へ移動）`, 'important');
                            }
                        } else {
                            player.deck.void.push(s.card);
                            logMsg(`「${s.card.name}」がダメージを身代わりにして倒れた！（廃棄札へ移動）`, 'important');
                        }
                        
                        if (s.card.name === '怨樹の角魔') {"""
content = content.replace(old_sacrifice, new_sacrifice)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
