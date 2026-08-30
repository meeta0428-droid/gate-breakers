import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_dismiss = """                        if (s.card.name === 'ベヒーモス') {
                            effectText = `<span style="color:#ffcc00; font-weight:bold;">※任意の対象全員に対して、それぞれ「6点」のダメージ！</span><br>` + effectText;
                        }
                        logMsg(`召喚ユニット「${s.card.name}」を廃棄札へ移動しました！<br><span style="color:#aaa; font-size:0.8rem;">【効果】${effectText}</span>`, 'important');"""

new_dismiss = """                        if (s.card.name === 'ベヒーモス') {
                            effectText = `<span style="color:#ffcc00; font-weight:bold;">※任意の対象全員に対して、それぞれ「6点」のダメージ！</span><br>` + effectText;
                        }
                        if (s.card.name === 'フロストシェル') {
                            effectText = `<span style="color:#00ffff; font-weight:bold;">※このラウンド中、自身または味方が受ける「知性」カテゴリーのダメージをすべて「0」にする！</span><br>` + effectText;
                        }
                        logMsg(`召喚ユニット「${s.card.name}」を廃棄札へ移動しました！<br><span style="color:#aaa; font-size:0.8rem;">【効果】${effectText}</span>`, 'important');"""

content = content.replace(old_dismiss, new_dismiss)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
