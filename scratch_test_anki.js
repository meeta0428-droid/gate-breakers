import { triggerHook } from './game_logic_v9.js';
import { cardEffects } from './card_effects_v5.js';

let context = {
    totalDmg: 2,
    enemyNoReact: true,
    currentCombo: [
        { name: '影刃', cost: 1 }
    ],
    logMsg: (msg) => console.log("LOG:", msg)
};

const activeCards = [
    { name: '暗器使い', effect: 'test' }
];

const result = triggerHook('onAttack', context, activeCards);
console.log("Result totalDmg:", result.totalDmg);
