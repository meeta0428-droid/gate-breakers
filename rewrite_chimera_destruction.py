import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 犠牲（身代わり）処理での破壊
old_destruct = """                        if (s.card.name === 'シルフ') {
                            player.deck.hand.push(s.card);
                            logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、<span style="color:#00ffff; font-weight:bold;">手札に戻った！</span>（残り: ${pendingDamage}）`, 'damage');
                        } else if (s.card.name === 'フリップサイド・ヒュドラ') {
                            const doRegen = confirm(`【フリップサイド・ヒュドラ】が破壊されました。\n②『超再生』を発動しますか？\n（※OKを押すと、ヒュドラは廃棄札ではなく山札の一番上に戻ります。捨札からコスト合計8になるよう手動でカードを廃棄してください）`);
                            if (doRegen) {
                                player.deck.deck.unshift(s.card);
                                logMsg(`「${s.card.name}」が破壊されたが、<span style="color:#00ffff; font-weight:bold;">『超再生』により山札の一番上に戻った！</span><br>（※捨札からコスト8分を手動で廃棄してください）`, 'important');
                            } else {
                                player.deck.void.push(s.card);
                                logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                            }
                        } else {
                            player.deck.void.push(s.card);
                            logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                        }"""

new_destruct = """                        if (s.card.isChimera) {
                            if (s.card.originalCards) {
                                s.card.originalCards.forEach(c => player.deck.void.push(c));
                            }
                            logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、<span style="color:#00ffff; font-weight:bold;">素材となったカード全てが廃棄札に移動した！</span>（残り: ${pendingDamage}）`, 'damage');
                        } else if (s.card.name === 'シルフ') {
                            player.deck.hand.push(s.card);
                            logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、<span style="color:#00ffff; font-weight:bold;">手札に戻った！</span>（残り: ${pendingDamage}）`, 'damage');
                        } else if (s.card.name === 'フリップサイド・ヒュドラ') {
                            const doRegen = confirm(`【フリップサイド・ヒュドラ】が破壊されました。\n②『超再生』を発動しますか？\n（※OKを押すと、ヒュドラは廃棄札ではなく山札の一番上に戻ります。捨札からコスト合計8になるよう手動でカードを廃棄してください）`);
                            if (doRegen) {
                                player.deck.deck.unshift(s.card);
                                logMsg(`「${s.card.name}」が破壊されたが、<span style="color:#00ffff; font-weight:bold;">『超再生』により山札の一番上に戻った！</span><br>（※捨札からコスト8分を手動で廃棄してください）`, 'important');
                            } else {
                                player.deck.void.push(s.card);
                                logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                            }
                        } else {
                            player.deck.void.push(s.card);
                            logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                        }"""
content = content.replace(old_destruct, new_destruct)


# 2. 手動廃棄処理
old_dismiss = """            sDiv.querySelector('.summon-btn-dismiss').addEventListener('click', () => {
                if (confirm(`${s.card.name} を廃棄札へ移動してよろしいですか？\n（※「廃棄札に移動することで〜」等の効果を発動する場合に使用します）`)) {
                    player.deck.summons.splice(idx, 1);
                    player.deck.void.push(s.card);
                    let effectText = s.card.effect;"""

new_dismiss = """            sDiv.querySelector('.summon-btn-dismiss').addEventListener('click', () => {
                if (confirm(`${s.card.name} を廃棄札へ移動してよろしいですか？\n（※「廃棄札に移動することで〜」等の効果を発動する場合に使用します）`)) {
                    player.deck.summons.splice(idx, 1);
                    
                    if (s.card.isChimera && s.card.originalCards) {
                        s.card.originalCards.forEach(c => player.deck.void.push(c));
                    } else {
                        player.deck.void.push(s.card);
                    }
                    
                    let effectText = s.card.effect;"""
content = content.replace(old_dismiss, new_dismiss)


with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement check (destruct/dismiss):", content != open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r').read())
