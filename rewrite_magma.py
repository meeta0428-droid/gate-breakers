import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 手動での廃棄ボタン押下時
old_dismiss = """                        if (s.card.name === '怨樹の角魔') {
                            logMsg('【怨樹の角魔の効果】廃棄札に移動したため、攻撃者はコスト4以下のカード1枚を廃棄札に移動する！', 'damage');
                        }
                    }
                    updateUI();"""

new_dismiss = """                        if (s.card.name === '怨樹の角魔') {
                            logMsg('【怨樹の角魔の効果】廃棄札に移動したため、攻撃者はコスト4以下のカード1枚を廃棄札に移動する！', 'damage');
                        }
                        if (s.card.name === '赫怒の熔魔') {
                            logMsg('【赫怒の熔魔の効果】廃棄札に移動したため、任意の対象全てに3点のダメージを与える！', 'damage');
                        }
                    }
                    updateUI();"""
content = content.replace(old_dismiss, new_dismiss)


# 2. 身代わり処理による破壊時
old_sacrifice = """                        if (s.card.name === '怨樹の角魔') {
                            logMsg('【怨樹の角魔の効果】廃棄札に移動したため、攻撃者はコスト4以下のカード1枚を廃棄札に移動する！', 'damage');
                        }
                        
                        if (s.card.name === 'ライトニングボア') {"""

new_sacrifice = """                        if (s.card.name === '怨樹の角魔') {
                            logMsg('【怨樹の角魔の効果】廃棄札に移動したため、攻撃者はコスト4以下のカード1枚を廃棄札に移動する！', 'damage');
                        }
                        
                        if (s.card.name === '赫怒の熔魔') {
                            logMsg('【赫怒の熔魔の効果】廃棄札に移動したため、任意の対象全てに3点のダメージを与える！', 'damage');
                        }
                        
                        if (s.card.name === 'ライトニングボア') {"""
content = content.replace(old_sacrifice, new_sacrifice)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
