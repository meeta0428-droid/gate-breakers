import re
with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_block = """
        if (els.chkMultiAttack && els.chkMultiAttack.checked) {
            let baseDmgForSummons = inputDmg;
            if (nohmBlocked || yosokuTriggered || manaCounterTriggered) {
                baseDmgForSummons = 0;
            }
            if (baseDmgForSummons > 0 && player.deck.summons.length > 0) {
                logMsg(`<span style="color:#ffcc00; font-weight:bold;">【複数攻撃】すべての召喚ユニットへの個別ダメージ判定（基本 ${baseDmgForSummons} 点）</span>`, 'important');
                const summonsToDestroy = [];
                player.deck.summons.forEach((s) => {
                    let myDef = (s._tempDefVal || 0) + summonAuraDef;
                    if (ignoreDef) myDef = 0;
                    let dmgToTake = Math.max(0, baseDmgForSummons - myDef);
                    let endurance = s.card.cost;
                    
                    if (s.card.name === '古の屍竜') {
                        logMsg(`【古の屍竜】※肉体カテゴリーの攻撃ならダメージ3点軽減ですが、自動処理ではそのままダメージ計算されます。`, 'important');
                    }
                    if (s.card.name === '彷徨う砂塵霊') {
                        summonsToDestroy.push(s);
                        logMsg(`「${s.card.name}」はダメージを0にして廃棄札へ移動した！`, 'important');
                        return;
                    }
                    
                    if (dmgToTake > endurance) {
                        summonsToDestroy.push(s);
                        logMsg(`「${s.card.name}」はダメージ（${dmgToTake}）に耐えきれず破壊された！`, 'damage');
                    } else {
                        logMsg(`「${s.card.name}」はダメージ（${dmgToTake}）に耐えた！(場に残る)`, 'important');
                    }
                });
                
                summonsToDestroy.forEach(s => {
                    const idx = player.deck.summons.indexOf(s);
                    if (idx > -1) {
                        player.deck.summons.splice(idx, 1);
                        if (s.card.isChimera && s.card.originalCards) {
                            s.card.originalCards.forEach(c => player.deck.void.push(c));
                        } else if (s.card.name === 'シルフ') {
                            player.deck.hand.push(s.card);
                        } else {
                            player.deck.void.push(s.card);
                        }
                        handleSummonVoided(player, s.card);
                    }
                });
            }
            els.chkMultiAttack.checked = false;
        }

        if (actualDmg > 0) {"""

content = re.sub(r'        if\s*\(actualDmg\s*>\s*0\)\s*\{', new_block.lstrip('\n'), content)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
