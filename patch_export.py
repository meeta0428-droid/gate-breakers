import re

with open('app_v6.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Find the doExport function
# It has: exportText += '手札上限: ' + player.maxHandSize + '枚\n';
# Let's add the profile to the exportText after the deck list.

export_addition = """
                if (player.profile) {
                    exportText += '\\n【キャラクター設定】\\n';
                    if (player.profile.name) exportText += '名前: ' + player.profile.name + '\\n';
                    if (player.profile.gender) exportText += '性別: ' + player.profile.gender + '\\n';
                    if (player.profile.age) exportText += '年齢: ' + player.profile.age + '\\n';
                    if (player.profile.important) exportText += '大事なもの: ' + player.profile.important + '\\n';
                    if (player.profile.dislike) exportText += '嫌いなもの: ' + player.profile.dislike + '\\n';
                    if (player.profile.appearance) exportText += '身長・体重・外見: ' + player.profile.appearance + '\\n';
                    if (player.profile.memo) exportText += 'メモ: ' + player.profile.memo + '\\n';
                    
                    for (let i = 1; i <= 10; i++) {
                        if (player.profile['q' + i]) {
                            exportText += 'Q' + i + ': ' + player.profile['q' + i] + '\\n';
                        }
                    }
                }
"""

js = js.replace(
    "// クリップボードコピー（フォールバック付き）",
    export_addition + "                // クリップボードコピー（フォールバック付き）"
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(js)

