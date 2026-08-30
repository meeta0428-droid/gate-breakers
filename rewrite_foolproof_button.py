import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. cloneNode を元に戻す
old_clone = "btnTriggerPassive: (function(){ const b = document.getElementById('btn-trigger-passive'); const clone = b.cloneNode(true); b.parentNode.replaceChild(clone, b); return clone; })(),"
new_clone = "btnTriggerPassive: document.getElementById('btn-trigger-passive'),"
content = content.replace(old_clone, new_clone)

# 2. openCardModal 内の onclick 設定を強力な setAttribute に変更する
old_onclick = "                els.btnTriggerPassive.onclick = () => { triggerPassiveEffect(card, index); };"
new_onclick = """                window.currentPassiveCard = card;
                window.currentPassiveIndex = index;
                window.triggerCurrentPassive = function() {
                    if (window.triggerPassiveEffect) {
                        window.triggerPassiveEffect(window.currentPassiveCard, window.currentPassiveIndex);
                    } else {
                        alert('エラー：発動関数が見つかりません。');
                    }
                };
                els.btnTriggerPassive.setAttribute('onclick', 'window.triggerCurrentPassive()');"""
content = content.replace(old_onclick, new_onclick)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete. Check:", content != open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r').read())
