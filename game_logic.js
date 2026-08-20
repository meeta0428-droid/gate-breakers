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
    }
    
    get deckCapacity() {
        return 25 + (this.level * 5); // Lv1 = 30
    }
    
    get baseInitiative() {
        return this.stats.body.maxVal + this.stats.int.maxVal + this.stats.men.maxVal;
    }
    
    get initiative() {
        let total = this.baseInitiative;
        
        // パッシブ装備からのイニシアチブ
        for (const card of this.deck.passives) {
            const matchPlus = card.effect.match(/イニシアチブ[＋\+](\d+)/);
            if (matchPlus) total += parseInt(matchPlus[1]);
            
            const matchMinus = card.effect.match(/イニシアチブ[\-ー\-－](\d+)/);
            if (matchMinus) total -= parseInt(matchMinus[1]);
        }
        
        // 捨札で持続する効果からのイニシアチブ
        for (const card of this.deck.discard) {
            if (card.effect.includes('捨札にある間') && card.effect.includes('持続')) {
                const matchPlus = card.effect.match(/イニシアチブ[＋\+](\d+)/);
                if (matchPlus) total += parseInt(matchPlus[1]);
                
                const matchMinus = card.effect.match(/イニシアチブ[\-ー\-－](\d+)/);
                if (matchMinus) total -= parseInt(matchMinus[1]);
            }
        }
        
        return total;
    }
    
    get maxHandSize() {
        return 2 + this.level; // Lv1 = 3
    }
    
    get totalStatPoints() {
        return Object.values(this.stats).reduce((sum, s) => sum + s.spent, 0);
    }
    
    levelUp() {
        this.level++;
        this.unspentPoints += this.level; // 新レベルと同じ点を得る
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
    
    for (const card of cards) {
        let cardDamage = 0;
        
        const match = card.effect.match(/ダメージ[＋\+](\d+)/);
        if (match) {
            cardDamage += parseInt(match[1]);
        }
        
        // 廃棄札1枚につきダメージ+X
        const voidMatch = card.effect.match(/廃棄札1枚につき.*?ダメージ.*?[＋\+](\d+)/);
        if (voidMatch && player) {
            cardDamage += parseInt(voidMatch[1]) * player.deck.void.length;
        }
        
        // 前のカードからのボーナスを適用（カード自体がダメージを持っていなくても適用するかどうか？ 通常は攻撃カードに適用されるが、ここでは単純に加算する）
        if (cardDamage > 0 || card.effect.includes('ダメージ')) {
            cardDamage += nextCardBonus;
            nextCardBonus = 0; // 適用したらリセット
        }
        
        total += cardDamage;
        
        // このカード自身が「次のカードのダメージを+Xする」を持っている場合
        const nextMatch = card.effect.match(/この次のカードのダメージを[＋\+](\d+)/);
        if (nextMatch) {
            nextCardBonus += parseInt(nextMatch[1]);
        }
    }
    return total;
}

export function calculateDefenseFromCards(cards, player) {
    let total = 0;
    for (const card of cards) {
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
        // 捨札と廃棄札の合計コストの半分ダメージを減少
        if (card.effect.includes('捨札と廃棄札の合計コストの半分ダメージを減少') && player) {
            const discardCost = player.deck.discard.reduce((sum, c) => sum + c.cost, 0);
            const voidCost = player.deck.void.reduce((sum, c) => sum + c.cost, 0);
            total += Math.floor((discardCost + voidCost) / 2);
        }
    }
    return total;
}

export function executeCardEffects(cards, player, logMsg) {
    let drawn = 0;
    let healed = 0;
    let toVoid = new Set();
    
    for (const [idx, card] of cards.entries()) {
        // ドロー効果
        const drawMatch = card.effect.match(/山札から(\d+)枚.*?手札に加える/);
        if (drawMatch) {
            const amount = parseInt(drawMatch[1]);
            drawn += player.deck.draw(amount);
        } else if (card.effect.includes('山札から1枚手札に加える')) {
            drawn += player.deck.draw(1);
        }
        
        // 回復効果
        const healMatch = card.effect.match(/ダメージを(\d+)点回復/);
        if (healMatch) {
            const amount = parseInt(healMatch[1]);
            // シンプルにどれかの能力値を回復させる（低い順に回復）
            let remainingHeal = amount;
            for (const statKey of ['body', 'int', 'men']) {
                const stat = player.stats[statKey];
                while (remainingHeal > 0 && stat.currentVal < stat.maxVal) {
                    stat.currentVal++;
                    remainingHeal--;
                    healed++;
                }
            }
        }
        
        // 廃棄札へ移動する効果
        if (card.effect.match(/このカードは.*?廃棄札[へに]移動する/)) {
            toVoid.add(idx);
        }
    }
    
    if (drawn > 0) logMsg(`効果適用: 山札から ${drawn} 枚ドローした！`, 'important');
    if (healed > 0) logMsg(`効果適用: 能力値ダメージを ${healed} 点回復した！`, 'important');
    
    return { toVoid };
}
