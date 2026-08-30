import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 攻撃ボタン
old_atk = """                if (s.card.name === '泥濘の人形') {
                    logMsg(`【泥濘の人形の効果】任意の対象全ては、そのターンの「コンボ」を最大2枚までに制限される！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、このラウンドのコンボ枚数を自己管理してください）</span>`, 'important');
                }
                
                if (s.card.name === '狂雷の凶鳥') {"""

new_atk = """                if (s.card.name === '泥濘の人形') {
                    logMsg(`【泥濘の人形の効果】任意の対象全ては、そのターンの「コンボ」を最大2枚までに制限される！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、このラウンドのコンボ枚数を自己管理してください）</span>`, 'important');
                }
                
                if (s.card.name === '菌糸の獣骸') {
                    logMsg(`【菌糸の獣骸の宣言】このユニットが場に存在する限り、任意の対象全ての与えるダメージを常時「-1」する！`, 'important');
                }
                
                if (s.card.name === '狂雷の凶鳥') {"""
content = content.replace(old_atk, new_atk)


# 防御ボタン
old_def = """                if (s.card.name === '泥濘の人形') {
                    logMsg(`【泥濘の人形の効果】任意の対象全ては、そのターンの「コンボ」を最大2枚までに制限される！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、このラウンドのコンボ枚数を自己管理してください）</span>`, 'important');
                }
                
                updateUI();"""

new_def = """                if (s.card.name === '泥濘の人形') {
                    logMsg(`【泥濘の人形の効果】任意の対象全ては、そのターンの「コンボ」を最大2枚までに制限される！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、このラウンドのコンボ枚数を自己管理してください）</span>`, 'important');
                }
                
                if (s.card.name === '菌糸の獣骸') {
                    logMsg(`【菌糸の獣骸の宣言】このユニットが場に存在する限り、任意の対象全ての与えるダメージを常時「-1」する！`, 'important');
                }
                
                updateUI();"""
content = content.replace(old_def, new_def)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
