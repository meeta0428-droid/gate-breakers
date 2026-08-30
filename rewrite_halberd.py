import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. doAttackProcess のシグネチャ変更
content = content.replace("const doAttackProcess = (isPreview = false, gatlingBonus = 0) => {", "const doAttackProcess = (isPreview = false, gatlingBonus = 0, halberdBonus = 0) => {")

# 2. totalDmg += halberdBonus の処理を挿入
old_total_dmg_logic = """        if (gatlingBonus > 0) {
            totalDmg += gatlingBonus;
            manualLog += `<br><span style="color:#ffcc00; font-weight:bold;">（ガトリングガンの追加効果！ 捨札廃棄によりダメージ ＋${gatlingBonus}）</span>`;
        }"""
new_total_dmg_logic = """        if (gatlingBonus > 0) {
            totalDmg += gatlingBonus;
            manualLog += `<br><span style="color:#ffcc00; font-weight:bold;">（ガトリングガンの追加効果！ 捨札廃棄によりダメージ ＋${gatlingBonus}）</span>`;
        }
        if (halberdBonus > 0) {
            totalDmg += halberdBonus;
            manualLog += `<br><span style="color:#ffcc00; font-weight:bold;">（ハルバードの追加効果！ 手札から捨札へ移動によりダメージ ＋${halberdBonus}）</span>`;
        }"""
content = content.replace(old_total_dmg_logic, new_total_dmg_logic)

# 3. プレビューモーダルにハルバードのUIを追加
old_modal_creation = """                gatlingDiv.appendChild(discardListDiv);
                els.attackConfirmList.appendChild(gatlingDiv);
            }
            
            els.attackConfirmModal.classList.remove('hidden');"""
new_modal_creation = """                gatlingDiv.appendChild(discardListDiv);
                els.attackConfirmList.appendChild(gatlingDiv);
            }
            
            // ハルバードの追加UI
            const hasHalberd = player.deck.passives.some(p => p.name === 'ハルバード');
            if (hasHalberd) {
                const halberdDiv = document.createElement('div');
                halberdDiv.style.marginTop = '15px';
                halberdDiv.style.padding = '10px';
                halberdDiv.style.border = '1px solid #ffcc00';
                halberdDiv.style.borderRadius = '5px';
                halberdDiv.innerHTML = `<h3 style="color:#ffcc00; margin-top:0; margin-bottom:10px; font-size:1rem;">【ハルバード】追加効果</h3>
                                        <p style="font-size:0.8rem; margin-bottom:10px;">手札を捨札にして追加ダメージ（1枚につき＋3）</p>`;
                
                const handListDiv = document.createElement('div');
                handListDiv.style.maxHeight = '100px';
                handListDiv.style.overflowY = 'auto';
                handListDiv.style.background = '#222';
                handListDiv.style.padding = '5px';
                
                if (player.deck.hand.length === 0) {
                    handListDiv.innerHTML = '<span style="color:#aaa; font-size:0.8rem;">現在、捨札にできる手札はありません。</span>';
                } else {
                    player.deck.hand.forEach((c) => {
                        const label = document.createElement('label');
                        label.style.display = 'block';
                        label.style.fontSize = '0.9rem';
                        label.style.marginBottom = '3px';
                        
                        const cb = document.createElement('input');
                        cb.type = 'checkbox';
                        cb.className = 'halberd-hand-cb';
                        cb.dataset.idx = player.deck.hand.indexOf(c);
                        
                        label.appendChild(cb);
                        label.appendChild(document.createTextNode(' ' + c.name));
                        handListDiv.appendChild(label);
                    });
                }
                
                halberdDiv.appendChild(handListDiv);
                els.attackConfirmList.appendChild(halberdDiv);
            }
            
            els.attackConfirmModal.classList.remove('hidden');"""
content = content.replace(old_modal_creation, new_modal_creation)

# 4. btnConfirmAttackFinal でのハルバードのチェックボックス処理
old_confirm_logic = """            let gatlingBonus = 0;
            const gatlingChecks = els.attackConfirmList.querySelectorAll('.gatling-discard-cb:checked');"""
new_confirm_logic = """            let gatlingBonus = 0;
            let halberdBonus = 0;
            
            // ハルバードの処理 (インデックスがずれないよう降順処理)
            const halberdChecks = els.attackConfirmList.querySelectorAll('.halberd-hand-cb:checked');
            if (halberdChecks.length > 0) {
                const idxsToRemove = Array.from(halberdChecks).map(cb => parseInt(cb.dataset.idx)).sort((a,b) => b-a);
                idxsToRemove.forEach(idx => {
                    const card = player.deck.hand.splice(idx, 1)[0];
                    player.deck.discard.push(card);
                    logMsg(`【ハルバード】追加効果により手札の「${card.name}」を捨札にした！`);
                });
                halberdBonus = idxsToRemove.length * 3;
            }

            const gatlingChecks = els.attackConfirmList.querySelectorAll('.gatling-discard-cb:checked');"""
content = content.replace(old_confirm_logic, new_confirm_logic)

# doAttackProcess の呼び出しも変更
old_do_attack_call = "doAttackProcess(false, gatlingBonus);"
new_do_attack_call = "doAttackProcess(false, gatlingBonus, halberdBonus);"
content = content.replace(old_do_attack_call, new_do_attack_call)


with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
