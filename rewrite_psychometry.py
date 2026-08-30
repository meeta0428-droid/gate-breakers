import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. els に追加
old_els = "    handContainer: document.getElementById('hand-container'),"
new_els = """    handContainer: document.getElementById('hand-container'),
    psychometryArea: document.getElementById('psychometry-area'),
    psychometryContainer: document.getElementById('psychometry-container'),"""
content = content.replace(old_els, new_els)

# 2. openCardModal に isPsychometry を追加
old_modal_def = "function openCardModal(card, index, isPassive = false, isCombo = false) {"
new_modal_def = """let selectedCardSource = 'hand'; // 'hand' or 'psychometry'
function openCardModal(card, index, isPassive = false, isCombo = false, isPsychometry = false) {"""
content = content.replace(old_modal_def, new_modal_def)

# selectedCardSource を更新
old_modal_start = """    selectedCardIndex = index;
    els.mTitle.innerText = card.name;"""
new_modal_start = """    selectedCardIndex = index;
    selectedCardSource = isPsychometry ? 'psychometry' : 'hand';
    els.mTitle.innerText = card.name;"""
content = content.replace(old_modal_start, new_modal_start)

# 3. btnUseCard 内で selectedCardSource を見て抜く場所を変える
old_use_start = """    els.btnUseCard.addEventListener('click', () => {
        if (selectedCardIndex !== null) {
            const card = player.deck.hand[selectedCardIndex];"""
new_use_start = """    els.btnUseCard.addEventListener('click', () => {
        if (selectedCardIndex !== null) {
            const card = selectedCardSource === 'psychometry' 
                ? player.deck.mountain[selectedCardIndex] 
                : player.deck.hand[selectedCardIndex];"""
content = content.replace(old_use_start, new_use_start)

old_use_splice = """            player.deck.hand.splice(selectedCardIndex, 1); 
            player.deck.discard.push(card); 
            currentCombo.push(card);"""
new_use_splice = """            if (selectedCardSource === 'psychometry') {
                player.deck.mountain.splice(selectedCardIndex, 1);
            } else {
                player.deck.hand.splice(selectedCardIndex, 1); 
            }
            player.deck.discard.push(card); 
            currentCombo.push(card);"""
content = content.replace(old_use_splice, new_use_splice)


# 4. btnDiscardCard 内でも同様に
old_discard_start = """    const btnDiscard = document.getElementById('btn-discard-card');
    if (btnDiscard) {
        btnDiscard.addEventListener('click', () => {
            if (selectedCardIndex !== null) {
                const card = player.deck.hand[selectedCardIndex];"""
new_discard_start = """    const btnDiscard = document.getElementById('btn-discard-card');
    if (btnDiscard) {
        btnDiscard.addEventListener('click', () => {
            if (selectedCardIndex !== null) {
                const card = selectedCardSource === 'psychometry' 
                    ? player.deck.mountain[selectedCardIndex] 
                    : player.deck.hand[selectedCardIndex];"""
content = content.replace(old_discard_start, new_discard_start)

old_discard_splice = """                player.deck.hand.splice(selectedCardIndex, 1);
                player.deck.discard.push(card);
                logMsg(`手札から「${card.name}」を捨てました。`);"""
new_discard_splice = """                if (selectedCardSource === 'psychometry') {
                    player.deck.mountain.splice(selectedCardIndex, 1);
                    logMsg(`山札から「${card.name}」を捨てました。`);
                } else {
                    player.deck.hand.splice(selectedCardIndex, 1);
                    logMsg(`手札から「${card.name}」を捨てました。`);
                }
                player.deck.discard.push(card);"""
content = content.replace(old_discard_splice, new_discard_splice)


# 5. btnVoidCard 内でも同様に
old_void_start = """    const btnVoid = document.getElementById('btn-void-card');
    if (btnVoid) {
        btnVoid.addEventListener('click', () => {
            if (selectedCardIndex !== null) {
                const card = player.deck.hand[selectedCardIndex];"""
new_void_start = """    const btnVoid = document.getElementById('btn-void-card');
    if (btnVoid) {
        btnVoid.addEventListener('click', () => {
            if (selectedCardIndex !== null) {
                const card = selectedCardSource === 'psychometry' 
                    ? player.deck.mountain[selectedCardIndex] 
                    : player.deck.hand[selectedCardIndex];"""
content = content.replace(old_void_start, new_void_start)

old_void_splice = """                player.deck.hand.splice(selectedCardIndex, 1);
                player.deck.void.push(card);
                logMsg(`手札の「${card.name}」を廃棄札にしました。`);"""
new_void_splice = """                if (selectedCardSource === 'psychometry') {
                    player.deck.mountain.splice(selectedCardIndex, 1);
                    logMsg(`山札の「${card.name}」を廃棄札にしました。`);
                } else {
                    player.deck.hand.splice(selectedCardIndex, 1);
                    logMsg(`手札の「${card.name}」を廃棄札にしました。`);
                }
                player.deck.void.push(card);"""
content = content.replace(old_void_splice, new_void_splice)


# 6. updateUI にサイコメトリーの描画を追加
# 今回は正規表現で置換します。
# els.handContainer.appendChild(cardDiv);\n    });
# の直後にサイコメトリーの描画ロジックを追加。

old_update_ui = """        els.handContainer.appendChild(cardDiv);
    });"""

new_update_ui = """        els.handContainer.appendChild(cardDiv);
    });
    
    // ---------------------------------
    // サイコメトリーの描画
    // ---------------------------------
    const hasPsychometry = player.deck.passives.some(p => p.name === 'サイコメトリー');
    if (els.psychometryArea && els.psychometryContainer) {
        if (hasPsychometry && player.deck.mountain.length > 0) {
            els.psychometryArea.classList.remove('hidden');
            els.psychometryContainer.innerHTML = '';
            
            const maxView = Math.min(3, player.deck.mountain.length);
            for (let i = 0; i < maxView; i++) {
                const card = player.deck.mountain[i];
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';
                cardDiv.style.transform = 'scale(0.9)'; // 少し小さめに
                cardDiv.style.transformOrigin = 'top left';
                cardDiv.innerHTML = `
                    <div class="card-name">${card.name}</div>
                    <div class="card-cat">${card.category}</div>
                    <div class="card-stats"><span>C:${card.cost}</span><span>S:+${card.strength}</span></div>
                    <div class="card-effect">${card.effect}</div>
                `;
                cardDiv.addEventListener('click', () => openCardModal(card, i, false, false, true));
                els.psychometryContainer.appendChild(cardDiv);
            }
        } else {
            els.psychometryArea.classList.add('hidden');
            els.psychometryContainer.innerHTML = '';
        }
    }"""

content = content.replace(old_update_ui, new_update_ui)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
