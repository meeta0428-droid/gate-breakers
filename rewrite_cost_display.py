import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. getDisplayCost の追加
helper_func = """function getDisplayCost(card, playerObj) {
    if (!playerObj || !playerObj.deck) return card.cost;
    let displayCost = card.cost;
    const hasWill = playerObj.deck.passives.some(p => p.name === '魔導杖ウィル');
    if (hasWill && card.category.includes('知性') && card.category.includes('アクション')) {
        displayCost = Math.max(0, displayCost - 1);
    }
    return displayCost;
}

"""

# app_v6.js の先頭に近い関数定義部分（たとえば logMsg の前あたり）に挿入する
content = content.replace("function logMsg(msg, type = '') {", helper_func + "function logMsg(msg, type = '') {")


# 2. updateUI の手札描画部分の修正
old_hand_render = """    player.deck.hand.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-cat">${card.category}</div>
            <div class="card-stats"><span>C:${card.cost}</span><span>S:+${card.strength}</span></div>"""
new_hand_render = """    player.deck.hand.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        const dCost = getDisplayCost(card, player);
        const costColor = dCost < card.cost ? '#ffcc00' : 'inherit';
        cardDiv.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-cat">${card.category}</div>
            <div class="card-stats"><span>C:<span style="color:${costColor}">${dCost}</span></span><span>S:+${card.strength}</span></div>"""
content = content.replace(old_hand_render, new_hand_render)


# 3. updateUI のサイコメトリー描画部分の修正
old_psy_render = """            for (let i = 0; i < maxView; i++) {
                const card = player.deck.mountain[i];
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';
                cardDiv.style.transform = 'scale(0.9)'; // 少し小さめに
                cardDiv.style.transformOrigin = 'top left';
                cardDiv.innerHTML = `
                    <div class="card-name">${card.name}</div>
                    <div class="card-cat">${card.category}</div>
                    <div class="card-stats"><span>C:${card.cost}</span><span>S:+${card.strength}</span></div>"""
new_psy_render = """            for (let i = 0; i < maxView; i++) {
                const card = player.deck.mountain[i];
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';
                cardDiv.style.transform = 'scale(0.9)'; // 少し小さめに
                cardDiv.style.transformOrigin = 'top left';
                const dCost = getDisplayCost(card, player);
                const costColor = dCost < card.cost ? '#ffcc00' : 'inherit';
                cardDiv.innerHTML = `
                    <div class="card-name">${card.name}</div>
                    <div class="card-cat">${card.category}</div>
                    <div class="card-stats"><span>C:<span style="color:${costColor}">${dCost}</span></span><span>S:+${card.strength}</span></div>"""
content = content.replace(old_psy_render, new_psy_render)


# 4. openCardModal 内の表示修正
old_modal_cost = "    els.mCost.innerText = card.cost;"
new_modal_cost = """    const dCost = getDisplayCost(card, player);
    els.mCost.innerText = dCost;
    if (dCost < card.cost) {
        els.mCost.style.color = '#ffcc00';
    } else {
        els.mCost.style.color = 'inherit';
    }"""
content = content.replace(old_modal_cost, new_modal_cost)

# btnUseCard での cost の表示も念の為 getDisplayCost を使う形に（元々は再計算していた）
old_use_cost = """            let displayCost = card.cost;
            const hasWill = player.deck.passives.some(p => p.name === '魔導杖ウィル');
            if (hasWill && card.category.includes('知性') && card.category.includes('アクション')) {
                displayCost = Math.max(0, displayCost - 1);
            }
            
            logMsg(`「${card.name}」（コスト:${displayCost} / 強度:${card.strength || 0}）を場に出した！`);
            if (hasWill && card.category.includes('知性') && card.category.includes('アクション')) {
                logMsg(`<span style="color:#ffcc00; font-size:0.8rem;">※【魔導杖ウィル】効果でコスト-1</span>`);
            }"""
new_use_cost = """            const displayCost = getDisplayCost(card, player);
            logMsg(`「${card.name}」（コスト:${displayCost} / 強度:${card.strength || 0}）を場に出した！`);
            if (displayCost < card.cost) {
                logMsg(`<span style="color:#ffcc00; font-size:0.8rem;">※効果によりコストが軽減されています</span>`);
            }"""
content = content.replace(old_use_cost, new_use_cost)


with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
