import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_atk = """                if (s.card.name === 'ベヒーモス') {
                    logMsg(`【ベヒーモスの攻撃】任意の対象全員に対して、それぞれ「3点」のダメージ！`, 'damage');
                }
            }
        });"""

new_atk = """                if (s.card.name === 'ベヒーモス') {
                    logMsg(`【ベヒーモスの攻撃】任意の対象全員に対して、それぞれ「3点」のダメージ！`, 'damage');
                }
            }
        });
        
        // マナパージのデバフログ
        const hasPurge = currentCombo.some(c => c.name === '『マナパージ』');
        if (hasPurge) {
            logMsg(`【『マナパージ』のデバフ効果】<br><span style="color:#ffcc00; font-weight:bold;">この攻撃でダメージを受けた対象は、現在配置している「すべてのパッシブカード」を裏返し（無効化）にしなければならない！</span><br><span style="color:#aaa; font-size:0.8rem;">※裏返されたパッシブは、次のラウンド開始時から毎ターン1枚ずつ表（有効）に戻せる。対象プレイヤーは自己管理をお願いします。</span>`, 'important');
        }"""
content = content.replace(old_atk, new_atk)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
