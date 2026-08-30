import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/game_logic_v9.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """        for (const card of this.deck.void) {
            checkPersistentBuff(card, true);
        }
        
        // 手動調整値（影縫い等の効果）
        total += (this.initiativeModifier || 0);"""

new_logic = """        for (const card of this.deck.void) {
            checkPersistentBuff(card, true);
        }
        
        // 召喚ユニットからのイニシアチブ
        if (this.deck.summons) {
            for (const s of this.deck.summons) {
                const card = s.card;
                const matchPlus = card.effect.match(/イニシアチブ\s*[＋\+]\s*([0-9０-９]+)/);
                if (matchPlus) total += parseFullWidthInt(matchPlus[1]);
                
                const matchMinus = card.effect.match(/イニシアチブ\s*[\-ー\-－]\s*([0-9０-９]+)/);
                if (matchMinus) total -= parseFullWidthInt(matchMinus[1]);
            }
        }
        
        // 手動調整値（影縫い等の効果）
        total += (this.initiativeModifier || 0);"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/game_logic_v9.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
