# -*- coding: utf-8 -*-
with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_func = """
function canSummonCard(card, player) {
    let statVal = 0;
    let statName = "";
    
    // 指定能力値はプレイヤーの最も高い能力値を使用する
    const body = player.stats.body.maxVal;
    const intVal = player.stats.int.maxVal;
    const men = player.stats.men.maxVal;
    statVal = Math.max(body, intVal, men);
    
    if (statVal === body) statName = "最も高い能力値(肉体)";
    else if (statVal === intVal) statName = "最も高い能力値(知性)";
    else statName = "最も高い能力値(精神)";

    // 既に場に出ている召喚ユニットのコスト合計
    let currentSummonCost = 0;
    player.deck.summons.forEach(s => {
        currentSummonCost += s.card.cost;
    });

    // 発動中のコンボ（これから召喚される予定のカード）のコストも加算
    if (typeof currentCombo !== 'undefined') {
        currentCombo.forEach(c => {
            if (c.category.includes('召喚') || c.effect.includes('召喚・攻') || c.effect.includes('召喚　攻') || c.effect.includes('召喚 攻')) {
                currentSummonCost += c.cost;
            }
        });
    }

    const limit = statVal + player.level;
    const totalCost = currentSummonCost + card.cost;

    if (totalCost > limit) {
        alert(`【召喚不可】\\n召喚ユニットの合計コスト(${totalCost})が、指定能力値[${statName}]＋レベル(${limit})を超えてしまうため、「${card.name}」を召喚できません。\\n（※現在の盤面・発動待機の合計コスト: ${currentSummonCost} / 追加コスト: ${card.cost}）`);
        return false;
    }
    return true;
}
"""

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "function canSummonCard(card, player) {" in line:
        start_idx = i
        brace_count = 0
        for j in range(i, i+50):
            brace_count += lines[j].count('{')
            brace_count -= lines[j].count('}')
            if brace_count == 0 and j > i:
                end_idx = j
                break
        break

if start_idx != -1 and end_idx != -1:
    lines = lines[:start_idx] + [new_func] + lines[end_idx+1:]
else:
    print("Could not find canSummonCard function")

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print("Patched canSummonCard for total cost")
