import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()


# 1. 発動可能なパッシブ判定への追加
old_passive = """            // 発動可能なパッシブ効果の判定
            if (els.btnTriggerPassive) {
                if (card.name === '錬金術師') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '『アポクリファ』') {"""

new_passive = """            // 発動可能なパッシブ効果の判定
            if (els.btnTriggerPassive) {
                if (card.name === '錬金術師') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '『ブーステッド』') {
                    els.btnTriggerPassive.innerText = '効果を発動（能力値+2）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '『アポクリファ』') {"""
content = content.replace(old_passive, new_passive)


# 2. 発動時の処理
old_trigger = """            // 『アポクリファ』
            if (card.name === '『アポクリファ』') {"""

new_trigger = """            // 『ブーステッド』
            if (card.name === '『ブーステッド』') {
                if (card.boostApplied) {
                    alert('すでに能力値の強化が適用されています。');
                    return;
                }
                const targetStat = prompt('『ブーステッド』の効果で最大値を+2する能力値を入力してください。\\n「肉体」「知性」「精神」のいずれかを入力してください。');
                if (!targetStat) return;
                
                let statKey = null;
                if (targetStat.includes('肉体')) statKey = 'body';
                else if (targetStat.includes('知性')) statKey = 'int';
                else if (targetStat.includes('精神')) statKey = 'men';
                
                if (statKey) {
                    player.stats[statKey].maxVal += 2;
                    player.stats[statKey].currentVal += 2;
                    card.boostApplied = true;
                    
                    const statName = statKey === 'body' ? '肉体' : statKey === 'int' ? '知性' : '精神';
                    logMsg(`【『ブーステッド』の効果発動！】<br><span style="color:#ffcc00; font-weight:bold;">${statName}の最大値が「+2」されました！</span><br><span style="color:#aaa; font-size:0.8rem;">（※以降、メビウス専用カードが使用可能になります。通常カードはコスト3以下しか使用できなくなるため、自己管理をお願いします）</span>`, 'important');
                    els.cardDetailModal.classList.add('hidden');
                    updateUI();
                } else {
                    alert('正しい能力値を入力してください。');
                }
                return;
            }
            
            // 『アポクリファ』
            if (card.name === '『アポクリファ』') {"""
content = content.replace(old_trigger, new_trigger)


with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
