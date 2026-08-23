export const cardEffects = {
    // サンプル実装１：ダメージを半減する
    "エルダースタッグ": {
        onBeforeDamageTaken: (context) => {
            let { pendingDamage, logMsg, card } = context;
            const reduced = Math.floor(pendingDamage / 2);
            if (pendingDamage > 0) {
                logMsg(`【${card.name}】の効果発動！ダメージを半減（${pendingDamage} → ${reduced}）`, 'important');
            }
            return { pendingDamage: reduced };
        }
    },
    // サンプル実装２：ダメージを0にする
    "フロストシェル": {
        onBeforeDamageTaken: (context) => {
            let { pendingDamage, logMsg, card } = context;
            if (pendingDamage > 0) {
                logMsg(`【${card.name}】の効果発動！ダメージを完全に無効化！`, 'important');
            }
            return { pendingDamage: 0 };
        }
    },
    // 今回実装するカード：狂戦士
    "狂戦士": {
        onAttack: (context) => {
            let { totalDmg, logMsg, player, card } = context;
            // 廃棄札1枚につきダメージ＋1
            const voidCount = player.deck.void.length;
            if (voidCount > 0) {
                totalDmg += voidCount;
                if (logMsg) {
                    logMsg(`・【${card.name}】の効果！廃棄札が ${voidCount} 枚あるため、ダメージ＋${voidCount}！`);
                }
            }
            return { totalDmg };
        },
        onCalcMaxHandSize: (context) => {
            let { maxHandSize, player } = context;
            // 廃棄札2枚につき手札上限＋1
            const voidCount = player.deck.void.length;
            const bonus = Math.floor(voidCount / 2);
            if (bonus > 0) {
                maxHandSize += bonus;
            }
            return { maxHandSize };
        }
    },
    "虚槌スマッシャー": {
        onAttack: (context) => {
            let { totalDmg, logMsg, player, card } = context;
            if (totalDmg > 0 && player.deck.mountain.length === 0) {
                totalDmg += 5;
                if (logMsg) logMsg(`・【パッシブ】${card.name}の追加効果（山札0）でさらにダメージ＋5！`);
            }
            return { totalDmg };
        }
    },
    "八面六臂": {
        onAttack: (context) => {
            let { totalDmg, logMsg, player, card } = context;
            const otherBodyPassives = player.deck.passives.filter(p => p.name !== '八面六臂' && p.category.includes('肉体・パッシブ')).length;
            if (otherBodyPassives >= 1) {
                totalDmg += otherBodyPassives;
                if (logMsg) logMsg(`・【パッシブ】${card.name}の効果！他の肉体パッシブが ${otherBodyPassives} 枚あるため、ダメージ＋${otherBodyPassives}！`);
            }
            return { totalDmg };
        }
    },
    "水月の構え": {
        onBeforeDamageTaken: (context) => {
            let { pendingDamage, logMsg, player, card } = context;
            const otherBodyPassives = player.deck.passives.filter(p => p.name !== '水月の構え' && p.category.includes('肉体・パッシブ')).length;
            if (otherBodyPassives >= 1 && pendingDamage > 0) {
                const reduced = Math.max(0, pendingDamage - otherBodyPassives);
                if (logMsg) logMsg(`・【パッシブ】${card.name}の効果！他の肉体パッシブが ${otherBodyPassives} 枚あるため、ダメージを ${otherBodyPassives} 点軽減！`);
                pendingDamage = reduced;
            }
            return { pendingDamage };
        }
    },
    // 不屈：使用時に廃棄札にあるコスト3以下のカードをすべて山札に戻す
    "不屈": {
        onPlay: (context) => {
            let { player, logMsg, card } = context;
            let movedCount = 0;
            const newVoid = [];
            // 廃棄札からコスト3以下のカードをすべて山札に戻す
            for (const c of player.deck.void) {
                if (c.cost <= 3) {
                    player.deck.mountain.push(c);
                    movedCount++;
                } else {
                    newVoid.push(c);
                }
            }
            player.deck.void = newVoid;
            player.deck.shuffle(player.deck.mountain);
            if (movedCount > 0 && logMsg) {
                logMsg(`・【${card.name}】の効果！廃棄札からコスト3以下のカード ${movedCount} 枚を山札に戻しました。`);
            }
        }
    },
    // 忍者：戦闘開始時に手札上限＋1し、山札から1枚引く。※このカードは重複しない
    "忍者": {
        onCalcMaxHandSize: (context) => {
            // 重複しない：何枚あっても+1のみ
            if (context._ninjaApplied) return {};
            let { maxHandSize } = context;
            maxHandSize += 1;
            context._ninjaApplied = true;
            return { maxHandSize, _ninjaApplied: true };
        }
    },
    // 暗器使い：相手がリアクションをしなかった場合に使用カードがコスト3以下の場合、ダメージ＋2。
    "暗器使い": {
        onAttack: (context) => {
            if (!context.enemyNoReact) return {};
            if (!context.currentCombo || context.currentCombo.length === 0) return {};
            
            let bonusDmg = 0;
            let count = 0;
            for (const c of context.currentCombo) {
                if (c.cost <= 3) {
                    bonusDmg += 2;
                    count++;
                }
            }
            
            if (bonusDmg > 0) {
                context.logMsg(`【暗器使い】敵の隙を突いた！コスト3以下のカード ${count}枚 により追加ダメージ ＋${bonusDmg}！`, 'important');
                return { totalDmg: context.totalDmg + bonusDmg };
            }
            return {};
        }
    },
    // 無明穿：対象の手札が1枚以下の場合、あらゆるダメージ軽減を無視する。リアクションされなかった場合、ダメージ＋12に変更。
    "無明穿": {
        onAttack: (context) => {
            if (context.enemyNoReact) {
                // 基本の+6に加えて、+12に変更するため追加で+6
                context.logMsg(`【無明穿】リアクションを許さない強烈な一撃！追加ダメージ ＋6！`, 'important');
                return { totalDmg: context.totalDmg + 6 };
            }
            return {};
        }
    },
    // 魔術師：捨札1枚につきダメージ＋1
    "魔術師": {
        onAttack: (context) => {
            if (context.totalDmg > 0 && context.player && !context._majutsushiApplied) {
                let discardCount = context.player.deck.discard.length;
                
                // 現在使用中のカード（コンボエリアにあるカード）は捨札枚数にカウントしない
                if (context.currentCombo) {
                    const comboSet = new Set(context.currentCombo);
                    discardCount = context.player.deck.discard.filter(c => !comboSet.has(c)).length;
                }

                if (discardCount > 0) {
                    context._majutsushiApplied = true; // 重複防止
                    context.logMsg(`【魔術師】知識を力に変換！捨札 ${discardCount}枚 につきダメージ ＋${discardCount}！`, 'important');
                    return { totalDmg: context.totalDmg + discardCount, _majutsushiApplied: true };
                }
            }
            return {};
        }
    },
    // キュアライト：使用者の捨札1枚につき強度+1、その強度以下のコストの廃棄札を山札に戻せる
    "キュアライト": {
        onAttack: (context) => {
            if (context.player && !context._curelightApplied) {
                let discardCount = context.player.deck.discard.length;
                
                // コンボエリアにあるカード（今使っているキュアライト等）は捨札としてカウントしない
                if (context.currentCombo) {
                    const comboSet = new Set(context.currentCombo);
                    discardCount = context.player.deck.discard.filter(c => !comboSet.has(c)).length;
                }
                
                // キュアライトの基本強度は3
                const finalStrength = 3 + discardCount;
                
                context._curelightApplied = true;
                context.logMsg(`【キュアライト】癒やしの光！現在の捨札は ${discardCount} 枚。<br>強度が <b>${finalStrength}</b> になりました！<br><span style="color:#ff66cc;">※味方（または自分）は廃棄札から <b>コスト${finalStrength} 以下</b> のカードを1枚、山札に戻してください。</span>`, 'important');
                return { _curelightApplied: true };
            }
            return {};
        }
    },
    // 氷雪魔弾：持続デバフの強度をログに出力
    "氷雪魔弾": {
        onAttack: (context) => {
            if (context.player && !context._hyosetsuApplied) {
                const hasMadanjushi = context.player.deck.passives.some(p => p.name === '魔弾銃士');
                // 基本強度は3
                let finalStrength = 3;
                if (hasMadanjushi) {
                    finalStrength += 1;
                }
                
                context._hyosetsuApplied = true;
                context.logMsg(`【氷雪魔弾】凍てつく弾丸！<br>このカードが捨札にある間、ダメージを受けた対象は <b>コスト${finalStrength} 以下</b> のカードを回収する際のコストが＋1されます！`, 'important');
                return { _hyosetsuApplied: true };
            }
            return {};
        }
    },
    // 腐食酸：効果内容をログに出力
    "腐食酸": {
        onAttack: (context) => {
            if (!context._fushokusanApplied) {
                context._fushokusanApplied = true;
                context.logMsg(`【腐食酸】強烈な酸が飛び散る！<br><span style="color:#ffcc00;">※この効果に対しリアクションをする対象は、<b>手札から1枚を廃棄札に移動</b>しなければなりません！</span>`, 'important');
                return { _fushokusanApplied: true };
            }
            return {};
        }
    },
    // 賦活の秘薬：回復の指示をログに出力し、回復モーダルを呼ぶ
    "賦活の秘薬": {
        onAttack: (context) => {
            if (!context._fukatsuApplied) {
                context._fukatsuApplied = true;
                context.logMsg(`【賦活の秘薬】生命力がみなぎる！<br>※<b>自身とその他１体</b>を対象として、<b>任意の一つの能力値のダメージを１点回復</b>させてください。<br>また、このカードが捨札にある間、すべての回収ポイントが＋１されます！`, 'important');
                
                if (context.player) {
                    window.dispatchEvent(new CustomEvent('requestStatHeal', {
                        detail: {
                            amount: 1,
                            playerObj: context.player,
                            desc: "【自身への回復】回復する能力値を1つ選んでください。（各1点回復）※味方1体は手動で回復してください"
                        }
                    }));
                }
                
                return { _fukatsuApplied: true };
            }
            return {};
        }
    },
    // 起爆粉塵：コンボが続く場合、ダメージを＋4から＋6に変更（差分の＋2を追加）
    "起爆粉塵": {
        onAttack: (context) => {
            if (!context.currentCombo || context.currentCombo.length === 0) return {};
            
            let bonusDmg = 0;
            // コンボの中に起爆粉塵が含まれているかチェック
            for (let i = 0; i < context.currentCombo.length; i++) {
                if (context.currentCombo[i].name === '起爆粉塵') {
                    // 起爆粉塵の後（2枚目以降）にカードが続いていればコンボ成立
                    if (i < context.currentCombo.length - 1) {
                        bonusDmg += 2; // +4から+6への変更分（1枚につき+2）
                    }
                }
            }
            
            if (bonusDmg > 0 && !context._kibakuApplied) {
                context._kibakuApplied = true;
                context.logMsg(`【起爆粉塵】コンボ成立！粉塵が連鎖爆発を起こす！<br>ダメージ＋4 が <b>ダメージ＋6</b> に変更されました！（追加ダメージ ＋${bonusDmg}）`, 'important');
                return { totalDmg: context.totalDmg + bonusDmg, _kibakuApplied: true };
            }
            
            return {};
        }
    },
    // バックドア・アクセス：相手の手札を公開するよう促す
    "バックドア・アクセス": {
        onAttack: (context) => {
            if (!context._backdoorApplied) {
                context._backdoorApplied = true;
                context.logMsg(`【バックドア・アクセス】システムへの侵入に成功！<br><span style="color:#ffcc00;">※任意の対象（敵など）を指定し、<b>手札1枚を表向き（公開状態）</b>にさせてください。<br>公開状態にした場合は、画面下部の「敵手札オープン中」にチェックを入れてください。</span>`, 'important');
                return { _backdoorApplied: true };
            }
            return {};
        }
    },
    // ウィークポイント：コンボ成立時（2枚以上のカードを出している場合）、ダメージ＋1を＋4に変更（追加で＋3）
    "ウィークポイント": {
        onAttack: (context) => {
            if (!context.currentCombo || context.currentCombo.length <= 1) return {};
            
            let bonusDmg = 0;
            // コンボの中にウィークポイントが何枚含まれているかチェック
            for (let i = 0; i < context.currentCombo.length; i++) {
                if (context.currentCombo[i].name === 'ウィークポイント') {
                    // コンボが成立（2枚以上）しているので、1枚につき+3（元の+1に加算して+4になる）
                    bonusDmg += 3;
                }
            }
            
            
            if (bonusDmg > 0 && !context._weakpointApplied) {
                context._weakpointApplied = true;
                context.logMsg(`【ウィークポイント】急所を的確に狙う！コンボ成立！<br>ダメージ＋1 が <b>ダメージ＋4</b> に変更されました！（追加ダメージ ＋${bonusDmg}）`, 'important');
                return { totalDmg: context.totalDmg + bonusDmg, _weakpointApplied: true };
            }
            
            return {};
        }
    },
    // ハンドヘルドコンピュータ：敵陣営に「公開状態」の手札が存在する場合、カード毎にダメージ+1
    "ハンドヘルドコンピュータ": {
        onAttack: (context) => {
            if (context.enemyOpen && context.currentCombo && context.currentCombo.length > 0 && !context._handheldApplied) {
                const bonusDmg = context.currentCombo.length;
                context._handheldApplied = true;
                context.logMsg(`【ハンドヘルドコンピュータ】敵の公開手札を解析！コンボ枚数（${bonusDmg}枚）に応じてダメージ ＋${bonusDmg}！`, 'important');
                return { totalDmg: context.totalDmg + bonusDmg, _handheldApplied: true };
            }
            return {};
        }
    },
    // ロジックブレイク：オープン中のカードを廃棄する指示をログに出力
    "ロジックブレイク": {
        onAttack: (context) => {
            if (!context._logicBreakApplied) {
                context._logicBreakApplied = true;
                context.logMsg(`【ロジックブレイク】敵の思考を破壊する！<br><span style="color:#ff5555; font-weight:bold;">※オープン中のカードを１枚廃棄！</span><br>（敵の公開状態の手札を1枚指定し、強制的に廃棄札へ移動させてください）`, 'important');
                return { _logicBreakApplied: true };
            }
            return {};
        }
    },
    // 戦術解析士：「知性・アクション」のダメージを＋1
    "戦術解析士": {
        onAttack: (context) => {
            if (context.currentCombo && context.currentCombo.length > 0 && !context._senjutsuApplied) {
                let bonusDmg = 0;
                for (const c of context.currentCombo) {
                    if (c.category.includes('知性') && c.category.includes('アクション')) {
                        bonusDmg += 1;
                    }
                }
                
                if (bonusDmg > 0) {
                    context._senjutsuApplied = true;
                    context.logMsg(`【戦術解析士】情報のアドバンテージ！知性・アクションのダメージ ＋${bonusDmg}！`, 'important');
                    return { totalDmg: context.totalDmg + bonusDmg, _senjutsuApplied: true };
                }
            }
            return {};
        }
    },
    // スキャン：敵の手札が公開状態の場合、追加ダメージ＋3
    "スキャン": {
        onAttack: (context) => {
            if (context.enemyOpen && !context._scanApplied) {
                // コンボの中にスキャンが何枚含まれているかチェック
                let scanCount = 0;
                if (context.currentCombo) {
                    for (const c of context.currentCombo) {
                        if (c.name === 'スキャン') {
                            scanCount++;
                        }
                    }
                }
                
                if (scanCount > 0) {
                    const bonusDmg = 3 * scanCount;
                    context._scanApplied = true;
                    context.logMsg(`【スキャン】敵の弱点を捕捉！公開状態の隙を突き、ダメージ ＋${bonusDmg}！`, 'important');
                    return { totalDmg: context.totalDmg + bonusDmg, _scanApplied: true };
                }
            }
            return {};
        }
    },
    // エンターテイナー：アクションカードを含みダメージを与えた場合、合計ダメージ＋1
    "エンターテイナー": {
        onAttack: (context) => {
            if (context.currentCombo && context.currentCombo.length > 0 && context.totalDmg > 0 && !context._entertainerApplied) {
                const hasAction = context.currentCombo.some(c => c.category.includes('アクション'));
                if (hasAction) {
                    context._entertainerApplied = true;
                    context.logMsg(`【エンターテイナー】魅惑のパフォーマンス！アクション攻撃の合計ダメージ ＋1！`, 'important');
                    return { totalDmg: context.totalDmg + 1, _entertainerApplied: true };
                }
            }
            return {};
        }
    },
    // キュウソネコカミ：能力値が0になるたび（現在値が0の能力値の数×3）ダメージ＋3、受けるダメージ（数×1）軽減。
    "キュウソネコカミ": {
        onAttack: (context) => {
            if (!context.player || !context.currentCombo) return {};
            
            // ダメージ表記があるカード（またはアクションカード）が含まれているかチェック
            const hasDamageCard = context.currentCombo.some(c => c.effect.includes('ダメージ') || c.category.includes('アクション'));
            
            // ダメージを与えるつもりのないカードには適用しない
            if (!hasDamageCard && context.totalDmg <= 0) return {};

            const zeroCount = [
                context.player.stats.body, 
                context.player.stats.int, 
                context.player.stats.men
            ].filter(s => s.currentVal === 0).length;
            
            if (zeroCount > 0 && !context._kyusoAttackApplied) {
                const bonusDmg = zeroCount * 3;
                context._kyusoAttackApplied = true;
                if (context.logMsg) {
                    context.logMsg(`【パッシブ】キュウソネコカミの効果！0になった能力値が${zeroCount}つあるため、ダメージ ＋${bonusDmg}！`, 'important');
                }
                return { totalDmg: context.totalDmg + bonusDmg, _kyusoAttackApplied: true };
            }
            return {};
        },
        onBeforeDamageTaken: (context) => {
            if (!context.player || context.pendingDamage <= 0) return {};
            const zeroCount = [
                context.player.stats.body, 
                context.player.stats.int, 
                context.player.stats.men
            ].filter(s => s.currentVal === 0).length;
            
            if (zeroCount > 0 && !context._kyusoDefendApplied) {
                const reduceVal = zeroCount * 1;
                context._kyusoDefendApplied = true;
                const finalDamage = Math.max(0, context.pendingDamage - reduceVal);
                if (context.logMsg) {
                    context.logMsg(`【パッシブ】キュウソネコカミの効果！0になった能力値が${zeroCount}つあるため、ダメージを ${reduceVal} 点軽減！`);
                }
                return { pendingDamage: finalDamage, _kyusoDefendApplied: true };
            }
            return {};
        }
    },
    // 奇跡の雫：強度以下の廃棄札を1枚手札に戻し、一つの能力値を全回復
    "奇跡の雫": {
        onAttack: (context) => {
            if (!context._kisekiApplied) {
                context._kisekiApplied = true;
                if (context.logMsg) {
                    context.logMsg(`【奇跡の雫】<br><span style="color:#ffcc00; font-weight:bold;">※強度(8)以下の廃棄札を1枚選び、手動で手札に戻してください。</span><br><span style="color:#4caf50; font-weight:bold;">※一つの能力値を選び、ダメージを全て回復（現在値を最大値まで回復）してください。</span>`, 'important');
                }
                return { _kisekiApplied: true };
            }
            return {};
        }
    },
    // 秘策は我にあり：捨札を全てシャッフルした後に山札に戻すことができる。
    "秘策は我にあり": {
        onAttack: (context) => {
            if (context.isPreview) return {}; // プレビュー時は実行しない
            
            if (!context._hisakuApplied) {
                context._hisakuApplied = true;
                // コンボの中に含まれているか
                const hasCard = context.currentCombo && context.currentCombo.some(c => c.name === '秘策は我にあり');
                if (hasCard && context.player && context.player.deck.discard.length > 0) {
                    if (confirm('【秘策は我にあり】の効果で、捨札を全て山札に戻してシャッフルしますか？')) {
                        const discarded = context.player.deck.discard.splice(0, context.player.deck.discard.length);
                        context.player.deck.mountain.push(...discarded);
                        // シャッフル
                        for (let i = context.player.deck.mountain.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [context.player.deck.mountain[i], context.player.deck.mountain[j]] = [context.player.deck.mountain[j], context.player.deck.mountain[i]];
                        }
                        if (context.logMsg) {
                            context.logMsg(`【秘策は我にあり】の効果発動！<br>捨札 ${discarded.length} 枚をすべて山札に戻し、シャッフルした！`, 'important');
                        }
                    }
                }
                return { _hisakuApplied: true };
            }
            return {};
        }
    },
    // 戦術眼：対象のカードを無効化し、相手の消費コスト分だけ捨札を回収
    "戦術眼": {
        onBeforeDamageTaken: (context) => {
            if (context.isPreview) return {};
            if (!context._senjuganApplied) {
                context._senjuganApplied = true;
                if (context.logMsg) {
                    context.logMsg(`【戦術眼】<br><span style="color:#ffcc00; font-weight:bold;">※対象が使ったカードを無効化します（対象に伝えてください）。<br>その後、相手が使ったコストと同じ合計コストになるまで、捨札から任意のカードを全て手動で手札に回収してください。</span>`, 'important');
                }
                return { _senjuganApplied: true };
            }
            return {};
        },
        onAttack: (context) => {
            if (context.isPreview) return {};
            if (!context._senjuganApplied) {
                context._senjuganApplied = true;
                if (context.logMsg) {
                    context.logMsg(`【戦術眼】<br><span style="color:#ffcc00; font-weight:bold;">※対象が使ったカードを無効化します（対象に伝えてください）。<br>その後、相手が使ったコストと同じ合計コストになるまで、捨札から任意のカードを全て手動で手札に回収してください。</span>`, 'important');
                }
                return { _senjuganApplied: true };
            }
            return {};
        }
    }
};
