const text = `【キャラクター情報】
肉体: 4 / 知性: 2 / 精神: 1
レベル: 1
イニシアチブ基礎値: 7
手札上限: 3枚
デッキポイント(コスト): 30 / 30

【デッキ内容 (9枚) ― 選択順】
1. 機動騎兵 (コスト:4)
2. アニマビークル (コスト:4)
3. チェイスダウン (コスト:2)
4. ライドオン (コスト:4)
5. ドリフトヴェイド (コスト:3)
6. フルスロットルチャージ (コスト:3)
7. 人馬一体 (コスト:3)
8. 神速領域 (コスト:5)
9. スリップストリーム (コスト:2)

【キャラクター設定】
名前: 機動騎兵
性別: 男
年齢: 22
大事なもの: 相棒のビークル
嫌いなもの: ビークルが入れない場所
Q1: ウーバーイーツの配達
Q2: 配達先で化け物に襲われた時
Q3: 道の鉱石を使用したバイク
Q4: キーホルダー
Q5: 野生の勘
Q6: 家族のこと
Q7: 憎むべき相手
Q8: バイクでのツーリング
Q9: 家族が危ない目に遭わないようにするため
Q10: 平回な世界でまた配達仕事をしていたい`;

let player = {
    stats: { body: {}, int: {}, men: {} }
};
const cardPool = [{name: '機動騎兵'}, {name: 'アニマビークル'}]; // dummy

function run() {
    const normalizedText = text.replace(/\uff1a/g, ':').replace(/\uff08/g, '(').replace(/\uff09/g, ')');

    const statsMatch = normalizedText.match(/肉体:\s*(\d+)\s*\/\s*知性:\s*(\d+)\s*\/\s*精神:\s*(\d+)/);
    if (statsMatch) {
        player.stats.body.maxVal = parseInt(statsMatch[1]);
        player.stats.body.currentVal = player.stats.body.maxVal;
        player.stats.int.maxVal = parseInt(statsMatch[2]);
        player.stats.int.currentVal = player.stats.int.maxVal;
        player.stats.men.maxVal = parseInt(statsMatch[3]);
        player.stats.men.currentVal = player.stats.men.maxVal;
    }

    const levelMatch = normalizedText.match(/レベル:\s*(\d+)/);
    if (levelMatch) player.level = parseInt(levelMatch[1]);

    const handMatch = normalizedText.match(/手札上限:\s*(\d+)/);
    if (handMatch) player.maxHandSize = parseInt(handMatch[1]);

    const newDeck = [];
    const notFound = [];
    const dLines = normalizedText.split('\n');
    let inDeckSection = false;
    
    for (let line of dLines) {
        line = line.trim();
        if (line.startsWith('【デッキ内容')) {
            inDeckSection = true;
            continue;
        }
        if (inDeckSection && line.startsWith('【')) {
            inDeckSection = false;
            continue;
        }
        if (inDeckSection) {
            const cardMatch = line.match(/^(?:-|\d+\.)\s+(.+?)\s+\(コスト:/);
            if (cardMatch) {
                const cardName = cardMatch[1].trim();
                const cardData = cardPool.find(c => c.name === cardName);
                if (cardData) {
                    newDeck.push({ ...cardData });
                } else {
                    notFound.push(cardName);
                }
            }
        }
    }

    const profileSection = normalizedText.match(/【キャラクター設定】([\s\S]*)/);
    if (profileSection) {
        const profileText = profileSection[1];
        if (!player.profile) player.profile = {};
        
        const pMatch = (key, regex) => {
            const m = profileText.match(regex);
            if (m) player.profile[key] = m[1].trim();
        };
        pMatch('name', /名前:\s*(.+)/);
        if (player.profile.name) player.name = player.profile.name;
        pMatch('gender', /性別:\s*(.+)/);
        pMatch('age', /年齢:\s*(.+)/);
        pMatch('important', /大事なもの:\s*(.+)/);
        pMatch('dislike', /嫌いなもの:\s*(.+)/);
        pMatch('appearance', /身長・体重・外見:\s*(.+)/);
        pMatch('memo', /メモ:\s*(.+)/);
        
        for (let i = 1; i <= 10; i++) {
            pMatch('q' + i, new RegExp('Q' + i + ':\\s*(.+)'));
        }
    }
    
    return {newDeck: newDeck.length, profile: player.profile};
}

try {
    console.log(run());
} catch(e) {
    console.log("EXCEPTION:", e.message);
}
