import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 廃棄ボタン
old_dismiss = """                        if (s.card.name === '赫怒の熔魔') {
                            logMsg('【赫怒の熔魔の効果】廃棄札に移動したため、任意の対象全てに3点のダメージを与える！', 'damage');
                        }
                    }
                    updateUI();"""

new_dismiss = """                        if (s.card.name === '赫怒の熔魔') {
                            logMsg('【赫怒の熔魔の効果】廃棄札に移動したため、任意の対象全てに3点のダメージを与える！', 'damage');
                        }
                        if (s.card.name === '呪響骸鳥') {
                            logMsg('【呪響骸鳥の効果】自身が廃棄札に移動したため、対象のコスト3以下の捨札1枚を強制的に廃棄札へと移動させる！', 'damage');
                        }
                    }
                    updateUI();"""
content = content.replace(old_dismiss, new_dismiss)

# 2. 身代わり処理（破壊時）
old_sacrifice = """                        if (s.card.name === '赫怒の熔魔') {
                            logMsg('【赫怒の熔魔の効果】廃棄札に移動したため、任意の対象全てに3点のダメージを与える！', 'damage');
                        }
                        
                        if (s.card.name === 'ライトニングボア') {"""

new_sacrifice = """                        if (s.card.name === '赫怒の熔魔') {
                            logMsg('【赫怒の熔魔の効果】廃棄札に移動したため、任意の対象全てに3点のダメージを与える！', 'damage');
                        }
                        
                        if (s.card.name === '呪響骸鳥') {
                            logMsg('【呪響骸鳥の効果】自身が廃棄札に移動したため、対象のコスト3以下の捨札1枚を強制的に廃棄札へと移動させる！', 'damage');
                        }
                        
                        if (s.card.name === 'ライトニングボア') {"""
content = content.replace(old_sacrifice, new_sacrifice)


with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
