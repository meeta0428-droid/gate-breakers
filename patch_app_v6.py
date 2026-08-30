import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# エルダースタッグのダイアログ削除
old_stag = """        // エルダースタッグの廃棄・半減チェック
        let stagHalved = false;
        const stagIdx = player.deck.summons.findIndex(s => s.card.name === 'エルダースタッグ');
        if (stagIdx > -1 && !nohmBlocked) { // ノームで無効化済みの場合は聞かない
            const doStagHalf = confirm(`【エルダースタッグ】が場にいます。\\nエルダースタッグを廃棄して、受ける合計ダメージを「半減」しますか？\\n（※OKを押すと廃棄札に移動し、計算後の最終ダメージが半分(端数切り上げ)になります）`);
            if (doStagHalf) {
                const stagCard = player.deck.summons[stagIdx].card;
                player.deck.summons.splice(stagIdx, 1);
                player.deck.void.push(stagCard);
                stagHalved = true;
            }
        }"""
new_stag = """        // エルダースタッグの廃棄・半減チェックは card_effects_v5.js のフックで行う"""
content = content.replace(old_stag, new_stag)

# actualDmg 半減削除
old_half = """        if (stagHalved) {
            actualDmg = Math.ceil(actualDmg / 2);
        }"""
new_half = """"""
content = content.replace(old_half, new_half)

# logMsg 削除
old_msg = """        const stagMsg = stagHalved ? `<br><span style="color:#00ffff; font-weight:bold;">【エルダースタッグ】ユニットを廃棄し、受けるダメージを半減した！</span>` : '';
        const additionalMsg = yosokuMsg + nohmMsg + stagMsg;"""
new_msg = """        const additionalMsg = yosokuMsg + nohmMsg;"""
content = content.replace(old_msg, new_msg)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("app_v6.js update done.")
