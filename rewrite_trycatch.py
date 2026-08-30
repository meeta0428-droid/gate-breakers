import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_trigger = "window.triggerPassiveEffect = function(passiveCard, originalIdx) {"
new_trigger = """window.triggerPassiveEffect = function(passiveCard, originalIdx) {
    try {"""

old_end = "function openCardModal(card, index, isPassive = false, isCombo = false, isPsychometry = false) {"
new_end = """    } catch (e) {
        alert("エラーが発生しました: " + e.message);
    }
}
function openCardModal(card, index, isPassive = false, isCombo = false, isPsychometry = false) {"""

content = content.replace(old_trigger, new_trigger)
content = content.replace(old_end, new_end)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
