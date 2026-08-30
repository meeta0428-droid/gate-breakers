import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 廃棄ボタン
old_dismiss = """                        if (s.card.name === 'フロストシェル') {
                            logMsg('【フロストシェルの効果】自身が廃棄札へ移動したため、知性能力値へのダメージは0になる！', 'important');
                        }
                    }
                    updateUI();"""

new_dismiss = """                        if (s.card.name === 'フロストシェル') {
                            logMsg('【フロストシェルの効果】自身が廃棄札へ移動したため、知性能力値へのダメージは0になる！', 'important');
                        }
                        if (s.card.name === '怨樹の角魔') {
                            logMsg('【怨樹の角魔の効果】廃棄札に移動したため、攻撃者はコスト4以下のカード1枚を廃棄札に移動する！', 'damage');
                        }
                    }
                    updateUI();"""

content = content.replace(old_dismiss, new_dismiss)

# 2. 身代わり処理（破壊時）
old_sacrifice = """                        } else {
                            player.deck.void.push(s.card);
                            logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                        }
                        
                        if (s.card.name === 'ライトニングボア') {"""

new_sacrifice = """                        } else {
                            player.deck.void.push(s.card);
                            logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                        }
                        
                        if (s.card.name === '怨樹の角魔') {
                            logMsg('【怨樹の角魔の効果】廃棄札に移動したため、攻撃者はコスト4以下のカード1枚を廃棄札に移動する！', 'damage');
                        }
                        
                        if (s.card.name === 'ライトニングボア') {"""

content = content.replace(old_sacrifice, new_sacrifice)


with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
