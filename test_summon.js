import { Character, calculateDamageFromCards, calculateDefenseFromCards, executeCardEffects } from './game_logic.js?v=17';
import fs from 'fs';

const cardPool = JSON.parse(fs.readFileSync('cards.json', 'utf-8'));
let player = new Character('プレイヤー');
player.deck.start(cardPool, ['ゴブリン', 'ゴブリン']);

// draw to hand
player.deck.hand.push(player.deck.mountain.pop());

// play to combo
const card = player.deck.hand[0];
player.deck.hand.splice(0, 1);
player.deck.discard.push(card);
let currentCombo = [card];

// execute btnAttack
let toVoid = new Set();
currentCombo.forEach((card, idx) => {
    if (card.category.includes('召喚')) {
        const discardIdx = player.deck.discard.lastIndexOf(card);
        if (discardIdx > -1) {
            player.deck.discard.splice(discardIdx, 1);
            player.deck.summons.push({ card: card, stance: 'attack' });
        }
    }
});

console.log('Summons length:', player.deck.summons.length);
console.log('Discard length:', player.deck.discard.length);
