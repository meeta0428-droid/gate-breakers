with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add to els
content = content.replace(
    "chkAttackFromOpen: document.getElementById('chk-attack-from-open'),",
    "chkAttackFromOpen: document.getElementById('chk-attack-from-open'),\n    chkMultiAttack: document.getElementById('chk-multi-attack'),"
)

# Insert logic in processReaction
insert_code = """
        if (actualDmg > 0) {
            if (els.chkMultiAttack && els.chkMultiAttack.checked) {
                logMsg(`<span style="color:#ffcc00; font-weight:bold;">【複数攻撃】プレイヤーとすべての召喚ユニットに ${actualDmg} 点のダメージ！</span>`, 'damage');
                
                const summonsToDestroy = [];
                player.deck.summons.forEach((s) => {
                    let dmgToTake = actualDmg;
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
                
                els.chkMultiAttack.checked = false; // Reset
            }

            pendingDamage = actualDmg;
            updateDamageModalUI();
            els.damageModal.classList.remove('hidden');
        } else if (hookContext.pendingDamage <= 0 && actualDmg <= 0) {
"""

content = content.replace(
    """        if (actualDmg > 0) {
            pendingDamage = actualDmg;
            updateDamageModalUI();
            els.damageModal.classList.remove('hidden');
        } else if (hookContext.pendingDamage <= 0 && actualDmg <= 0) {""",
    insert_code.lstrip('\n')
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
