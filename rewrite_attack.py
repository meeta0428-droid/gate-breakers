import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

start_pattern = "els.btnAttack.addEventListener('click', () => {"

start_idx = content.find(start_pattern)

brace_count = 0
end_idx = -1
in_string = False
string_char = ''
escape = False

for i in range(start_idx, len(content)):
    char = content[i]
    if escape:
        escape = False
        continue
    if char == '\\':
        escape = True
        continue
    if in_string:
        if char == string_char:
            in_string = False
    else:
        if char in ["'", '"', '`']:
            in_string = True
            string_char = char
        elif char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0 and i > start_idx + 45:
                end_idx = i
                break

original_btnAttack = content[start_idx:end_idx+1]

# Now, we manually rewrite it in JS, but using python to insert it
new_code = """
    const doAttackProcess = (isPreview = false) => {
        let hasAttackingSummons = player.deck.summons.some(s => s.stance === 'attack');
        
        // setCards は preview 時にも分離し、final 時にも分離する。
        // final時にはすでに preview 時点で分離されている可能性もあるが安全のため。
        const setCards = currentCombo.filter(c => c.isSetReaction);
        currentCombo = currentCombo.filter(c => !c.isSetReaction);
        
        if (currentCombo.length === 0 && !hasAttackingSummons) {
            logMsg('出すカードがありません。手札からアクションカードを選ぶか、攻撃可能な召喚ユニットを用意してください。');
            currentCombo = [...currentCombo, ...setCards];
            return;
        }

        if (isGeneralMode) {
            let logs = [];
            currentCombo.forEach(c => {
                let statVal = 0;
                let statName = 'なし';
                let passiveBonus = 0;
                
                const getPassiveBonus = (categoryFilter) => {
                    return player.deck.passives.reduce((sum, p) => {
                        if (p.category.includes(categoryFilter) || p.category.includes('全て')) {
                            return sum + (p.strength || 0);
                        }
                        return sum;
                    }, 0);
                };

                if (c.category.includes('肉体')) { 
                    statVal = player.stats.body.maxVal; 
                    statName = '肉体'; 
                    passiveBonus = getPassiveBonus('肉体');
                }
                else if (c.category.includes('知性')) { 
                    statVal = player.stats.int.maxVal; 
                    statName = '知性'; 
                    passiveBonus = getPassiveBonus('知性');
                }
                else if (c.category.includes('精神')) { 
                    statVal = player.stats.men.maxVal; 
                    statName = '精神'; 
                    passiveBonus = getPassiveBonus('精神');
                }
                else if (c.category.includes('全て')) {
                    const bTotal = player.stats.body.maxVal + getPassiveBonus('肉体');
                    const iTotal = player.stats.int.maxVal + getPassiveBonus('知性');
                    const mTotal = player.stats.men.maxVal + getPassiveBonus('精神');
                    const maxTotal = Math.max(bTotal, iTotal, mTotal);
                    
                    if (maxTotal === bTotal) {
                        statVal = player.stats.body.maxVal; statName = '最大(肉体)'; passiveBonus = getPassiveBonus('肉体');
                    } else if (maxTotal === iTotal) {
                        statVal = player.stats.int.maxVal; statName = '最大(知性)'; passiveBonus = getPassiveBonus('知性');
                    } else {
                        statVal = player.stats.men.maxVal; statName = '最大(精神)'; passiveBonus = getPassiveBonus('精神');
                    }
                }
                
                const str = c.strength || 0;
                const total = statVal + str + passiveBonus;
                logs.push(`・「${c.name}」：判定結果 <b style="color:#00ffff; font-size:1.1rem;">${total}</b> （${statName} ${statVal} ＋ 強度 ${str} ＋ パッシブ補正 ${passiveBonus}）`);
                
                if (/このカードは廃棄札[へ]?[と]?移動する/.test(c.effect)) {
                    // Preview時には移動させない
                    if (!isPreview) {
                        const discardIdx = player.deck.discard.lastIndexOf(c);
                        if (discardIdx > -1) {
                            player.deck.discard.splice(discardIdx, 1);
                            player.deck.void.push(c);
                        }
                    }
                    logs.push(`　┗「${c.name}」は効果により廃棄札に移動した。`);
                }
            });
            logMsg(`【一般判定】<br>${logs.join('<br>')}`, 'important');
            currentCombo = [...setCards]; // セットカードは維持
            updateUI();
            return;
        }
        
        // --- プレビュー時用のダミーlogMsg ---
        const originalLogMsg = logMsg;
        let tempLogs = [];
        const dummyLogMsg = (msg, type) => {
            tempLogs.push({msg, type});
        };
        const currentLogMsg = isPreview ? dummyLogMsg : originalLogMsg;
        
        const dmg = calculateDamageFromCards(currentCombo, player);
        const { toVoid } = executeCardEffects(currentCombo, player, currentLogMsg);
        
        let nextCardBonus = 0;
        let continuousBonus = 0;
        const cardLogs = currentCombo.map((c, idx) => {
            let detail = '';
            let currentCardDmg = 0;
            
            const match = c.effect.match(/ダメージ[＋\+](\d+)/);
            if (match) currentCardDmg += parseInt(match[1]);
            
            if (c.name === 'ロックオンアサルト' && player.deck.summons.length > 0) {
                currentCardDmg += 2;
                detail += `（召喚配置ボーナス＋2 🎯任意のカードにダメージ）`;
            }
            
            if (c.name === '獣の戦意' && player.deck.summons.length > 0) {
                let maxStr = 0;
                let targetName = '';
                player.deck.summons.forEach(s => {
                    if (s.card.strength > maxStr) {
                        maxStr = s.card.strength;
                        targetName = s.card.name;
                    }
                });
                if (maxStr > 0) {
                    currentCardDmg += maxStr;
                    detail += `（召喚「${targetName}」の強度ボーナス＋${maxStr}）`;
                }
            }
            
            const voidMatch = c.effect.match(/廃棄札1枚につき.*?ダメージ.*?[＋\+](\d+)/);
            if (voidMatch) {
                const bonus = parseInt(voidMatch[1]) * player.deck.void.length;
                currentCardDmg += bonus;
                detail += `（廃棄札ボーナス＋${bonus}）`;
            }
            
            const emptyHandMatch = c.effect.match(/手札を使い切った時.*?ダメージ[＋\+](\d+)/);
            if (emptyHandMatch && player.deck.hand.length === 0) {
                const bonus = parseInt(emptyHandMatch[1]);
                currentCardDmg += bonus;
                detail += `（手札0ボーナス＋${bonus}）`;
            }
            
            const hasCyomancer = player.deck.passives.some(p => p.name === 'サイオマンサー');
            if (hasCyomancer && c.category.includes('精神') && c.category.includes('アクション')) {
                currentCardDmg += 1;
                detail += `（サイオマンサー＋1）`;
            }
            
            let isDamageCard = currentCardDmg > 0 || c.effect.includes('ダメージ');
            if (nextCardBonus > 0) {
                if (isDamageCard) {
                    detail += `（直前カードのボーナス＋${nextCardBonus}）`;
                    currentCardDmg += nextCardBonus;
                }
                nextCardBonus = 0; // いずれにせよボーナスは消費される
            }
            
            if (continuousBonus > 0 && isDamageCard) {
                detail += `（継続コンボボーナス＋${continuousBonus}）`;
                currentCardDmg += continuousBonus;
            }
            
            if (match) detail = `（基本ダメージ＋${match[1]}）` + detail;
            
            const nextMatch = c.effect.match(/この次のカードのダメージを[＋\+](\d+)/);
            if (nextMatch) {
                nextCardBonus += parseInt(nextMatch[1]);
                detail += `（次カードのダメージ＋${nextMatch[1]}）`;
            }
            
            const continuousMatch = c.effect.match(/コンボしたあらゆるカードのダメージが[＋\+](\d+)/);
            if (continuousMatch) {
                continuousBonus += parseInt(continuousMatch[1]);
                detail += `（これ以降のダメージに＋${continuousMatch[1]}）`;
            }
            
            if (toVoid.has(idx)) detail += ` [廃棄へ]`;
            return `・「${c.name}」${detail}`;
        }).join('<br>');
        
        let summonDmg = 0;
        let summonLog = '';
        const honnouBuff = player.deck.discard.filter(c => c.name === '本能の覚醒').length * 2;
        const jusoBuff = player.deck.passives.filter(c => c.name === '獣操棍').length * 1;
        player.deck.summons.forEach(s => {
            if (s.stance === 'attack' || s.stance === 'both') {
                const match = s.card.effect.match(/攻(\d+)\s*[／/]\s*(?:防)?(\d+)/);
                if (match) {
                    let atk = parseInt(match[1]);
                    if (s.elementalerBuff) atk += 2 * s.elementalerBuff;
                    atk += honnouBuff + jusoBuff;
                    
                    summonDmg += atk;
                    let extraInfo = '';
                    if (s.card.name === 'サラマンダー') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[リアクション不可]</span>';
                    }
                    summonLog += `・召喚「${s.card.name}」の追撃 (＋${atk})${extraInfo}<br>`;
                }
            }
        });
        
        let totalDmg = dmg + summonDmg;
        
        // --- フックシステムの呼び出し ---
        const activeCards = [...player.deck.passives, ...player.deck.summons, ...currentCombo];
        const hookContext = triggerHook('onAttack', { 
            totalDmg: totalDmg, 
            player: player,
            logMsg: currentLogMsg,
            enemyNoReact: els.chkEnemyNoReact.checked,
            enemyOpen: els.chkEnemyOpen ? els.chkEnemyOpen.checked : false,
            currentCombo: currentCombo
        }, activeCards);
        totalDmg = hookContext.totalDmg;
        
        let manualLog = '';
        if (manualDmgBonus !== 0) {
            totalDmg += manualDmgBonus;
            const sign = manualDmgBonus > 0 ? '＋' : '';
            manualLog = `<br><span style="color:#4caf50;">（味方からの効果補正 ${sign}${manualDmgBonus} を適用）</span>`;
        }

        const hasAllTarget = currentCombo.some(c => c.effect.includes('任意の対象全て') || c.effect.includes('任意の対象すべて'));
        const targetLog = hasAllTarget ? '<br><span style="color:#ffcc00; font-weight:bold;">【任意の対象すべてへの攻撃！】</span>' : '';

        const finalMsg = `使用カード:<br>${cardLogs}<br>${summonLog}コンボ発動！ 合計 <span class="damage">${totalDmg}</span> のダメージを与えた！${targetLog}${manualLog}`;

        if (isPreview) {
            // プレビュー時の処理：ログだけ流してモーダルを開く
            originalLogMsg(`【攻撃仮計算】<br>${finalMsg}`, 'important');
            
            // 効果ログなども出力する
            tempLogs.forEach(l => {
                originalLogMsg(`【仮効果】${l.msg}`, l.type);
            });
            
            // モーダルのリスト生成
            els.attackConfirmList.innerHTML = '';
            currentCombo.forEach((c, idx) => {
                const div = document.createElement('div');
                div.style.background = '#333';
                div.style.padding = '8px';
                div.style.marginBottom = '5px';
                div.style.borderRadius = '4px';
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.alignItems = 'center';
                
                const nameSpan = document.createElement('span');
                nameSpan.innerText = c.name;
                
                const select = document.createElement('select');
                select.className = 'confirm-action-select';
                select.dataset.idx = idx;
                select.innerHTML = `
                    <option value="normal">通常処理（効果通り）</option>
                    <option value="hand">手札に戻す（無効化等）</option>
                    <option value="discard">捨札にする</option>
                    <option value="void">廃棄札にする</option>
                `;
                
                div.appendChild(nameSpan);
                div.appendChild(select);
                els.attackConfirmList.appendChild(div);
            });
            
            els.attackConfirmModal.classList.remove('hidden');
            currentCombo = [...currentCombo, ...setCards]; // セットカードを一時的に戻す
            return;
        }

        // --- 確定時 (isPreview === false) の処理 ---
        originalLogMsg(finalMsg, 'important');
        tempLogs.forEach(l => {
            originalLogMsg(l.msg, l.type);
        });
        showDamagePopup(totalDmg);
        enemyHp -= totalDmg;
        
        // 攻撃実行後、チェックボックスをリセット
        els.chkEnemyNoReact.checked = false;
        
        if (manualDmgBonus !== 0) {
            manualDmgBonus = 0;
            if (manualDmgVal) manualDmgVal.innerText = manualDmgBonus;
        }
        
        const finalizeAttackCombo = (savedCardIdx = -1) => {
            currentCombo.forEach((card, idx) => {
                if (idx === savedCardIdx) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.hand.push(card);
                        originalLogMsg(`【残心】の効果で「${card.name}」を手札に戻しました。`, 'important');
                    }
                    return;
                }
                
                if (card._kagejinUsed) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        originalLogMsg(`「${card.name}」はリアクション無効化の代償として廃棄札に移動した。`);
                    }
                    delete card._kagejinUsed;
                    return;
                }

                if (card._fromDiscard) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        originalLogMsg(`「${card.name}」は捨札から使用されたため廃棄札に移動した。`);
                    }
                    delete card._fromDiscard;
                    return;
                }
                
                if (/このカードは廃棄札[へ]?[と]?移動する/.test(card.effect)) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        originalLogMsg(`「${card.name}」は使用されたため廃棄札に移動した。`);
                    }
                    return;
                }
                
                if (card.category.includes('召喚') || card.effect.includes('召喚・攻')) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'attack';
                        player.deck.summons.push({ card: card, stance: initStance });
                    }
                } else if (toVoid.has(idx)) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                    }
                }
            });
            
            const hasChosoku = currentCombo.some(c => c.name === '超速判断' || c.effect.includes('捨札からコスト3以下のカードを1枚引く'));
            if (hasChosoku) {
                window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                    detail: {
                        filterFunc: c => c.cost <= 3 && !currentCombo.includes(c),
                        title: "超速判断の効果",
                        desc: "捨札からコスト3以下のカードを1枚引きます。",
                        onSelect: (card) => {
                            player.deck.hand.push(card);
                            originalLogMsg(`【超速判断】捨札から「${card.name}」を手札に加えました。`);
                        },
                        playerObj: player
                    }
                }));
            }
            
            currentCombo = [...setCards];
            updateUI();
        };

        const zanshinCardIdx = currentCombo.findIndex(c => c.name === '残心');
        if (zanshinCardIdx !== -1) {
            let options = currentCombo.map(c => c.name);
            options.push('戻さない');
            window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                detail: {
                    filterFunc: c => currentCombo.includes(c),
                    title: "残心の効果",
                    desc: "このコンボで使用したカードのうち1枚を手札に戻すことができます。",
                    onSelect: (card) => {
                        const idx = currentCombo.indexOf(card);
                        finalizeAttackCombo(idx);
                    },
                    onSkip: () => {
                        finalizeAttackCombo(-1);
                    },
                    playerObj: player
                }
            }));
        } else {
            finalizeAttackCombo();
        }
    };

    els.btnAttack.addEventListener('click', () => {
        doAttackProcess(true);
    });

    if (els.btnConfirmAttackFinal) {
        els.btnConfirmAttackFinal.addEventListener('click', () => {
            els.attackConfirmModal.classList.add('hidden');
            
            // モーダルでの選択を適用する
            const selects = els.attackConfirmList.querySelectorAll('.confirm-action-select');
            
            // setCards は除外して処理するため分離
            const setCards = currentCombo.filter(c => c.isSetReaction);
            let activeCards = currentCombo.filter(c => !c.isSetReaction);
            
            // 後ろから削除していくとインデックスがずれないが、直接 splice などで処理する
            // 選択されたアクションを適用
            let finalActiveCards = [];
            
            selects.forEach(sel => {
                const idx = parseInt(sel.dataset.idx);
                const action = sel.value;
                const card = activeCards[idx];
                if (!card) return;
                
                if (action === 'normal') {
                    finalActiveCards.push(card);
                } else {
                    // discard から取り出す
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                    }
                    
                    if (action === 'hand') {
                        player.deck.hand.push(card);
                        logMsg(`「${card.name}」は妨害により手札に戻りました。（コストは自動回復しません）`);
                    } else if (action === 'discard') {
                        player.deck.discard.push(card);
                        logMsg(`「${card.name}」は効果により捨札になりました。`);
                    } else if (action === 'void') {
                        player.deck.void.push(card);
                        logMsg(`「${card.name}」は効果により廃棄札になりました。`);
                    }
                }
            });
            
            // 新しい currentCombo で final 処理を実行
            currentCombo = [...finalActiveCards, ...setCards];
            
            // 通常の攻撃処理（確定版）を呼び出す
            doAttackProcess(false);
        });
    }

    if (els.btnCancelAttackConfirm) {
        els.btnCancelAttackConfirm.addEventListener('click', () => {
            els.attackConfirmModal.classList.add('hidden');
            logMsg('攻撃をキャンセルしました。手札やコンボの状態はそのままです。');
            updateUI();
        });
    }
"""

content = content[:start_idx] + new_code + content[end_idx+1:]

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
