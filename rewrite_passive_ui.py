import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. パッシブの描画部分の変更（グループ化を廃止し、1枚ずつ独立して描画＆無効化チェックボックス追加）
old_passive_ui = """    els.passiveArea.innerHTML = '';
    if (player.deck.passives.length > 0) {
        const groupedPassives = {};
        player.deck.passives.forEach((card, originalIdx) => {
            if (!groupedPassives[card.name]) {
                groupedPassives[card.name] = { 
                    card: card,
                    name: card.name,
                    strength: card.strength,
                    count: 1,
                    noDuplicate: card.effect.includes('重複しない'),
                    originalIdx: originalIdx
                };
            } else {
                if (!groupedPassives[card.name].noDuplicate) {
                    groupedPassives[card.name].strength += card.strength;
                }
                groupedPassives[card.name].count++;
            }
        });

        Object.values(groupedPassives).forEach(group => {
            const pDiv = document.createElement('div');
            pDiv.className = 'passive-card';
            // 重複しないカードで複数枚ある場合はカウントだけ表示するか、あるいは強度だけ固定にする
            pDiv.innerHTML = `<strong>${group.name}${group.count > 1 ? ` x${group.count}` : ''}</strong> (強度+${group.strength})`;
            pDiv.addEventListener('click', () => {
                openCardModal(group.card, group.originalIdx, true); // isPassive = true
            });
            els.passiveArea.appendChild(pDiv);
        });
    } else {
        els.passiveArea.innerHTML = '<span style="color:#555; font-size:0.75rem;">なし</span>';
    }"""

new_passive_ui = """    els.passiveArea.innerHTML = '';
    if (player.deck.passives.length > 0) {
        player.deck.passives.forEach((card, originalIdx) => {
            const pDiv = document.createElement('div');
            pDiv.className = 'passive-card';
            if (card.isDisabled) pDiv.classList.add('disabled-passive');
            
            pDiv.innerHTML = `
                <div class="passive-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="passive-name" style="cursor:pointer;">
                        <strong>${card.name}</strong> ${card.isDisabled ? '<span style="color:#ff5252; font-size:0.7rem;">[無効]</span>' : `(強度+${card.strength || 0})`}
                    </div>
                    <label style="font-size:0.7rem; color:#aaa; margin-left:10px;" onclick="event.stopPropagation();">
                        <input type="checkbox" class="passive-disable-chk" ${card.isDisabled ? 'checked' : ''}> 裏返し
                    </label>
                </div>
            `;
            
            pDiv.querySelector('.passive-name').addEventListener('click', () => {
                openCardModal(card, originalIdx, true); // isPassive = true
            });
            
            pDiv.querySelector('.passive-disable-chk').addEventListener('change', (e) => {
                card.isDisabled = e.target.checked;
                updateUI();
            });
            
            els.passiveArea.appendChild(pDiv);
        });
    } else {
        els.passiveArea.innerHTML = '<span style="color:#555; font-size:0.75rem;">なし</span>';
    }"""
content = content.replace(old_passive_ui, new_passive_ui)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete (1/3).")
