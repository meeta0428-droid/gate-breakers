import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_source_check = """        else if (source === 'mountain') sourceArray = playerObj.deck.mountain;
        else if (source === 'void_or_discard') sourceArray = [...playerObj.deck.void, ...playerObj.deck.discard];
        else sourceArray = playerObj.deck.discard;"""
new_source_check = """        else if (source === 'mountain') sourceArray = playerObj.deck.mountain;
        else if (source === 'void_or_discard') sourceArray = [...playerObj.deck.void, ...playerObj.deck.discard];
        else if (source === 'hand_or_discard') sourceArray = [...playerObj.deck.hand, ...playerObj.deck.discard];
        else sourceArray = playerObj.deck.discard;"""
content = content.replace(old_source_check, new_source_check)

old_source_splice = """                    if (source === 'void_or_discard') {
                        const vIdx = playerObj.deck.void.lastIndexOf(card);
                        if (vIdx > -1) {
                            playerObj.deck.void.splice(vIdx, 1);
                        } else {
                            const dIdx = playerObj.deck.discard.lastIndexOf(card);
                            if (dIdx > -1) playerObj.deck.discard.splice(dIdx, 1);
                        }
                    } else {"""
new_source_splice = """                    if (source === 'void_or_discard') {
                        const vIdx = playerObj.deck.void.lastIndexOf(card);
                        if (vIdx > -1) {
                            playerObj.deck.void.splice(vIdx, 1);
                        } else {
                            const dIdx = playerObj.deck.discard.lastIndexOf(card);
                            if (dIdx > -1) playerObj.deck.discard.splice(dIdx, 1);
                        }
                    } else if (source === 'hand_or_discard') {
                        const hIdx = playerObj.deck.hand.lastIndexOf(card);
                        if (hIdx > -1) {
                            playerObj.deck.hand.splice(hIdx, 1);
                        } else {
                            const dIdx = playerObj.deck.discard.lastIndexOf(card);
                            if (dIdx > -1) playerObj.deck.discard.splice(dIdx, 1);
                        }
                    } else {"""
content = content.replace(old_source_splice, new_source_splice)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
