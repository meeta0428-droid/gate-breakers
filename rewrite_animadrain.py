import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_atk = """        // マナパージのデバフログ
        const hasPurge = currentCombo.some(c => c.name === '『マナパージ』');
        if (hasPurge) {
            logMsg(`【『マナパージ』のデバフ効果】<br><span style="color:#ffcc00; font-weight:bold;">この攻撃でダメージを受けた対象は、現在配置している「すべてのパッシブカード」を裏返し（無効化）にしなければならない！</span><br><span style="color:#aaa; font-size:0.8rem;">※裏返されたパッシブは、次のラウンド開始時から毎ターン1枚ずつ表（有効）に戻せる。対象プレイヤーは自己管理をお願いします。</span>`, 'important');
        }"""


new_atk = """        // マナパージのデバフログ
        const hasPurge = currentCombo.some(c => c.name === '『マナパージ』');
        if (hasPurge) {
            logMsg(`【『マナパージ』のデバフ効果】<br><span style="color:#ffcc00; font-weight:bold;">この攻撃でダメージを受けた対象は、現在配置している「すべてのパッシブカード」を裏返し（無効化）にしなければならない！</span><br><span style="color:#aaa; font-size:0.8rem;">※裏返されたパッシブは、次のラウンド開始時から毎ターン1枚ずつ表（有効）に戻せる。対象プレイヤーは自己管理をお願いします。</span>`, 'important');
        }
        
        // アニマドレインの回収案内ログ
        const hasAnima = currentCombo.some(c => c.name === '『アニマドレイン』');
        if (hasAnima) {
            logMsg(`【『アニマドレイン』の回収効果】<br><span style="color:#ffcc00; font-weight:bold;">相手がこの攻撃に対して「リアクション」を使用した場合、相手が使用したカードと同じコストまでのカードを1枚、自分の捨札から手札に戻すことができる！</span><br><span style="color:#aaa; font-size:0.8rem;">※通信対戦ではないため、相手のリアクションを確認後、画面下部の「捨札確認」から手動で回収を行ってください。</span>`, 'important');
        }"""
content = content.replace(old_atk, new_atk)


with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
