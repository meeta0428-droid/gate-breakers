with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "els.btnLoadDeck.addEventListener('click', () => openLoadModal());" in line:
        insert_code = """
    // デッキ出力ボタン
    if (els.btnExportDeck) {
        els.btnExportDeck.addEventListener('click', () => {
            let exportText = `【キャラクター情報】\\n`;
            exportText += `肉体: ${player.stats.body.maxVal} / 知性: ${player.stats.int.maxVal} / 精神: ${player.stats.men.maxVal}\\n`;
            exportText += `レベル: ${player.level}\\n`;
            exportText += `イニシアチブ基礎値: ${player.baseInitiative}\\n`;
            exportText += `手札上限: ${player.maxHandSize}枚\\n`;
            const currentCost = selectedCardsForDeck.reduce((sum, c) => sum + c.cost, 0);
            exportText += `デッキポイント(コスト): ${currentCost} / ${player.deckCapacity}\\n\\n`;
            
            exportText += `【デッキ内容 (${selectedCardsForDeck.length}枚)】\\n`;
            
            // コスト順に並び替え
            const sortedDeck = [...selectedCardsForDeck].sort((a, b) => a.cost - b.cost);
            for (const c of sortedDeck) {
                exportText += `- ${c.name} (コスト:${c.cost})\\n`;
            }
            
            navigator.clipboard.writeText(exportText).then(() => {
                alert("デッキデータをクリップボードにコピーしました！\\n\\n" + exportText);
            }).catch(err => {
                prompt("クリップボードへのコピーに失敗しました。以下のテキストをコピーしてください:", exportText);
            });
        });
    }
"""
        lines.insert(i+1, insert_code)
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
