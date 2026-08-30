import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                if (s.elementalerBuff) {
                    atkVal += 2 * s.elementalerBuff;
                    defVal += 2 * s.elementalerBuff;
                }
                atkVal += honnouBuff + jusoBuff;
                defVal += honnouBuff + jusoBuff;
                atk = atkVal;
                def = defVal;
            }"""

new_logic = """                if (s.elementalerBuff) {
                    atkVal += 2 * s.elementalerBuff;
                    defVal += 2 * s.elementalerBuff;
                }
                atkVal += honnouBuff + jusoBuff;
                defVal += honnouBuff + jusoBuff;
                
                // スプリガンの独自処理（パッシブ強度の合計値を攻防に加算）
                if (s.card.name === 'スプリガン') {
                    const passiveStrSum = player.deck.passives.reduce((sum, p) => sum + (p.strength || 0), 0);
                    atkVal += passiveStrSum;
                    defVal += passiveStrSum;
                }
                
                atk = atkVal;
                def = defVal;
            }"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
