import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. triggerPassiveEffect 関数の追加（openCardModal の手前に定義）
old_func_def = "function openCardModal(card, index, isPassive = false, isCombo = false, isPsychometry = false) {"

new_func_def = """window.triggerPassiveEffect = function(passiveCard, originalIdx) {
    if (!passiveCard) return;
    document.getElementById('card-modal').classList.add('hidden'); // 詳細モーダルを閉じる

    if (passiveCard.name === '武具錬成') {
        logMsg(`【武具錬成】効果を対象に共有しました！<br><span style="color:#ffcc00; font-size:0.9rem;">（対象の攻撃ダメージ＋1、または受けるダメージ1点軽減）</span>`, 'important');
        return;
    }

    if (passiveCard.name === '『不死者』') {
        if (player._undeadUsed) {
            alert('この効果は1ラウンドに1回しか使用できません。');
            return;
        }
        const voidCards = player.deck.void.filter(c => c.cost <= 3);
        if (voidCards.length === 0) {
            alert('廃棄札にコスト3以下のカードがありません。');
            return;
        }
        window.dispatchEvent(new CustomEvent('requestRecoverCard', {
            detail: {
                title: "『不死者』：無償回収",
                desc: "手札に戻すカードを1枚選んでください。",
                playerObj: player,
                source: 'void',
                filterFunc: (c) => c.cost <= 3,
                onSelect: (selectedCard) => {
                    player.deck.hand.push(selectedCard);
                    player._undeadUsed = true;
                    logMsg(`【『不死者』】効果発動！廃棄札から「${selectedCard.name}」を手札に加えました！`, 'important');
                    updateUI();
                }
            }
        }));
        return;
    }

    if (passiveCard.name === 'ファミリア' || passiveCard.name === 'バディビースト' || passiveCard.name === '相棒の獣' || passiveCard.name === '相棒の鳥' || passiveCard.name === '相棒の竜') {
        if (player.deck.summons.length >= 3) {
            alert('召喚エリアがいっぱいです（最大3体まで）。');
            return;
        }
        const passiveIdx = player.deck.passives.indexOf(passiveCard);
        if (passiveIdx > -1) {
            player.deck.passives.splice(passiveIdx, 1);
            player.deck.summons.push({ card: passiveCard, stance: 'attack' });
            logMsg(`パッシブエリアから「${passiveCard.name}」を召喚しました！`, 'important');
            updateUI();
        }
        return;
    }

    if (passiveCard.name === '金の加護') {
        const passiveIdx = player.deck.passives.indexOf(passiveCard);
        if (passiveIdx > -1) {
            player.deck.passives.splice(passiveIdx, 1);
            player.deck.discard.push(passiveCard);
            const recovered = Math.min(player.deck.mountain.length, 3);
            for (let i = 0; i < recovered; i++) {
                const c = player.deck.mountain.shift();
                player.deck.hand.push(c);
            }
            logMsg(`【金の加護】効果発動！自身を捨札に送り、山札から ${recovered} 枚引きました。`, 'important');
            updateUI();
        }
        return;
    }

    if (passiveCard.name === 'エレメンタラー') {
        if (player.deck.summons.length === 0) {
            alert('対象となる召喚ユニットがいません。');
            return;
        }
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10000; display:flex; flex-direction:column; align-items:center; justify-content:center;';
        
        const title = document.createElement('h3');
        title.style.color = '#fff';
        title.innerText = '強化するユニットを選択';
        overlay.appendChild(title);
        
        player.deck.summons.forEach(s => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.style.cssText = 'margin:10px; width:80%; padding:10px; font-size:1.1rem; text-align:center;';
            btn.innerText = s.card.name;
            btn.addEventListener('click', () => {
                s.elementalerBuff = (s.elementalerBuff || 0) + 1;
                logMsg(`【エレメンタラー】効果発動！「${s.card.name}」の攻・防がこのラウンド中 ＋2 された！`, 'important');
                document.body.removeChild(overlay);
                updateUI();
            });
            overlay.appendChild(btn);
        });
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.style.cssText = 'margin-top:20px; padding:10px 20px;';
        cancelBtn.innerText = 'キャンセル';
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        overlay.appendChild(cancelBtn);
        
        document.body.appendChild(overlay);
        return;
    }

    if (passiveCard.name === 'ノーム') {
        const summonIdx = player.deck.summons.findIndex(s => s.card.name === 'ノーム');
        if (summonIdx > -1) {
            const nohmCard = player.deck.summons[summonIdx].card;
            player.deck.summons.splice(summonIdx, 1);
            player.deck.void.push(nohmCard);
            logMsg(`【ノーム】ユニットを廃棄札に送って効果発動！<br><span style="color:#00ffff; font-weight:bold;">※任意の全ての対象のイニシアチブを＋5してください！</span>`, 'important');
            updateUI();
        }
        return;
    }

    if (passiveCard.name === 'シルフ') {
        const summonIdx = player.deck.summons.findIndex(s => s.card.name === 'シルフ');
        if (summonIdx > -1) {
            const sylphCard = player.deck.summons[summonIdx].card;
            player.deck.summons.splice(summonIdx, 1);
            player.deck.void.push(sylphCard);
            logMsg(`【シルフ】ユニットを廃棄札に送って効果発動！<br><span style="color:#00ffff; font-weight:bold;">※任意の全ての対象のイニシアチブを＋5してください！</span>`, 'important');
            updateUI();
        }
        return;
    }

    if (passiveCard.name === 'サラマンダー') {
        const summonIdx = player.deck.summons.findIndex(s => s.card.name === 'サラマンダー');
        if (summonIdx > -1) {
            const salamanderCard = player.deck.summons[summonIdx].card;
            player.deck.summons.splice(summonIdx, 1);
            player.deck.void.push(salamanderCard);
            logMsg(`【サラマンダー】ユニットを廃棄札に送って効果発動！<br><span style="color:#ff5252; font-weight:bold;">※ダメージ＋9！この攻撃にはリアクションできない！</span>`, 'important');
            updateUI();
        }
        return;
    }

    if (passiveCard.name === 'ウンディーネ') {
        const summonIdx = player.deck.summons.findIndex(s => s.card.name === 'ウンディーネ');
        if (summonIdx > -1) {
            const undineCard = player.deck.summons[summonIdx].card;
            player.deck.summons.splice(summonIdx, 1);
            player.deck.void.push(undineCard);
            logMsg(`【ウンディーネ】ユニットを廃棄札に送って効果発動！`, 'important');
            window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                detail: {
                    title: "ウンディーネ：無償回収",
                    desc: "手札に戻すカードを1枚選んでください。",
                    playerObj: player,
                    source: 'void_or_discard',
                    filterFunc: (c) => true,
                    onSelect: (selectedCard) => {
                        player.deck.hand.push(selectedCard);
                        logMsg(`【ウンディーネ】効果で「${selectedCard.name}」を手札に加えました！`, 'important');
                        updateUI();
                    }
                }
            }));
        }
        return;
    }

    if (passiveCard.name === 'ハンドヘルドコンピュータ') {
        if (player.deck.mountain.length < 2) {
            alert('山札が2枚未満のため効果を発動できません。');
            return;
        }
        const c1 = player.deck.mountain.shift();
        const c2 = player.deck.mountain.shift();
        
        document.getElementById('handheld-card1-name').innerText = c1.name;
        document.getElementById('handheld-card2-name').innerText = c2.name;
        document.getElementById('handheld-card1-desc').innerText = c1.effect;
        document.getElementById('handheld-card2-desc').innerText = c2.effect;
        
        document.getElementById('btn-handheld-done').onclick = () => {
            const pos1 = document.getElementById('handheld-card1-pos').value;
            const pos2 = document.getElementById('handheld-card2-pos').value;
            
            const toBottom = [];
            const toTop = [];
            
            if (pos1 === 'top') toTop.push(c1); else toBottom.push(c1);
            if (pos2 === 'top') toTop.push(c2); else toBottom.push(c2);
            
            toBottom.forEach(c => player.deck.mountain.push(c));
            if (toTop.length > 0) {
                player.deck.mountain.unshift(...toTop);
            }
            
            document.getElementById('handheld-modal').classList.add('hidden');
            logMsg('【ハンドヘルドコンピュータ】山札の上から2枚を確認し、戻しました。', 'important');
            updateUI();
        };
        
        document.getElementById('handheld-modal').classList.remove('hidden');
        return;
    }

    if (passiveCard.name === '錬成の法') {
        if (player.deck.hand.length === 0) {
            alert('捨てる手札がありません。');
            return;
        }
        if (player.deck.void.length === 0) {
            alert('廃棄札がありません。');
            return;
        }

        window.dispatchEvent(new CustomEvent('requestRecoverCard', {
            detail: {
                title: "錬成の法：捨てる手札を選択",
                desc: "捨札にする手札を1枚選んでください。",
                playerObj: player,
                source: 'hand',
                filterFunc: (c) => true,
                onSelect: (discardedCard) => {
                    player.deck.discard.push(discardedCard);
                    
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                            detail: {
                                title: "錬成の法：回収する廃棄札を選択",
                                desc: `コスト ${discardedCard.cost} 以下のカードを選んでください。`,
                                playerObj: player,
                                source: 'void',
                                filterFunc: (c) => c.cost <= discardedCard.cost,
                                onSelect: (recoveredCard) => {
                                    player.deck.hand.push(recoveredCard);
                                    const passiveIdx = player.deck.passives.indexOf(passiveCard);
                                    if (passiveIdx > -1) {
                                        player.deck.passives.splice(passiveIdx, 1);
                                        player.deck.discard.push(passiveCard);
                                    }
                                    logMsg(`【錬成の法】効果発動！手札の「${discardedCard.name}」を捨て、廃棄札から「${recoveredCard.name}」を手札に加えました！<br><small>※錬成の法は使用されたため捨札に移動しました。</small>`, 'important');
                                    updateUI();
                                }
                            }
                        }));
                    }, 100);
                }
            }
        }));
        return;
    }

    if (passiveCard.name === '錬金術師') {
        if (player._alchemistUsed) {
            alert('錬金術師の効果は1ラウンドに1回までです。');
            return;
        }
        if (player.deck.hand.length === 0) {
            alert('捨てる手札がありません。');
            return;
        }
        if (player.deck.discard.length === 0) {
            alert('捨札がありません。');
            return;
        }

        window.dispatchEvent(new CustomEvent('requestRecoverCard', {
            detail: {
                title: "錬金術師：捨てる手札を選択",
                desc: "捨てる手札を1枚選んでください。",
                playerObj: player,
                source: 'hand',
                filterFunc: (c) => true,
                onSelect: (discardedCard) => {
                    player.deck.discard.push(discardedCard);
                    
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                            detail: {
                                title: "錬金術師：回収する捨札を選択",
                                desc: `コスト ${discardedCard.cost} 以下のカードを選んでください。`,
                                playerObj: player,
                                source: 'discard',
                                filterFunc: (c) => c.cost <= discardedCard.cost,
                                onSelect: (recoveredCard) => {
                                    player.deck.hand.push(recoveredCard);
                                    player._alchemistUsed = true;
                                    logMsg(`【錬金術師】効果発動！手札の「${discardedCard.name}」を捨て、捨札から「${recoveredCard.name}」を回収しました！`, 'important');
                                    updateUI();
                                }
                            }
                        }));
                    }, 100);
                }
            }
        }));
        return;
    }

    if (passiveCard.name === '共同戦線') {
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
            
            player.deck.summons.forEach(s => {
                totalCost += s.card.cost;
                const atkMatch = s.card.effect.match(/攻([0-9０-９]+)/);
                const defMatch = s.card.effect.match(/防([0-9０-９]+)/);
                if (atkMatch) totalAtk += parseInt(atkMatch[1], 10);
                if (defMatch) totalDef += parseInt(defMatch[1], 10);
                originalCards.push(s.card);
            });
            
            player.deck.summons = [];
            
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
                    let initStance = 'attack';
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
    }
}
function openCardModal(card, index, isPassive = false, isCombo = false, isPsychometry = false) {"""

content = content.replace(old_func_def, new_func_def)

# 2. openCardModal の中で btnTriggerPassive の onclick を書き換える
old_btn_set = """                if (card.name === '錬金術師') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');"""

new_btn_set = """                els.btnTriggerPassive.onclick = () => { triggerPassiveEffect(card, index); };
                if (card.name === '錬金術師') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');"""

content = content.replace(old_btn_set, new_btn_set)

# 3. 既存の btnTriggerPassive.addEventListener の除去（重複を防ぐため）
# これはちょっと厄介なので、els.btnTriggerPassive = document.getElementById(...) の部分でクローンして置き換えておく
old_clone = "btnTriggerPassive: document.getElementById('btn-trigger-passive'),"
new_clone = "btnTriggerPassive: (function(){ const b = document.getElementById('btn-trigger-passive'); const clone = b.cloneNode(true); b.parentNode.replaceChild(clone, b); return clone; })(),"

content = content.replace(old_clone, new_clone)


with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
