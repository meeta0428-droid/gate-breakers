import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_log_msg = """            player.deck.hand.splice(selectedCardIndex, 1); 
            player.deck.discard.push(card); 
            currentCombo.push(card);
            logMsg(`「${card.name}」（コスト:${card.cost} / 強度:${card.strength || 0}）を場に出した！`);"""
new_log_msg = """            player.deck.hand.splice(selectedCardIndex, 1); 
            player.deck.discard.push(card); 
            currentCombo.push(card);
            
            let displayCost = card.cost;
            const hasWill = player.deck.passives.some(p => p.name === '魔導杖ウィル');
            if (hasWill && card.category.includes('知性') && card.category.includes('アクション')) {
                displayCost = Math.max(0, displayCost - 1);
            }
            
            logMsg(`「${card.name}」（コスト:${displayCost} / 強度:${card.strength || 0}）を場に出した！`);
            if (hasWill && card.category.includes('知性') && card.category.includes('アクション')) {
                logMsg(`<span style="color:#ffcc00; font-size:0.8rem;">※【魔導杖ウィル】効果でコスト-1</span>`);
            }"""

content = content.replace(old_log_msg, new_log_msg)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
