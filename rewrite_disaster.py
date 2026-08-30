import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """            sDiv.querySelector('.btn-atk').addEventListener('click', () => {
                if (s.card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる')) {"""

new_logic = """            sDiv.querySelector('.btn-atk').addEventListener('click', () => {
                if (s.card.name === '災厄の群魔') {
                    const useSpecial = confirm("【災厄の群魔】の行動を選択してください。\\n\\n「OK」：特殊効果を使用する\\n（任意の対象全ての山札1枚を捨札へ。このラウンドは攻撃スタンスになりません）\\n\\n「キャンセル」：通常通り「攻撃スタンス（攻5）」にする");
                    if (useSpecial) {
                        logMsg(`【災厄の群魔の特殊効果】任意の対象全ての山札1枚を捨札に移動する！<br><span style="color:#ff5252; font-size:0.8rem;">（※この効果を使用したラウンドは、ユニットとしての攻撃・防御は行えない）</span>`, 'important');
                        s.stance = null; 
                        updateUI();
                        return;
                    }
                }

                if (s.card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる')) {"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
