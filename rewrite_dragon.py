import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 被ダメージ処理（身代わり）
old_sacrifice = """                cDiv.querySelector('button').addEventListener('click', () => {
                    const dmgToTake = pendingDamage;
                    const endurance = s.card.cost;
                    
                    if (s.card.name === '彷徨う砂塵霊') {"""

new_sacrifice = """                cDiv.querySelector('button').addEventListener('click', () => {
                    let dmgToTake = pendingDamage;
                    let endurance = s.card.cost;
                    
                    if (s.card.name === '古の屍竜') {
                        const isFlesh = confirm("【古の屍竜】の特殊効果について確認します。\\nこの攻撃によるダメージは「肉体カテゴリー」によるものですか？\\n（※「OK」を押すと、自身に対するダメージを3点軽減して判定します）");
                        if (isFlesh) {
                            dmgToTake = Math.max(0, dmgToTake - 3);
                            logMsg(`【古の屍竜の効果】「肉体カテゴリー」のダメージを3点軽減！（${pendingDamage} → ${dmgToTake}）`, 'important');
                        }
                    }
                    
                    if (s.card.name === '彷徨う砂塵霊') {"""

content = content.replace(old_sacrifice, new_sacrifice)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
