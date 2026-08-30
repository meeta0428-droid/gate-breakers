import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()


old_block = """        // 予測防壁の効果：攻撃に使用されたカードが「公開状態」だった場合、ダメージを無効化
        let yosokuTriggered = false;
        if (els.chkAttackFromOpen && els.chkAttackFromOpen.checked) {
            if (currentCombo.some(c => c.name === '予測防壁')) {
                actualDmg = 0;
                yosokuTriggered = true;
            }
        }

        const cardStr = currentCombo.length > 0 ? `使用カード:<br>${cardLogs}<br>` : 'カード使用なし<br>';
        const yosokuMsg = yosokuTriggered ? `<br><span style="color:#00ffff; font-weight:bold;">【予測防壁】攻撃元が公開状態だったため、ダメージを完全に無効化！</span>` : '';
        const nohmMsg = nohmBlocked ? `<br><span style="color:#00ffff; font-weight:bold;">【ノーム】ユニットを廃棄し、ダメージを無効化（阻止）した！</span>` : '';
        const additionalMsg = yosokuMsg + nohmMsg;"""


new_block = """        // 予測防壁の効果：攻撃に使用されたカードが「公開状態」だった場合、ダメージを無効化
        let yosokuTriggered = false;
        if (els.chkAttackFromOpen && els.chkAttackFromOpen.checked) {
            if (currentCombo.some(c => c.name === '予測防壁')) {
                actualDmg = 0;
                yosokuTriggered = true;
            }
        }
        
        // マナカウンターの効果：ダメージを0にし、相手のコンボ枚数分の反射ダメージを与える
        let manaCounterTriggered = false;
        let counterDamage = 0;
        if (currentCombo.some(c => c.name === '『マナカウンター』')) {
            actualDmg = 0;
            manaCounterTriggered = true;
            const enemyComboCount = prompt("【『マナカウンター』効果】\\n相手がこの攻撃で繋げた「コンボ枚数」を入力してください。\\n（※その数値がそのまま相手への反射ダメージになります）", "0");
            if (enemyComboCount && !isNaN(enemyComboCount)) {
                counterDamage = parseInt(enemyComboCount);
            }
        }

        const cardStr = currentCombo.length > 0 ? `使用カード:<br>${cardLogs}<br>` : 'カード使用なし<br>';
        const yosokuMsg = yosokuTriggered ? `<br><span style="color:#00ffff; font-weight:bold;">【予測防壁】攻撃元が公開状態だったため、ダメージを完全に無効化！</span>` : '';
        const nohmMsg = nohmBlocked ? `<br><span style="color:#00ffff; font-weight:bold;">【ノーム】ユニットを廃棄し、ダメージを無効化（阻止）した！</span>` : '';
        const manaCounterMsg = manaCounterTriggered ? `<br><span style="color:#ffcc00; font-weight:bold;">【『マナカウンター』】ダメージを完全に無効化（0にする）！<br>さらに、相手に「${counterDamage}点」のカウンターダメージを反射！</span>` : '';
        const additionalMsg = yosokuMsg + nohmMsg + manaCounterMsg;"""
content = content.replace(old_block, new_block)

# HP減算処理（敵HPがある場合）
old_hp = """        if (actualDmg === 0) {
            // 流し斬りチェックはすべての軽減適用後に行うため、ここでは判定しない
        }"""

new_hp = """        if (actualDmg === 0) {
            // 流し斬りチェックはすべての軽減適用後に行うため、ここでは判定しない
        }
        
        if (manaCounterTriggered && counterDamage > 0) {
            enemyHp -= counterDamage;
        }"""
content = content.replace(old_hp, new_hp)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
