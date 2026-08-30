import { cardEffects } from "./card_effects_v5.js?v=336";

export class Card {
    constructor(data) {
        this.name = data.name;
        this.category = data.category;
        this.cost = data.cost;
        this.strength = data.strength;
        this.effect = data.effect;
    }
}

export class Stat {
    constructor(name) {
        this.name = name;
        this.maxVal = 1;       // 最高値（初期1）
        this.currentVal = 1;   // 現在値（ダメージで減る）
        this.spent = 0;        // この能力値に消費した合計ポイント
    }
    
    // 次のレベルに上げるための必要コスト
    get upgradeCost() {
        return this.maxVal + 1; // 1→2は2点、2→3は3点…
    }
    
    upgrade() {
        const cost = this.upgradeCost;
        this.spent += cost;
        this.maxVal++;
        this.currentVal = this.maxVal; // 最高値を上げると現在値も回復
        return cost;
    }
    
    downgrade() {
        if (this.maxVal <= 1) return 0;
        const refund = this.maxVal; // 3→2に戻すなら3点返却
        this.spent -= refund;
        this.maxVal--;
        this.currentVal = this.maxVal;
        return refund;
    }

    takeDamage() {
        if (this.currentVal > 0) {
            this.currentVal--;
            return this.maxVal; // 軽減量は最高値と同じ
        }
        return 0;
    }
}

export class Deck {
    constructor() {
        this.mountain = [];
        this.hand = [];
        this.discard = [];
        this.void = [];
        this.passives = [];
        this.summons = [];
        this.hasRefreshed = false;
    }
    
    start(cardPool, cardNames) {
        const allCards = cardNames.map(name => {
            const data = cardPool.find(c => c.name === name);
            return data ? new Card(data) : null;
        }).filter(c => c !== null);
        
        this.passives = allCards.filter(c => c.category.includes('パッシブ'));
        this.mountain = allCards.filter(c => !c.category.includes('パッシブ'));
        
        this.shuffle(this.mountain);
    }
    
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    draw(amount) {
        let drawn = 0;
        for (let i = 0; i < amount; i++) {
            if (this.mountain.length > 0) {
                this.hand.push(this.mountain.shift());
                drawn++;
            }
        }
        return drawn;
    }

    refresh() {
        if (this.hasRefreshed) return false;
        if (this.discard.length === 0) return false;
        this.mountain = [...this.discard];
        this.discard = [];
        this.shuffle(this.mountain);
        this.hasRefreshed = true;
        return true;
    }
}

export class Character {
    constructor(name) {
        this.name = name;
        this.level = 1;
        this.unspentPoints = 11; // 初期ポイント
        this.stats = {
            body: new Stat('肉体'),
            int: new Stat('知性'),
            men: new Stat('精神')
        };
        this.deck = new Deck();
        this.initiativeModifier = 0; // 手動イニシアチブ調整値（影縫い等）
        this.extraDeckCost = 0; // ボス用追加デッキコスト
    }
    
    get deckCapacity() {
        return 25 + (this.level * 5) + this.extraDeckCost; // Lv1 = 30
    }
    
    get baseInitiative() {
        return this.stats.body.maxVal + this.stats.int.maxVal + this.stats.men.maxVal;
    }
    
    get initiative() {
        let total = this.baseInitiative;
        
        const parseFullWidthInt = (str) => {
            if (!str) return 0;
            return parseInt(str.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
        };
        
        // パッシブ装備からのイニシアチブ
        for (const card of this.deck.passives) {
            const matchPlus = card.effect.match(/イニシアチブ\s*[＋\+]\s*([0-9０-９]+)/);
            if (matchPlus) total += parseFullWidthInt(matchPlus[1]);
            
            const matchMinus = card.effect.match(/イニシアチブ\s*[\-ー\-－]\s*([0-9０-９]+)/);
            if (matchMinus) total -= parseFullWidthInt(matchMinus[1]);
        }
        
        // 捨札で持続する効果からのイニシアチブ
        const checkPersistentBuff = (card, isVoid) => {
            const isDiscardOnly = (card.effect.match(/捨[て]?札にある[間場合]/) && card.effect.match(/(持続|続く)/)) || card.effect.includes('捨札にある場合');
            const isBattleLong = card.effect.includes('戦闘中持続する') && !card.effect.includes('捨札にある間');
            
            if (isBattleLong || (!isVoid && isDiscardOnly)) {
                const matchPlus = card.effect.match(/イニシアチブ\s*[＋\+]\s*([0-9０-９]+)/);
                if (matchPlus) total += parseFullWidthInt(matchPlus[1]);
                
                const matchMinus = card.effect.match(/イニシアチブ\s*[\-ー\-－]\s*([0-9０-９]+)/);
                if (matchMinus) total -= parseFullWidthInt(matchMinus[1]);
            }
        };
        
        for (const card of this.deck.discard) {
            checkPersistentBuff(card, false);
        }
        for (const card of this.deck.void) {
            checkPersistentBuff(card, true);
        }
        
        // 召喚ユニットからのイニシアチブ
        if (this.deck.summons) {
            for (const s of this.deck.summons) {
                const card = s.card;
                const matchPlus = card.effect.match(/イニシアチブ\s*[＋\+]\s*([0-9０-９]+)/);
                if (matchPlus) total += parseFullWidthInt(matchPlus[1]);
                
                const matchMinus = card.effect.match(/イニシアチブ\s*[\-ー\-－]\s*([0-9０-９]+)/);
                if (matchMinus) total -= parseFullWidthInt(matchMinus[1]);
            }
        }
        
        // 手動調整値（影縫い等の効果）
        total += (this.initiativeModifier || 0);
        
        return total;
    }
    
    get maxHandSize() {
        let baseSize = 2 + this.level; // Lv1 = 3
        if (this.deck) {
            const activeCards = [...this.deck.passives, ...this.deck.summons.map(s => s.card ? s.card : s)];
            for (const card of activeCards) {
                if (!card || !card.effect) continue;
                const matchPlus = card.effect.match(/手札上限\s*[＋\+]\s*([0-9０-９]+)/);
                if (matchPlus) baseSize += parseInt(matchPlus[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
                
                const matchMinus = card.effect.match(/手札上限\s*[\-ー\-－]\s*([0-9０-９]+)/);
                if (matchMinus) baseSize -= parseInt(matchMinus[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
            }
            const hookContext = triggerHook('onCalcMaxHandSize', { maxHandSize: baseSize, player: this }, activeCards);
            return hookContext.maxHandSize;
        }
        return baseSize;
    }
    
    get totalStatPoints() {
        return Object.values(this.stats).reduce((sum, s) => sum + s.spent, 0);
    }
    
    levelUp() {
        this.level++;
        this.unspentPoints += this.level; // 新レベルと同じ点を得る
    }

    setLevel(newLevel) {
        if (newLevel < 1) newLevel = 1;
        this.level = newLevel;
        const totalPoints = 11 + (this.level + 2) * (this.level - 1) / 2;
        this.unspentPoints = totalPoints - this.totalStatPoints;
    }
    
    upgradeStat(key) {
        const stat = this.stats[key];
        if (!stat) return false;
        if (this.unspentPoints < stat.upgradeCost) return false;
        this.unspentPoints -= stat.upgrade();
        return true;
    }
    
    downgradeStat(key) {
        const stat = this.stats[key];
        if (!stat || stat.maxVal <= 1) return false;
        this.unspentPoints += stat.downgrade();
        return true;
    }
}

export function calculateDamageFromCards(cards, player) {
    let total = 0;
    let nextCardBonus = 0;
    let continuousBonus = 0;
    
    for (const card of cards) {
        let cardDamage = 0;
        
        const match = card.effect.match(/ダメージ[＋\+](\d+)/);
        if (match) {
            cardDamage += parseInt(match[1]);
        }
        
        if (card.name === 'ロックオンアサルト' && player && player.deck.summons.length > 0) {
            // "ダメージ+2"で+2されているので、"ダメージ+4に変更"とするため +2 を追加
            cardDamage += 2;
        }


        if (card.name === 'フルスロットルチャージ' && player) {
            // このカード自身のイニシアチブ+4を加味して判定
            const tempInit = player.initiative;
            if (tempInit > 10) {
                // regex でダメージ+2 が既に加算されているため、+3して合計+5にする
                cardDamage += 3;
            }
        }
        if (card.name === '獣の戦意' && player && player.deck.summons.length > 0) {
            let maxStr = 0;
            player.deck.summons.forEach(s => {
                if (s.card.strength > maxStr) maxStr = s.card.strength;
            });
            cardDamage += maxStr;
        }
        
        // 廃棄札1枚につきダメージ+X
        const voidMatch = card.effect.match(/廃棄札1枚につき.*?ダメージ.*?[＋\+](\d+)/);
        if (voidMatch && player) {
            cardDamage += parseInt(voidMatch[1]) * player.deck.void.length;
        }
        
        // 手札を使い切った時にダメージ+X
        const emptyHandMatch = card.effect.match(/手札を使い切った時.*?ダメージ[＋\+](\d+)/);
        if (emptyHandMatch && player && player.deck.hand.length === 0) {
            cardDamage += parseInt(emptyHandMatch[1]);
        }
        
        // サイオマンサー
        if (player && player.deck.passives.some(p => p.name === 'サイオマンサー')) {
            if (card.category.includes('精神') && card.category.includes('アクション')) {
                cardDamage += 1;
            }
        }
        
        let isDamageCard = cardDamage > 0 || card.effect.includes('ダメージ');
        
        // 常に次のカードにボーナスを適用・消費する
        if (nextCardBonus > 0) {
            if (isDamageCard) {
                cardDamage += nextCardBonus;
            }
            nextCardBonus = 0; // カードの種類に関わらずボーナスは消費される
        }
        
        // 継続ボーナス（黒狼の牙など）の適用
        if (continuousBonus > 0 && isDamageCard) {
            cardDamage += continuousBonus;
        }
        
        total += cardDamage;
        
        // このカード自身が「次のカードのダメージを+Xする」を持っている場合
        const nextMatch = card.effect.match(/この次のカードのダメージを[＋\+](\d+)/);
        if (nextMatch) {
            nextCardBonus += parseInt(nextMatch[1]);
        }
        
        // 「このカードにコンボしたあらゆるカードのダメージが+Xされる」
        const continuousMatch = card.effect.match(/コンボしたあらゆるカードのダメージが[＋\+](\d+)/);
        if (continuousMatch) {
            continuousBonus += parseInt(continuousMatch[1]);
        }
    }
    return total;
}

export function calculateDefenseFromCards(cards, player) {
    let total = 0;
    for (const card of cards) {
        if (card.name === 'ドリフトヴェイド') {
            // リアクションモーダルで事前計算された軽減値を使用
            const def = card._driftDef || 3;
            total += def;
            continue;
        }
        const match1 = card.effect.match(/(\d+)点軽減/);
        if (match1) {
            total += parseInt(match1[1]);
            continue;
        }
        const match2 = card.effect.match(/軽減[＋\+]?(\d+)/);
        if (match2) {
            total += parseInt(match2[1]);
            continue;
        }
        
        if (card.effect.includes('完全に無効化する')) {
            total += 9999;
            continue;
        }
        

        if (card.name === 'トラップコンボ' && player) {
            let maxStr = 0;
            player.deck.summons.forEach(s => {
                if (s.card.strength > maxStr) maxStr = s.card.strength;
            });
            total += 2 + maxStr;
            continue;
        }

        if (card.name === 'ワイルドコール' && player && player.deck.summons.length > 0) {
            total += 2;
            continue;
        }

        // 捨札と廃棄札の合計コストの半分ダメージを減少
        if (card.effect.includes('捨札と廃棄札の合計コストの半分ダメージを減少') && player) {
            const discardCost = player.deck.discard.reduce((sum, c) => sum + c.cost, 0);
            const voidCost = player.deck.void.reduce((sum, c) => sum + c.cost, 0);
            total += Math.floor((discardCost + voidCost) / 2);
        }
    }
    
    // パッシブによる追加軽減
    if (player && player.deck && player.deck.passives) {
        // 戦士
        const hasSenshi = player.deck.passives.some(p => p.name === '戦士' && !p.isDisabled);
        if (hasSenshi) {
            total += 1;
        }

        // 水月の構え
        const hasSuigetsu = player.deck.passives.some(p => p.name === '水月の構え' && !p.isDisabled);
        if (hasSuigetsu) {
            const otherBodyPassives = player.deck.passives.filter(p => p.name !== '水月の構え' && p.category.includes('肉体・パッシブ') && !p.isDisabled).length;
            if (otherBodyPassives >= 1) {
                total += otherBodyPassives;
            }
        }
    }

    return total;
}

export function executeCardEffects(cards, player, logMsg, isPreview = false) {
    let drawn = 0;
    let healed = 0;
    let toVoid = new Set();
    
    for (const [idx, card] of cards.entries()) {
        // --- フックシステムの呼び出し（カード使用時） ---
        triggerHook('onPlay', { player, logMsg, isPreview }, [card]);
        
        // ドロー効果
        const drawMatch = card.effect.match(/山札から(?:カードを)?([0-9０-９]+)枚.*?手札に加える/);
        if (drawMatch) {
            const parseFullWidthIntLocal = (str) => {
                if (!str) return 0;
                return parseInt(str.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
            };
            const amount = parseFullWidthIntLocal(drawMatch[1]);
            if (!isPreview) {
                drawn += player.deck.draw(amount);
            } else {
                drawn += Math.min(amount, player.deck.mountain.length + player.deck.discard.length);
            }
        } else if (card.effect.includes('山札から1枚手札に加える') || card.effect.includes('山札から１枚手札に加える')) {
            if (!isPreview) {
                drawn += player.deck.draw(1);
            } else {
                drawn += Math.min(1, player.deck.mountain.length + player.deck.discard.length);
            }
        }
        
        // 回復効果
        const healMatch = card.effect.match(/ダメージを(\d+)点回復/);
        if (healMatch) {
            const amount = parseInt(healMatch[1]);
            let remainingHeal = amount;
            for (const statKey of ['body', 'int', 'men']) {
                const stat = player.stats[statKey];
                let current = stat.currentVal;
                while (remainingHeal > 0 && current < stat.maxVal) {
                    if (!isPreview) stat.currentVal++;
                    current++;
                    remainingHeal--;
                    healed++;
                }
            }
        }
        
        // 捨札を山札に戻す効果（例: コスト3までの捨札を1枚山札に戻す）
        const returnMatch = card.effect.match(/コスト([0-9０-９]+)までの捨札を([0-9０-９]+)枚山札に戻す/);
        if (returnMatch && !isPreview) {
            const parseFullWidthIntLocal = (str) => {
                if (!str) return 0;
                return parseInt(str.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
            };
            const maxCost = parseFullWidthIntLocal(returnMatch[1]);
            const returnCount = parseFullWidthIntLocal(returnMatch[2]);
            if (typeof window !== 'undefined') {
                console.log('Dispatching requestCardReturn');
                window.dispatchEvent(new CustomEvent('requestCardReturn', {
                    detail: { maxCost, returnCount, playerObj: player }
                }));
            }
        }
        
        // 廃棄札へ移動する効果
        if (card.effect.match(/このカードは.*?廃棄札[へに]移動する/) 
            && !card.effect.match(/この効果を適用した場合/)
            && !card.effect.match(/効果を使用すると/)) {
            toVoid.add(idx);
        }
    }
    
    if (drawn > 0) logMsg(`効果適用: 山札から ${drawn} 枚ドローした！`, 'important');
    if (healed > 0) logMsg(`効果適用: 能力値ダメージを ${healed} 点回復した！`, 'important');
    
    return { toVoid };
}


/**
 * 発動中のすべてのカード（コンボ、パッシブ、召喚など）の特殊効果（フック）を実行する
 * @param {string} hookName 発動タイミングの名称 (例: 'onAttack', 'onBeforeDamageTaken')
 * @param {object} context 渡したい変数 (例: { pendingDamage: 10, player, logMsg })
 * @param {Array} activeCards 発動を判定するカードの配列（[{name:...}, {name:...}] の形式）
 * @returns {object} 更新された context
 */
export function triggerHook(hookName, context, activeCards) {
    let currentContext = { ...context };
    
    for (const cardObj of activeCards) {
        const actualCard = cardObj.card ? cardObj.card : cardObj;
        if (actualCard.isDisabled) continue;
        
        // --- 1. 個別定義されたフック（card_effects.js）の実行 ---
        const effectLogic = cardEffects[actualCard.name];
        let hasCustomLogic = false;
        if (effectLogic && effectLogic[hookName]) {
            currentContext.card = actualCard;
            currentContext.stance = cardObj.stance || null;
            
            const result = effectLogic[hookName](currentContext);
            if (result) {
                currentContext = { ...currentContext, ...result };
            }
            hasCustomLogic = true;
        }
        
        // --- 2. パッシブカードの共通テキスト解析（汎用処理） ---
        if (actualCard.category.includes('パッシブ') && !hasCustomLogic) {
            if (hookName === 'onAttack') {
                if (currentContext.totalDmg > 0) {
                    // 例: "ダメージ＋2" などの表記
                    // ただし「場合」や「なら」などの条件付きテキストは除外
                    const dmgMatch = actualCard.effect.match(/ダメージ\s*[＋\+]\s*(\d+)/);
                    if (dmgMatch && !actualCard.effect.includes('場合') && !actualCard.effect.includes('なら')) {
                        const extraDmg = parseInt(dmgMatch[1], 10);
                        currentContext.totalDmg += extraDmg;
                        if (currentContext.logMsg) {
                            currentContext.logMsg(`・【パッシブ】${actualCard.name}の効果でダメージ＋${extraDmg}`);
                        }
                    }
                }
            }
            
            if (hookName === 'onBeforeDamageTaken') {
                // 例: "受けるダメージを1点軽減", "ダメージを1点減少する", "ダメージ3点軽減"
                const reduceMatch1 = actualCard.effect.match(/(?:受ける(?:あらゆる)?)?ダメージ(?:を)?([0-9０-９]+)点(?:軽減|減少)/);
                const reduceMatch2 = actualCard.effect.match(/ダメージ(?:を受けた時|時)にダメージ\s*[-－]\s*(\d+)/);
                
                let reduceVal = 0;
                if (reduceMatch1) {
                    const numStr = reduceMatch1[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
                    reduceVal = parseInt(numStr, 10);
                } else if (reduceMatch2) {
                    reduceVal = parseInt(reduceMatch2[1], 10);
                }
                
                if (reduceVal > 0 && currentContext.pendingDamage > 0) {
                    currentContext.pendingDamage = Math.max(0, currentContext.pendingDamage - reduceVal);
                    if (currentContext.logMsg) {
                        currentContext.logMsg(`・【パッシブ】${actualCard.name}の効果でダメージを ${reduceVal} 点軽減！`);
                    }
                }
            }
        }
        // --- 2. 個別定義されていない場合の汎用フック ---
        // (必要に応じて追加)
    }
    
    if (hookName === 'onAttack' && currentContext.player && !currentContext.isPreview) {
        currentContext.player._hasAttackedThisBattle = true;
    }
    
    return currentContext;
}
