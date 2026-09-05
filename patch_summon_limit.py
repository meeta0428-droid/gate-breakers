# -*- coding: utf-8 -*-
with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

can_summon_func = """
function canSummonCard(card, player) {
    let statVal = 0;
    let statName = "";
    if (card.category.includes('肉体')) {
        statVal = player.stats.body.maxVal;
        statName = "肉体";
    } else if (card.category.includes('知性')) {
        statVal = player.stats.int.maxVal;
        statName = "知性";
    } else if (card.category.includes('精神')) {
        statVal = player.stats.men.maxVal;
        statName = "精神";
    } else {
        const body = player.stats.body.maxVal;
        const intVal = player.stats.int.maxVal;
        const men = player.stats.men.maxVal;
        statVal = Math.max(body, intVal, men);
        if (statVal === body) statName = "最も高い能力値(肉体)";
        else if (statVal === intVal) statName = "最も高い能力値(知性)";
        else statName = "最も高い能力値(精神)";
    }
    
    const limit = statVal + player.level;
    if (card.cost > limit) {
        alert(`【召喚不可】\\n召喚ユニット「${card.name}」のコスト(${card.cost})が、指定能力値[${statName}]＋レベル(${limit})を超えているため召喚できません。`);
        return false;
    }
    return true;
}
"""

for i, line in enumerate(lines):
    if "els.btnUseCard.addEventListener('click', () => {" in line:
        # Insert the function just before
        lines.insert(i, can_summon_func)
        break

# Find the place to insert the check inside btnUseCard
for i, line in enumerate(lines):
    if "if (selectedCardSource === 'psychometry')" in line and "player.deck.mountain.splice" in lines[i+1]:
        # Insert the summon check before splicing
        check_code = """
            // 召喚コストチェック
            if (card.category.includes('召喚') || card.effect.includes('召喚・攻') || card.effect.includes('召喚　攻') || card.effect.includes('召喚 攻')) {
                if (!canSummonCard(card, player)) {
                    return;
                }
            }
"""
        lines.insert(i, check_code)
        break

# Now for Familiar
for i, line in enumerate(lines):
    if "logMsg(`【ファミリア】効果発動！山札から" in line:
        check_code2 = """
                                if (!canSummonCard(selectedCard, player)) {
                                    return;
                                }
"""
        lines.insert(i - 1, check_code2)
        break

# Now for Apocrypha
for i, line in enumerate(lines):
    if "logMsg(`【『アポクリファ』効果発動】<br><span style=" in line:
        check_code3 = """
                                if (!canSummonCard(selectedCard, player)) {
                                    return;
                                }
"""
        lines.insert(i - 4, check_code3) # Insert before "if (selectedCard.effect.includes('召喚・防')) {"
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print("Patched app_v6.js")
