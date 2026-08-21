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
    }
};
