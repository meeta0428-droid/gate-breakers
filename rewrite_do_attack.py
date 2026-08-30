import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# doAttackProcess の最後のログ出力部分を探す
old_log = """        const hasAllTarget = currentCombo.some(c => c.effect.includes('任意の対象全て') || c.effect.includes('任意の対象すべて'));
        const targetLog = hasAllTarget ? '<br><span style="color:#ffcc00; font-weight:bold;">【任意の対象すべてへの攻撃！】</span>' : '';

        const finalMsg = `使用カード:<br>${cardLogs}<br>${summonLog}コンボ発動！ 合計 <span class="damage">${totalDmg}</span> のダメージを与えた！${targetLog}${manualLog}`;

        if (isPreview) {"""

new_log = """        const hasAllTarget = currentCombo.some(c => c.effect.includes('任意の対象全て') || c.effect.includes('任意の対象すべて'));
        const targetLog = hasAllTarget ? '<br><span style="color:#ffcc00; font-weight:bold;">【任意の対象すべてへの攻撃！】</span>' : '';

        const finalMsg = `使用カード:<br>${cardLogs}<br>${summonLog}コンボ発動！ 合計 <span class="damage">${totalDmg}</span> のダメージを与えた！${targetLog}${manualLog}`;

        if (isPreview) {"""
content = content.replace(old_log, new_log)
# ここで追加したいが、プレビューと本番実行の分岐の後（実際に実行したとき）に出したい。

# プレビュー分岐の after 部分（実際の実行時のログ出力）
old_exec_log = """            currentCombo = [...setCards];
            updateUI();
        };"""

new_exec_log = """            
            // マナパージのデバフログ
            const hasPurge = currentCombo.some(c => c.name === '『マナパージ』');
            if (hasPurge) {
                originalLogMsg(`【『マナパージ』のデバフ効果】<br><span style="color:#ffcc00; font-weight:bold;">この攻撃でダメージを受けた対象は、現在配置している「すべてのパッシブカード」を裏返し（無効化）にしなければならない！</span><br><span style="color:#aaa; font-size:0.8rem;">※裏返されたパッシブは、パッシブ名の横にある「裏返し」チェックを手動で付けてください。次のラウンドから毎ターン1枚ずつ表に戻せます。</span>`, 'important');
            }
            
            // アニマドレインの回収案内ログ
            const hasAnima = currentCombo.some(c => c.name === '『アニマドレイン』');
            if (hasAnima) {
                originalLogMsg(`【『アニマドレイン』の回収効果】<br><span style="color:#ffcc00; font-weight:bold;">相手がこの攻撃に対して「リアクション」を使用した場合、相手が使用したカードと同じコストまでのカードを1枚、自分の捨札から手札に戻すことができる！</span><br><span style="color:#aaa; font-size:0.8rem;">※通信対戦ではないため、相手のリアクションを確認後、画面下部の「捨札確認」から手動で回収を行ってください。</span>`, 'important');
            }

            currentCombo = [...setCards];
            updateUI();
        };"""
content = content.replace(old_exec_log, new_exec_log)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement check:", content != open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r').read())
