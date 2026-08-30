import re
import json

# 1. cards.json の更新
with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for card in cards:
    if card['name'] == '菌糸の獣骸':
        card['effect'] = "召喚・攻2 / 防2<br>**【特殊効果】**受けるダメージを1点軽減する。<br>全身が発光するキノコや菌糸に覆われた魔獣の死骸。幻覚性の胞子で攻撃を阻害する。"

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=4)


# 2. app_v6.js の更新
with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 攻撃ボタンのログ削除
old_atk = """                if (s.card.name === '泥濘の人形') {
                    logMsg(`【泥濘の人形の効果】任意の対象全ては、そのターンの「コンボ」を最大2枚までに制限される！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、このラウンドのコンボ枚数を自己管理してください）</span>`, 'important');
                }
                
                if (s.card.name === '菌糸の獣骸') {
                    logMsg(`【菌糸の獣骸の宣言】このユニットが場に存在する限り、任意の対象全ての与えるダメージを常時「-1」する！`, 'important');
                }
                
                if (s.card.name === '狂雷の凶鳥') {"""

new_atk = """                if (s.card.name === '泥濘の人形') {
                    logMsg(`【泥濘の人形の効果】任意の対象全ては、そのターンの「コンボ」を最大2枚までに制限される！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、このラウンドのコンボ枚数を自己管理してください）</span>`, 'important');
                }
                
                if (s.card.name === '狂雷の凶鳥') {"""
content = content.replace(old_atk, new_atk)


# 防御ボタンのログ削除
old_def = """                if (s.card.name === '泥濘の人形') {
                    logMsg(`【泥濘の人形の効果】任意の対象全ては、そのターンの「コンボ」を最大2枚までに制限される！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、このラウンドのコンボ枚数を自己管理してください）</span>`, 'important');
                }
                
                if (s.card.name === '菌糸の獣骸') {
                    logMsg(`【菌糸の獣骸の宣言】このユニットが場に存在する限り、任意の対象全ての与えるダメージを常時「-1」する！`, 'important');
                }
                
                updateUI();"""

new_def = """                if (s.card.name === '泥濘の人形') {
                    logMsg(`【泥濘の人形の効果】任意の対象全ては、そのターンの「コンボ」を最大2枚までに制限される！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、このラウンドのコンボ枚数を自己管理してください）</span>`, 'important');
                }
                
                updateUI();"""
content = content.replace(old_def, new_def)

# processReaction への軽減処理の追加
old_react = """            if (s.card.name === 'アイアン・タイガー') {
                summonDef += 2;
                summonLog += `・【アイアン・タイガー】常時効果 (軽減 2)<br>`;
            }
        });"""

new_react = """            if (s.card.name === 'アイアン・タイガー') {
                summonDef += 2;
                summonLog += `・【アイアン・タイガー】常時効果 (軽減 2)<br>`;
            }
            
            if (s.card.name === '菌糸の獣骸') {
                summonDef += 1;
                summonLog += `・【菌糸の獣骸】常時効果 (軽減 1)<br>`;
            }
        });"""
content = content.replace(old_react, new_react)


with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
