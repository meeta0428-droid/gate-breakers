import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """    function processReaction(inputDmg, ignoreDef = false) {
        // ノームの廃棄・無効化チェック
        let nohmBlocked = false;
        const nohmIdx = player.deck.summons.findIndex(s => s.card.name === 'ノーム');
        if (nohmIdx > -1) {
            const doNohmBlock = confirm(`【ノーム】が場にいます。\nノームを廃棄して、今回の攻撃を阻止（ダメージ無効化）しますか？\n（※OKを押すとノームが廃棄され、最終ダメージが0になります）`);
            if (doNohmBlock) {
                const nohmCard = player.deck.summons[nohmIdx].card;
                player.deck.summons.splice(nohmIdx, 1);
                player.deck.void.push(nohmCard);
                nohmBlocked = true;
            }
        }"""

new_logic = """    function processReaction(inputDmg, ignoreDef = false) {
        // ノームの廃棄・無効化チェック
        let nohmBlocked = false;
        const nohmIdx = player.deck.summons.findIndex(s => s.card.name === 'ノーム');
        if (nohmIdx > -1) {
            const doNohmBlock = confirm(`【ノーム】が場にいます。\nノームを廃棄して、今回の攻撃を阻止（ダメージ無効化）しますか？\n（※OKを押すとノームが廃棄され、最終ダメージが0になります）`);
            if (doNohmBlock) {
                const nohmCard = player.deck.summons[nohmIdx].card;
                player.deck.summons.splice(nohmIdx, 1);
                player.deck.void.push(nohmCard);
                nohmBlocked = true;
            }
        }
        
        // エルダースタッグの廃棄・半減チェック
        let stagHalved = false;
        const stagIdx = player.deck.summons.findIndex(s => s.card.name === 'エルダースタッグ');
        if (stagIdx > -1 && !nohmBlocked) { // ノームで無効化済みの場合は聞かない
            const doStagHalf = confirm(`【エルダースタッグ】が場にいます。\nエルダースタッグを廃棄して、受ける合計ダメージを「半減」しますか？\n（※OKを押すと廃棄札に移動し、計算後の最終ダメージが半分(端数切り上げ)になります）`);
            if (doStagHalf) {
                const stagCard = player.deck.summons[stagIdx].card;
                player.deck.summons.splice(stagIdx, 1);
                player.deck.void.push(stagCard);
                stagHalved = true;
            }
        }"""

content = content.replace(old_logic, new_logic)


old_logic2 = """        if (nohmBlocked) {
            actualDmg = 0;
        }"""

new_logic2 = """        if (nohmBlocked) {
            actualDmg = 0;
        }
        
        if (stagHalved) {
            actualDmg = Math.ceil(actualDmg / 2);
        }"""

content = content.replace(old_logic2, new_logic2)


old_logic3 = """        const yosokuMsg = yosokuTriggered ? `<br><span style="color:#00ffff; font-weight:bold;">【予測防壁】攻撃元が公開状態だったため、ダメージを完全に無効化！</span>` : '';
        const nohmMsg = nohmBlocked ? `<br><span style="color:#00ffff; font-weight:bold;">【ノーム】ユニットを廃棄し、ダメージを無効化（阻止）した！</span>` : '';
        const additionalMsg = yosokuMsg + nohmMsg;"""

new_logic3 = """        const yosokuMsg = yosokuTriggered ? `<br><span style="color:#00ffff; font-weight:bold;">【予測防壁】攻撃元が公開状態だったため、ダメージを完全に無効化！</span>` : '';
        const nohmMsg = nohmBlocked ? `<br><span style="color:#00ffff; font-weight:bold;">【ノーム】ユニットを廃棄し、ダメージを無効化（阻止）した！</span>` : '';
        const stagMsg = stagHalved ? `<br><span style="color:#00ffff; font-weight:bold;">【エルダースタッグ】ユニットを廃棄し、受けるダメージを半減した！</span>` : '';
        const additionalMsg = yosokuMsg + nohmMsg + stagMsg;"""

content = content.replace(old_logic3, new_logic3)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
