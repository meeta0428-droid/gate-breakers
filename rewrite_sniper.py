import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/card_effects_v5.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """            return {};
        }
    }
};"""

new_logic = """            return {};
        }
    },
    // スナイパーライフル：ダメージ＋5。任意のカードに対してダメージを与えることができる。この効果を使用すると手札か捨札を1枚を廃棄札へと移動する。
    "スナイパーライフル": {
        onAttack: (context) => {
            if (!context.currentCombo || context.totalDmg <= 0) return {};
            if (!context._sniperApplied) {
                // ダメージ+5を先に計算・表示（プレビュー時含む）
                context._sniperApplied = true;
                if (context.logMsg) {
                    context.logMsg(`・【パッシブ】スナイパーライフルの効果！ ダメージ ＋5`);
                }
                
                // 攻撃確定時のみ、デメリット処理を発動
                if (!context.isPreview) {
                    // 非同期でモーダルを開く
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                            detail: {
                                title: "スナイパーライフル：廃棄するカードを選択",
                                desc: "手札か捨札から1枚を選んで廃棄札に移動してください。",
                                playerObj: context.player,
                                source: 'hand_or_discard',
                                filterFunc: (c) => true,
                                onSelect: (discardedCard) => {
                                    context.player.deck.void.push(discardedCard);
                                    if (context.logMsg) {
                                        context.logMsg(`【スナイパーライフル】のデメリット効果：手札または捨札から「${discardedCard.name}」を廃棄札に移動しました。`, 'important');
                                    }
                                    if (typeof updateUI === 'function') updateUI();
                                }
                            }
                        }));
                    }, 500); // 攻撃確定処理が完走してモーダルが閉じられた後に開くように少し遅延
                }
                
                return { totalDmg: context.totalDmg + 5, _sniperApplied: true };
            }
            return {};
        }
    }
};"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/card_effects_v5.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
