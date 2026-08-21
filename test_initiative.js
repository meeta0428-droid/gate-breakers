import fs from 'fs';
const text = fs.readFileSync('/Users/kawaitaichi/ゲートブレイカーズ！/web/game_logic_v4.js', 'utf8');
console.log(text.includes('戦闘中持続する'));
