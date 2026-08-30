class Character {
    constructor() {
        this.level = 1;
        this.deck = {
            passives: [{ effect: '受けるダメージを3点軽減する。6点までのダメージを受ける場合、ダメージを無効化する。イニシアチブ-3。手札上限-1。◆ジョブカード' }],
            summons: []
        };
    }
    
    get maxHandSize() {
        let baseSize = 2 + this.level; // Lv1 = 3
        if (this.deck) {
            const activeCards = [...this.deck.passives, ...this.deck.summons];
            for (const card of activeCards) {
                const matchPlus = card.effect.match(/手札上限\s*[＋\+]\s*([0-9０-９]+)/);
                if (matchPlus) baseSize += parseInt(matchPlus[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
                
                const matchMinus = card.effect.match(/手札上限\s*[\-ー\-－]\s*([0-9０-９]+)/);
                if (matchMinus) baseSize -= parseInt(matchMinus[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
            }
            // Mock triggerHook
            const hookContext = { maxHandSize: baseSize, player: this };
            return hookContext.maxHandSize;
        }
        return baseSize;
    }
}
const p = new Character();
print(p.maxHandSize);
