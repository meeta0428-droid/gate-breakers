import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# コンボ時の追撃ログ
old_logic1 = """                    if (s.card.name === 'サラマンダー' || s.card.name === 'ファントムレオ') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[リアクション不可]</span>';
                    }"""

new_logic1 = """                    if (s.card.name === 'サラマンダー' || s.card.name === 'ファントムレオ' || s.card.name === '狂雷の凶鳥') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[リアクション不可]</span>';
                    }"""

content = content.replace(old_logic1, new_logic1)

# 攻撃ボタン単体押下時のログ
old_logic2 = """                if (s.card.name === '泥瘴の悪鬼') {
                    logMsg(`【泥瘴の悪鬼の攻撃】任意の対象全ての回収ポイントを-1する！`, 'damage');
                }
                
                if (s.card.name === 'テクトニックライノ') {"""

new_logic2 = """                if (s.card.name === '泥瘴の悪鬼') {
                    logMsg(`【泥瘴の悪鬼の攻撃】任意の対象全ての回収ポイントを-1する！`, 'damage');
                }
                
                if (s.card.name === '狂雷の凶鳥') {
                    logMsg(`【狂雷の凶鳥の攻撃】このユニットのダメージはリアクションすることができない！`, 'damage');
                }
                
                if (s.card.name === 'テクトニックライノ') {"""

content = content.replace(old_logic2, new_logic2)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
