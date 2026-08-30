import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 攻撃ボタン
old_atk = """                if (s.card.name === '泥瘴の悪鬼') {
                    logMsg(`【泥瘴の悪鬼の攻撃】任意の対象全ての回収ポイントを-1する！`, 'damage');
                }
                
                if (s.card.name === '狂雷の凶鳥') {"""

new_atk = """                if (s.card.name === '泥瘴の悪鬼') {
                    logMsg(`【泥瘴の悪鬼の攻撃】任意の対象全ての回収ポイントを-1する！`, 'damage');
                }
                
                if (s.card.name === '呪縛の悪霊') {
                    logMsg(`【呪縛の悪霊の効果】任意の対象1体はコスト2以下のカードを使用できない！<br><span style="color:#aaa; font-size:0.8rem;">（※この効果は、このユニットが場から廃棄札に送られるまで持続する）</span>`, 'important');
                }
                
                if (s.card.name === '狂雷の凶鳥') {"""
content = content.replace(old_atk, new_atk)


# 防御ボタン
old_def = """                if (s.card.name === 'ガイアギガース') {
                    logMsg(`【ガイアギガースの防御】そのラウンドの「精神」または「知性」カテゴリーの効果を1枚無効化する！`, 'important');
                }
                
                updateUI();"""

new_def = """                if (s.card.name === 'ガイアギガース') {
                    logMsg(`【ガイアギガースの防御】そのラウンドの「精神」または「知性」カテゴリーの効果を1枚無効化する！`, 'important');
                }
                
                if (s.card.name === '呪縛の悪霊') {
                    logMsg(`【呪縛の悪霊の効果】任意の対象1体はコスト2以下のカードを使用できない！<br><span style="color:#aaa; font-size:0.8rem;">（※この効果は、このユニットが場から廃棄札に送られるまで持続する）</span>`, 'important');
                }
                
                updateUI();"""
content = content.replace(old_def, new_def)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
