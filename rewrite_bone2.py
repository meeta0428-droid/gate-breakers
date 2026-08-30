import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """        player.deck.summons.forEach(s => {
            if (s.stance === 'defend' || s.stance === 'both') {
                const match = s.card.effect.match(/攻(\\d+)\\s*[／/]\\s*(?:防)?(\\d+)/);
                if (match) {
                    const defVal = parseInt(match[2]);
                    summonDef += defVal;
                    summonLog += `・召喚「${s.card.name}」の防御 (軽減 ${defVal})<br>`;
                }
            }"""

new_logic = """        player.deck.summons.forEach(s => {
            if (s.stance === 'defend' || s.stance === 'both') {
                const match = s.card.effect.match(/攻(\\d+)\\s*[／/]\\s*(?:防)?(\\d+)/);
                if (match) {
                    let defVal = parseInt(match[2]);
                    
                    if (s.card.name === '骸鎧の暴君') {
                        const isCost4Over = confirm("【骸鎧の暴君】の特殊効果について確認します。\\n相手が使用したカードの中に「コスト4以上」のカードはありましたか？\\n（※「キャンセル/いいえ」を押すと、防＋5が適用され合計8軽減になります）");
                        if (!isCost4Over) {
                            defVal += 5;
                            summonLog += `・召喚「${s.card.name}」の防御 (軽減 ${defVal}) <span style="color:#00ffff; font-size:0.8rem;">※特殊効果 ＋5適用</span><br>`;
                        } else {
                            summonLog += `・召喚「${s.card.name}」の防御 (軽減 ${defVal}) <span style="color:#ff5252; font-size:0.8rem;">※特殊効果は無効化された</span><br>`;
                        }
                        summonDef += defVal;
                    } else {
                        summonDef += defVal;
                        summonLog += `・召喚「${s.card.name}」の防御 (軽減 ${defVal})<br>`;
                    }
                }
            }"""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
