import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 攻撃時のログ
old_atk = """                } else {
                    s.stance = 'attack';
                }
                updateUI();
            });"""

new_atk = """                } else {
                    s.stance = 'attack';
                }
                
                if (s.card.name === 'ベヒーモス') {
                    logMsg(`【ベヒーモスの攻撃】任意の対象全員に対して、それぞれ「3点」のダメージ！`, 'damage');
                }
                
                updateUI();
            });"""
content = content.replace(old_atk, new_atk)


# 2. 廃棄時のログ
old_dismiss = """                        if (s.card.name === 'スプリガン') {
                            effectText = `<span style="color:#ffcc00; font-weight:bold;">※現在の「攻」の数値： ${atk} </span><br>` + effectText;
                        }
                        logMsg(`召喚ユニット「${s.card.name}」を廃棄札へ移動しました！<br><span style="color:#aaa; font-size:0.8rem;">【効果】${effectText}</span>`, 'important');"""

new_dismiss = """                        if (s.card.name === 'スプリガン') {
                            effectText = `<span style="color:#ffcc00; font-weight:bold;">※現在の「攻」の数値： ${atk} </span><br>` + effectText;
                        }
                        if (s.card.name === 'ベヒーモス') {
                            effectText = `<span style="color:#ffcc00; font-weight:bold;">※任意の対象全員に対して、それぞれ「6点」のダメージ！</span><br>` + effectText;
                        }
                        logMsg(`召喚ユニット「${s.card.name}」を廃棄札へ移動しました！<br><span style="color:#aaa; font-size:0.8rem;">【効果】${effectText}</span>`, 'important');"""
content = content.replace(old_dismiss, new_dismiss)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
