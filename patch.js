const fs = require('fs');
let content = fs.readFileSync('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v3.js', 'utf8');
content = content.replace(
    "const validCards = playerObj.deck.discard.filter(c => c.cost <= maxCost);",
    "const validCards = playerObj.deck.discard.filter(c => c.cost <= maxCost);\n        console.log('requestCardReturn triggered!', validCards);"
);
fs.writeFileSync('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v3.js', content);
