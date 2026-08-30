import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. doAttackProcess のシグネチャ変更
content = content.replace("const doAttackProcess = (isPreview = false) => {", "const doAttackProcess = (isPreview = false, gatlingBonus = 0) => {")

# 2. totalDmg += manualDmgBonus の手前に gatlingBonus を加算する処理を挿入
old_total_dmg_logic = """        let manualLog = '';
        if (manualDmgBonus !== 0) {"""
new_total_dmg_logic = """        let manualLog = '';
        if (gatlingBonus > 0) {
            totalDmg += gatlingBonus;
            manualLog += `<br><span style="color:#ffcc00; font-weight:bold;">（ガトリングガンの追加効果！ 捨札廃棄によりダメージ ＋${gatlingBonus}）</span>`;
        }
        if (manualDmgBonus !== 0) {"""
content = content.replace(old_total_dmg_logic, new_total_dmg_logic)

# 3. プレビューモーダルのリスト生成の最後尾にガトリングガンのUIを追加
old_modal_creation = """                div.appendChild(select);
                els.attackConfirmList.appendChild(div);
            });
            
            els.attackConfirmModal.classList.remove('hidden');"""
new_modal_creation = """                div.appendChild(select);
                els.attackConfirmList.appendChild(div);
            });
            
            // ガトリングガンの追加UI
            const hasGatling = player.deck.passives.some(p => p.name === 'ガトリングガン');
            if (hasGatling) {
                const gatlingDiv = document.createElement('div');
                gatlingDiv.style.marginTop = '15px';
                gatlingDiv.style.padding = '10px';
                gatlingDiv.style.border = '1px solid #ffcc00';
                gatlingDiv.style.borderRadius = '5px';
                gatlingDiv.innerHTML = `<h3 style="color:#ffcc00; margin-top:0; margin-bottom:10px; font-size:1rem;">【ガトリングガン】追加効果</h3>
                                        <p style="font-size:0.8rem; margin-bottom:10px;">捨札を廃棄して追加ダメージ（1枚につき＋3）</p>`;
                
                const discardListDiv = document.createElement('div');
                discardListDiv.style.maxHeight = '100px';
                discardListDiv.style.overflowY = 'auto';
                discardListDiv.style.background = '#222';
                discardListDiv.style.padding = '5px';
                
                const pureDiscard = player.deck.discard.filter(c => !currentCombo.includes(c));
                
                if (pureDiscard.length === 0) {
                    discardListDiv.innerHTML = '<span style="color:#aaa; font-size:0.8rem;">現在、廃棄できる捨札はありません。</span>';
                } else {
                    pureDiscard.forEach((c) => {
                        const label = document.createElement('label');
                        label.style.display = 'block';
                        label.style.fontSize = '0.9rem';
                        label.style.marginBottom = '3px';
                        
                        const cb = document.createElement('input');
                        cb.type = 'checkbox';
                        cb.className = 'gatling-discard-cb';
                        cb.dataset.idx = player.deck.discard.indexOf(c);
                        
                        label.appendChild(cb);
                        label.appendChild(document.createTextNode(' ' + c.name));
                        discardListDiv.appendChild(label);
                    });
                }
                
                gatlingDiv.appendChild(discardListDiv);
                els.attackConfirmList.appendChild(gatlingDiv);
            }
            
            els.attackConfirmModal.classList.remove('hidden');"""
content = content.replace(old_modal_creation, new_modal_creation)

# 4. btnConfirmAttackFinal でのガトリングガンのチェックボックス処理
old_confirm_logic = """            // 新しい currentCombo で final 処理を実行
            currentCombo = [...finalActiveCards, ...setCards];
            
            // 通常の攻撃処理（確定版）を呼び出す
            doAttackProcess(false);"""
new_confirm_logic = """            let gatlingBonus = 0;
            const gatlingChecks = els.attackConfirmList.querySelectorAll('.gatling-discard-cb:checked');
            if (gatlingChecks.length > 0) {
                const idxsToRemove = Array.from(gatlingChecks).map(cb => parseInt(cb.dataset.idx)).sort((a,b) => b-a);
                idxsToRemove.forEach(idx => {
                    const card = player.deck.discard.splice(idx, 1)[0];
                    player.deck.void.push(card);
                    logMsg(`【ガトリングガン】追加効果により「${card.name}」を捨札から廃棄札に移動した！`);
                });
                gatlingBonus = idxsToRemove.length * 3;
            }

            // 新しい currentCombo で final 処理を実行
            currentCombo = [...finalActiveCards, ...setCards];
            
            // 通常の攻撃処理（確定版）を呼び出す
            doAttackProcess(false, gatlingBonus);"""
content = content.replace(old_confirm_logic, new_confirm_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
