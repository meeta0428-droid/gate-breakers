# -*- coding: utf-8 -*-
with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "『アポクリファ』：ユニットを召喚" in line:
        # found the block. Let's rewrite the onSelect entirely to be safe
        for j in range(i, i+20):
            if "onSelect: (selectedCard) => {" in lines[j]:
                start_idx = j
                end_idx = j
                # find the end of onSelect block
                brace_count = 0
                for k in range(j, j+50):
                    brace_count += lines[k].count('{')
                    brace_count -= lines[k].count('}')
                    if brace_count == 0 and k > j:
                        end_idx = k
                        break
                
                # Replace the whole block
                new_onSelect = [
                    "                            onSelect: (selectedCard) => {\n",
                    "                                if (!canSummonCard(selectedCard, player)) return;\n",
                    "                                // 召喚時のスタンス判定\n",
                    "                                let initStance = 'attack'; // デフォルトは攻撃\n",
                    "                                if (selectedCard.effect.includes('召喚・防')) {\n",
                    "                                    initStance = 'defend';\n",
                    "                                } else if (selectedCard.effect.includes('召喚・攻') || selectedCard.effect.includes('召喚　攻') || selectedCard.effect.includes('召喚 攻')) {\n",
                    "                                    initStance = 'attack';\n",
                    "                                }\n",
                    "                                if (selectedCard.effect.includes('1ターンの間に攻撃と防御を1回ずつ行うことができる')) {\n",
                    "                                    initStance = 'both';\n",
                    "                                }\n",
                    "                                \n",
                    "                                player.deck.summons.push({ card: selectedCard, stance: initStance });\n",
                    "                                logMsg(`【『アポクリファ』効果発動】<br><span style=\"color:#00ffff; font-weight:bold;\">データベースから「${selectedCard.name}」を指定して召喚した！</span>`, 'important');\n",
                    "                                updateUI();\n",
                    "                            }\n"
                ]
                lines = lines[:start_idx] + new_onSelect + lines[end_idx+1:]
                break
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print("Fixed Apocrypha")
