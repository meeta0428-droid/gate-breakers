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
    // 賦活の秘薬：回復の指示をログに出力
    "賦活の秘薬": {
        onAttack: (context) => {
            if (!context._fukatsuApplied) {
                context._fukatsuApplied = true;
                context.logMsg(`【賦活の秘薬】生命力がみなぎる！<br>※プレイヤーは<b>任意の一つの能力値のダメージを１点回復</b>させてください。<br>また、このカードが捨札にある間、すべての回収ポイントが＋１されます！`, 'important');
                return { _fukatsuApplied: true };
            }
            return {};
        }
    }
};
