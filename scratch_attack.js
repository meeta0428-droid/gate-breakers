            manualDmgVal.innerText = manualDmgBonus;
        });
    }
    
    // 攻撃実行
    els.btnAttack.addEventListener('click', () => {
        let hasAttackingSummons = player.deck.summons.some(s => s.stance === 'attack');
        
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
                    const discardIdx = player.deck.discard.lastIndexOf(c);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(c);
                        logs.push(`　┗「${c.name}」は効果により廃棄札に移動した。`);
                    }
                }
            });
            logMsg(`【一般判定】<br>${logs.join('<br>')}`, 'important');
            currentCombo = [...setCards]; // セットカードは維持
            updateUI();
            return;
        }
        
        const dmg = calculateDamageFromCards(currentCombo, player);
        const { toVoid } = executeCardEffects(currentCombo, player, logMsg);
        
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
        // 召喚カードの追撃
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
        
        // --- フックシステムの呼び出し（攻撃ダメージ計算後、適用前） ---
        const activeCards = [...player.deck.passives, ...player.deck.summons, ...currentCombo];
        const hookContext = triggerHook('onAttack', { 
            totalDmg: totalDmg, 
            player: player,
            logMsg: logMsg,
            enemyNoReact: els.chkEnemyNoReact.checked,
            enemyOpen: els.chkEnemyOpen ? els.chkEnemyOpen.checked : false,
            currentCombo: currentCombo
        }, activeCards);
        totalDmg = hookContext.totalDmg;
        // ----------------------------------------------------
        
        let manualLog = '';
        if (manualDmgBonus !== 0) {
            totalDmg += manualDmgBonus;
            const sign = manualDmgBonus > 0 ? '＋' : '';
            manualLog = `<br><span style="color:#4caf50;">（味方からの効果補正 ${sign}${manualDmgBonus} を適用）</span>`;
        }

        // 攻撃実行後、チェックボックスをリセット
        els.chkEnemyNoReact.checked = false;

        const hasAllTarget = currentCombo.some(c => c.effect.includes('任意の対象全て') || c.effect.includes('任意の対象すべて'));
        const targetLog = hasAllTarget ? '<br><span style="color:#ffcc00; font-weight:bold;">【任意の対象すべてへの攻撃！】</span>' : '';

        logMsg(`使用カード:<br>${cardLogs}<br>${summonLog}コンボ発動！ 合計 <span class="damage">${totalDmg}</span> のダメージを与えた！${targetLog}${manualLog}`, 'important');
        showDamagePopup(totalDmg);
        enemyHp -= totalDmg;
        
        // 手動ダメージ補正をリセット
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
                        logMsg(`【残心】の効果で「${card.name}」を手札に戻しました。`, 'important');
                    }
                    return;
                }
                
                // 影刃：リアクション無効化を使用した場合、廃棄札へ
                if (card._kagejinUsed) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        logMsg(`「${card.name}」はリアクション無効化の代償として廃棄札に移動した。`);
                    }
                    delete card._kagejinUsed;
                    return;
                }

                // 影打ち等：捨札から使用した場合、廃棄札へ
                if (card._fromDiscard) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        logMsg(`「${card.name}」は捨札から使用されたため廃棄札に移動した。`);
                    }
                    delete card._fromDiscard;
                    return;
                }
                
                // 使用後廃棄のテキストを持つカード
                if (/このカードは廃棄札[へ]?[と]?移動する/.test(card.effect)) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        logMsg(`「${card.name}」は使用されたため廃棄札に移動した。`);
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
            
            // 超速判断の処理
            const hasChosoku = currentCombo.some(c => c.name === '超速判断' || c.effect.includes('捨札からコスト3以下のカードを1枚引く'));
            if (hasChosoku) {
                window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                    detail: {
                        filterFunc: c => c.cost <= 3 && !currentCombo.includes(c),
                        title: "超速判断の効果",
                        desc: "捨札からコスト3以下のカードを1枚引きます。",
                        onSelect: (card) => {
                            player.deck.hand.push(card);
                            logMsg(`【超速判断】捨札から「${card.name}」を手札に加えました。`);
                        },
                        playerObj: player
                    }
                }));
            }
            
            const hasHonnou = currentCombo.some(c => c.name === '本能の覚醒');
            if (hasHonnou) {
                logMsg(`【本能の覚醒】の効果が発動！このカードが捨札にある限り、召喚ユニットの攻/防が＋2されます。`, 'important');
            }
            
            // 大地の息吹の処理
            const hasDaichi = currentCombo.some(c => c.name === '大地の息吹');
            const daichiTargetCards = [...player.deck.void, ...player.deck.discard];
            if (hasDaichi && daichiTargetCards.some(c => c.category.includes('召喚') || c.effect.includes('召喚・攻'))) {
                window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                    detail: {
                        filterFunc: c => c.category.includes('召喚') || c.effect.includes('召喚・攻'),
                        title: "大地の息吹の効果",
                        desc: "捨札または廃棄札から「召喚」カードを1枚選んで手札に加えます。",
                        source: 'void_or_discard',
                        onSelect: (card) => {
                            player.deck.hand.push(card);
                            logMsg(`【大地の息吹】「${card.name}」を手札に加えました。`);
                        },
                        playerObj: player
                    }
                }));
            }

            // ウンディーネ召喚時効果
            const hasUndine = currentCombo.some(c => c.name === 'ウンディーネ');
            if (hasUndine && player.deck.void.some(c => c.cost <= 2)) {
                window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                    detail: {
                        filterFunc: c => c.cost <= 2,
                        title: "ウンディーネ：召喚時効果",
                        desc: "山札に戻すコスト2以下の廃棄札を選んでください。",
                        source: 'void',
                        onSelect: (card) => {
                            player.deck.mountain.push(card);
                            logMsg(`【ウンディーネ】対象の廃棄札「${card.name}」を山札に戻した！`);
                        },
                        playerObj: player
                    }
                }));
            }
            
            // ドロー効果の汎用処理（バックドア・アクセスなど）
            let totalDraw = 0;
            currentCombo.forEach(c => {
                const drawMatch = c.effect.match(/山札から(?:カードを)?(\d+)枚引いて手札に加える/);
                if (drawMatch) {
                    totalDraw += parseInt(drawMatch[1], 10);
                }
            });
            if (totalDraw > 0) {
                const drawnCount = player.deck.draw(totalDraw);
                logMsg(`カードの効果で山札から ${drawnCount} 枚ドローしました！`);
            }

            currentCombo = setCards;
            updateUI();
        };

        // --- 影刃のリアクション無効化チェック ---
        const kagejinCards = currentCombo.filter(c => c.name === '影刃' || c.effect.includes('リアクションを無効化できる'));
        
        const proceedAfterKagejin = () => {
            // --- 残心チェック ---
            const hasZanshin = player.deck.passives.some(p => p.name === '残心' || p.effect.includes('使用したカード1枚は手札に戻る'));
            const actionCardIndexes = currentCombo.map((c, i) => c.category.includes('アクション') ? i : -1).filter(i => i !== -1);
            
            if (hasZanshin && actionCardIndexes.length > 0) {
                window.dispatchEvent(new CustomEvent('requestZanshinReturn', {
                    detail: {
                        actionCardIndexes,
                        combo: currentCombo,
                        callback: finalizeAttackCombo
                    }
                }));
            } else {
                finalizeAttackCombo();
            }
        };

        if (kagejinCards.length > 0) {
            const kagejinModal = document.getElementById('kagejin-modal');
            kagejinModal.classList.remove('hidden');
            
            const btnYes = document.getElementById('btn-kagejin-yes');
            const btnNo = document.getElementById('btn-kagejin-no');
            
            // イベントリスナーの重複防止
            const newBtnYes = btnYes.cloneNode(true);
            const newBtnNo = btnNo.cloneNode(true);
            btnYes.parentNode.replaceChild(newBtnYes, btnYes);
            btnNo.parentNode.replaceChild(newBtnNo, btnNo);
            
            newBtnYes.addEventListener('click', () => {
                kagejinCards.forEach(c => { c._kagejinUsed = true; });
                logMsg(`【影刃】の効果発動！敵のリアクションを無効化した！`, 'important');
                kagejinModal.classList.add('hidden');
                proceedAfterKagejin();
            });
            
            newBtnNo.addEventListener('click', () => {
                kagejinModal.classList.add('hidden');
                proceedAfterKagejin();
            });
        } else {
            proceedAfterKagejin();
        }
    });

    // 防御/被弾（リアクション）
    let pendingDamage = 0;
    let isGuardStanceActive = false; // ガードスタンスの状態を保持
    
    // --- リアクションモーダル用変数 ---
    let pendingInputDmg = 0;
    const reactionModal = document.getElementById('reaction-modal');
    const reactionList = document.getElementById('reaction-list');
    const reactionComboCount = document.getElementById('reaction-combo-count');
    const btnReactionDone = document.getElementById('btn-reaction-done');

    function updateReactionModalUI() {
        const dmgLabel = document.getElementById('reaction-pending-dmg');
        if (dmgLabel) dmgLabel.innerText = pendingInputDmg;

        reactionList.innerHTML = '';
        reactionComboCount.innerText = currentCombo.length;
        
        // 手札のリアクションカード
        const reactionCards = player.deck.hand.map((c, i) => ({ card: c, originalIndex: i }))
                                             .filter(item => item.card.category.includes('リアクション'));
        
        // 闘禅一致でセット済みのカード（currentCombo内のisSetReaction）
