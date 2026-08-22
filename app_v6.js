import { Character, calculateDamageFromCards, calculateDefenseFromCards, executeCardEffects, triggerHook } from './game_logic_v9.js';

let cardPool = [];
let player = null;
let enemyHp = 100;
let selectedCardsForDeck = [];

const SAVE_KEY = 'gatebreakers_decks';
const MAX_SLOTS = 10;

// UI Elements
const els = {
    // Screens
    deckBuilderScreen: document.getElementById('deck-builder-screen'),
    battleScreen: document.getElementById('battle-screen'),
    
    // Deck Builder
    builderCost: document.getElementById('builder-cost'),
    builderMaxCost: document.getElementById('builder-max-cost'),
    selectedCount: document.getElementById('selected-count'),
    selectedDeckList: document.getElementById('selected-deck-list'),
    cardPoolList: document.getElementById('card-pool-list'),
    btnStartBattle: document.getElementById('btn-start-battle'),
    btnSaveDeck: document.getElementById('btn-save-deck'),
    btnLoadDeck: document.getElementById('btn-load-deck'),

    // Battle
    log: document.getElementById('battle-log'),
    enemyHp: document.getElementById('enemy-hp-val'),
    statBody: document.getElementById('stat-body'),
    statInt: document.getElementById('stat-int'),
    statMen: document.getElementById('stat-men'),
    statInit: document.getElementById('stat-init'),
    passiveArea: document.getElementById('passive-area'),
    summonArea: document.getElementById('summon-area'),
    maxHandSizeDisplay: document.getElementById('max-hand-size'),
    deckCount: document.getElementById('deck-count'),
    discardCount: document.getElementById('discard-count'),
    voidCount: document.getElementById('void-count'),
    handContainer: document.getElementById('hand-container'),
    
    // Buttons
    btnDraw: document.getElementById('btn-draw'),
    btnDiscardView: document.getElementById('btn-discard-view'),
    btnVoidView: document.getElementById('btn-void-view'),
    btnRefresh: document.getElementById('btn-refresh'),
    btnAttack: document.getElementById('btn-attack'),
    btnReact: document.getElementById('btn-react'),
    incomingDmg: document.getElementById('incoming-dmg'),
    chkIgnoreDef: document.getElementById('chk-ignore-def'),
    chkEnemyNoReact: document.getElementById('chk-enemy-no-react'),
    
    // Navigation
    btnDeckToChara: document.getElementById('btn-deck-to-chara'),
    btnBattleToChara: document.getElementById('btn-battle-to-chara'),
    btnPrintDeck: document.getElementById('btn-print-deck'),
    printArea: document.getElementById('print-area'),

    // Modals
    modal: document.getElementById('card-modal'),
    mTitle: document.getElementById('modal-title'),
    mCat: document.getElementById('modal-category'),
    mCost: document.getElementById('modal-cost'),
    mStr: document.getElementById('modal-str'),
    mDesc: document.getElementById('modal-desc'),
    btnUseCard: document.getElementById('btn-use-card'),
    btnSetCard: document.getElementById('btn-set-card'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    
    normalActions: document.getElementById('normal-actions'),
    comboActions: document.getElementById('combo-actions'),
    btnComboLeft: document.getElementById('btn-combo-left'),
    btnComboReturn: document.getElementById('btn-combo-return'),
    btnComboRight: document.getElementById('btn-combo-right'),
    btnComboClose: document.getElementById('btn-combo-close'),
    
    discardModal: document.getElementById('discard-modal'),
    discardList: document.getElementById('discard-list'),
    btnCloseDiscard: document.getElementById('btn-close-discard'),
    
    saveModal: document.getElementById('save-modal'),
    saveSlotList: document.getElementById('save-slot-list'),
    btnCloseSave: document.getElementById('btn-close-save'),
    
    loadModal: document.getElementById('load-modal'),
    loadSlotList: document.getElementById('load-slot-list'),
    btnCloseLoad: document.getElementById('btn-close-load'),
    
    damageModal: document.getElementById('damage-modal'),
    remainingDmgDisplay: document.getElementById('remaining-dmg-display'),
    dmgHandList: document.getElementById('dmg-hand-list'),
    dmgDiscardList: document.getElementById('dmg-discard-list'),
    dmgSummonList: document.getElementById('dmg-summon-list'),
    dmgPassiveList: document.getElementById('dmg-passive-list'),
    
    zeroStatModal: document.getElementById('zero-stat-modal'),
    zeroDiscardList: document.getElementById('zero-discard-list'),
    zeroVoidList: document.getElementById('zero-void-list'),
    btnSkipZeroRecovery: document.getElementById('btn-skip-zero-recovery')
};

let selectedCardIndex = null;
let currentCombo = [];

function logMsg(msg, type = '') {
    const p = document.createElement('p');
    p.innerHTML = msg;
    if (type) p.classList.add(type);
    els.log.prepend(p);
}

async function loadCards() {
    try {
        const response = await fetch('cards.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error('Network response was not ok');
        cardPool = await response.json();
    } catch (error) {
        console.error('Failed to load cards:', error);
    }
}

async function init() {
    await loadCards();
    
    player = new Character('プレイヤー');
    showCharaScreen();
    setupCharaEvents();
    setupEvents();
}

// ---------------------------
// キャラクター作成画面のロジック
// ---------------------------
function showCharaScreen() {
    document.getElementById('chara-screen').classList.remove('hidden');
    els.deckBuilderScreen.classList.add('hidden');
    els.battleScreen.classList.add('hidden');
    updateCharaUI();
}

function updateCharaUI() {
    document.getElementById('chara-level').innerText = player.level;
    document.getElementById('chara-points').innerText = player.unspentPoints;
    
    const statMap = { body: '肉体', int: '知性', men: '精神' };
    for (const [key, name] of Object.entries(statMap)) {
        const s = player.stats[key];
        document.getElementById(`chara-${key}-max`).innerText = s.maxVal;
        document.getElementById(`chara-${key}-cur`).innerText = s.currentVal;
        document.getElementById(`chara-${key}-spent`).innerText = s.spent;
        document.getElementById(`chara-${key}-next`).innerText = s.upgradeCost;
    }
    
    document.getElementById('chara-hand').innerText = player.maxHandSize;
    document.getElementById('chara-deck-cost').innerText = player.deckCapacity;
    document.getElementById('chara-init-val').innerText = player.baseInitiative;
}

function setupCharaEvents() {
    // ＋ボタン（タップで上昇）
    document.querySelectorAll('.chara-stat-btn-plus').forEach(btn => {
        const statKey = btn.dataset.stat;
        btn.addEventListener('click', () => {
            if (player.upgradeStat(statKey)) {
                updateCharaUI();
            } else {
                alert('ポイントが足りません！');
            }
        });
    });

    // －ボタン（タップで下降）
    document.querySelectorAll('.chara-stat-btn-minus').forEach(btn => {
        const statKey = btn.dataset.stat;
        btn.addEventListener('click', () => {
            if (player.downgradeStat(statKey)) {
                updateCharaUI();
            } else {
                alert('これ以上下げられません！');
            }
        });
    });
    
    // レベルアップボタン
    document.getElementById('btn-levelup').addEventListener('click', () => {
        player.levelUp();
        alert(`レベル${player.level}になりました！ +${player.level}ポイント獲得！`);
        updateCharaUI();
    });
    
    // デッキ構築画面へ遷移
    document.getElementById('btn-to-deck').addEventListener('click', () => {
        document.getElementById('chara-screen').classList.add('hidden');
        showDeckBuilder();
    });
}

// ---------------------------
// デッキ構築画面のロジック
// ---------------------------
function showDeckBuilder() {
    els.battleScreen.classList.add('hidden');
    els.deckBuilderScreen.classList.remove('hidden');
    
    els.builderMaxCost.innerText = player.deckCapacity;
    renderCardPool();
    renderSelectedDeck();
}

// ---------------------------
// デッキ保存・読込（localStorage）
// ---------------------------
function getSavedDecks() {
    try {
        const data = localStorage.getItem(SAVE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

function saveDeckToSlot(slotIndex, deckName) {
    const saved = getSavedDecks();
    const cardNames = selectedCardsForDeck.map(c => c.name);
    const totalCost = selectedCardsForDeck.reduce((sum, c) => sum + c.cost, 0);
    saved[slotIndex] = {
        name: deckName || `スロット${slotIndex}`,
        cards: cardNames,
        cost: totalCost,
        count: cardNames.length,
        date: new Date().toLocaleString('ja-JP'),
        chara: {
            level: player.level,
            unspentPoints: player.unspentPoints,
            stats: {
                body: { maxVal: player.stats.body.maxVal, currentVal: player.stats.body.currentVal, spent: player.stats.body.spent },
                int: { maxVal: player.stats.int.maxVal, currentVal: player.stats.int.currentVal, spent: player.stats.int.spent },
                men: { maxVal: player.stats.men.maxVal, currentVal: player.stats.men.currentVal, spent: player.stats.men.spent }
            }
        }
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
}

function loadDeckFromSlot(slotIndex) {
    const saved = getSavedDecks();
    const slot = saved[slotIndex];
    if (!slot || !slot.cards || slot.cards.length === 0) return false;
    
    selectedCardsForDeck = [];
    for (const name of slot.cards) {
        const cardData = cardPool.find(c => c.name === name);
        if (cardData) selectedCardsForDeck.push({ ...cardData });
    }
    
    if (slot.chara) {
        player.level = slot.chara.level;
        player.unspentPoints = slot.chara.unspentPoints;
        for (const key of ['body', 'int', 'men']) {
            if (slot.chara.stats[key]) {
                player.stats[key].maxVal = slot.chara.stats[key].maxVal;
                player.stats[key].currentVal = slot.chara.stats[key].currentVal;
                player.stats[key].spent = slot.chara.stats[key].spent;
            }
        }
        updateCharaUI(); // 更新しておく
    }
    
    renderSelectedDeck();
    return true;
}

function deleteDeckSlot(slotIndex) {
    const saved = getSavedDecks();
    delete saved[slotIndex];
    localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
}

function openSaveModal() {
    const saved = getSavedDecks();
    els.saveSlotList.innerHTML = '';
    
    for (let i = 1; i <= MAX_SLOTS; i++) {
        const slot = saved[i];
        const item = document.createElement('div');
        item.className = 'discard-item';
        
        if (slot) {
            const dispName = slot.name || `スロット${i}`;
            item.innerHTML = `
                <div><strong>${dispName}</strong><br><small style="color:#aaa;">${slot.count}枚 / コスト${slot.cost}</small><br><small style="color:#666;">${slot.date}</small></div>
                <div style="color:#ff5252;">上書き</div>
            `;
        } else {
            item.innerHTML = `
                <div><strong>スロット${i}</strong><br><small style="color:#555;">── 空き ──</small></div>
                <div style="color:#4caf50;">保存</div>
            `;
        }
        
        item.addEventListener('click', () => {
            if (selectedCardsForDeck.length === 0) {
                alert('保存するカードがありません。');
                return;
            }
            if (slot && !confirm(`スロット${i} を上書きしますか？`)) return;
            const deckName = prompt('保存するデータに名前をつけてください:', slot ? (slot.name || `スロット${i}`) : `デッキ${i}`);
            if (deckName === null) return; // キャンセル
            saveDeckToSlot(i, deckName);
            alert(`「${deckName || `スロット${i}`}」を保存しました！`);
            els.saveModal.classList.add('hidden');
        });
        els.saveSlotList.appendChild(item);
    }
    els.saveModal.classList.remove('hidden');
}

function openLoadModal() {
    const saved = getSavedDecks();
    els.loadSlotList.innerHTML = '';
    
    for (let i = 1; i <= MAX_SLOTS; i++) {
        const slot = saved[i];
        const item = document.createElement('div');
        item.className = 'discard-item';
        
        if (slot) {
            const dispName = slot.name || `スロット${i}`;
            item.innerHTML = `
                <div><strong>${dispName}</strong><br><small style="color:#aaa;">${slot.count}枚 / コスト${slot.cost}</small><br><small style="color:#666;">${slot.date}</small></div>
                <div style="color:#4caf50;">読込</div>
            `;
            item.addEventListener('click', () => {
                if (loadDeckFromSlot(i)) {
                    alert(`スロット${i} を読み込みました！`);
                } else {
                    alert('読込に失敗しました。');
                }
                els.loadModal.classList.add('hidden');
            });
        } else {
            item.innerHTML = `
                <div><strong>スロット${i}</strong><br><small style="color:#555;">── 空き ──</small></div>
                <div style="color:#555;">──</div>
            `;
        }
        els.loadSlotList.appendChild(item);
    }
    els.loadModal.classList.remove('hidden');
}

function renderCardPool() {
    els.cardPoolList.innerHTML = '';
    cardPool.forEach(card => {
        const div = document.createElement('div');
        div.className = 'pool-item';
        div.innerHTML = `
            <div class="pool-item-info">
                <strong>${card.name}</strong>
                <small style="color:#aaa;">${card.category}</small>
            </div>
            <div class="pool-item-stats">
                コスト:${card.cost} / 強度:+${card.strength}
            </div>
        `;
        div.addEventListener('click', () => {
            const currentCost = selectedCardsForDeck.reduce((sum, c) => sum + c.cost, 0);
            if (currentCost + card.cost > player.deckCapacity) {
                alert(`コストオーバーです！（上限: ${player.deckCapacity}）`);
                return;
            }
            selectedCardsForDeck.push(card);
            renderSelectedDeck();
        });
        els.cardPoolList.appendChild(div);
    });
}

function renderSelectedDeck() {
    const currentCost = selectedCardsForDeck.reduce((sum, c) => sum + c.cost, 0);
    els.builderCost.innerText = currentCost;
    els.selectedCount.innerText = selectedCardsForDeck.length;
    
    if (currentCost > player.deckCapacity) els.builderCost.classList.add('over-cost');
    else els.builderCost.classList.remove('over-cost');
    
    els.selectedDeckList.innerHTML = '';
    selectedCardsForDeck.forEach((card, idx) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerHTML = `
            <div class="card-name" style="font-size:0.8rem">${card.name}</div>
            <div class="card-stats" style="margin-top:auto;"><span>C:${card.cost}</span></div>
        `;
        cardDiv.addEventListener('click', () => {
            selectedCardsForDeck.splice(idx, 1);
            renderSelectedDeck();
        });
        els.selectedDeckList.appendChild(cardDiv);
    });
}

// ---------------------------
// バトル画面のロジック
// ---------------------------
function setupEvents() {
    // デッキ保存ボタン
    els.btnSaveDeck.addEventListener('click', () => openSaveModal());
    els.btnCloseSave.addEventListener('click', () => els.saveModal.classList.add('hidden'));
    
    // デッキ読込ボタン
    els.btnLoadDeck.addEventListener('click', () => openLoadModal());
    els.btnCloseLoad.addEventListener('click', () => els.loadModal.classList.add('hidden'));

    // イニシアチブ手動調整ボタン（影縫い等の効果用）
    document.getElementById('btn-init-up').addEventListener('click', () => {
        player.initiativeModifier = (player.initiativeModifier || 0) + 1;
        logMsg(`イニシアチブを手動で＋1しました（調整値: ${player.initiativeModifier >= 0 ? '+' : ''}${player.initiativeModifier}）`);
        updateUI();
    });
    document.getElementById('btn-init-down').addEventListener('click', () => {
        player.initiativeModifier = (player.initiativeModifier || 0) - 1;
        logMsg(`イニシアチブを手動で−1しました（調整値: ${player.initiativeModifier >= 0 ? '+' : ''}${player.initiativeModifier}）`);
        updateUI();
    });

    // バトル開始ボタン
    els.btnStartBattle.addEventListener('click', () => {
        const currentCost = selectedCardsForDeck.reduce((sum, c) => sum + c.cost, 0);
        if (selectedCardsForDeck.length === 0) {
            alert('カードを選択してください！');
            return;
        }
        if (currentCost !== player.deckCapacity) {
            if(!confirm(`現在のコスト合計(${currentCost})がデッキ上限(${player.deckCapacity})と等しくありません。このまま開始しますか？\n※仕様:コストが等しくなるように組むのが推奨されます。`)){
                return;
            }
        }
        
        els.deckBuilderScreen.classList.add('hidden');
        els.battleScreen.classList.remove('hidden');
        
        // デッキのセットアップ
        const cardNames = selectedCardsForDeck.map(c => c.name);
        player.deck.start(cardPool, cardNames);
        
        logMsg('戦闘開始！パッシブカードは自動的に装備されました。', 'important');
        
        // 忍者パッシブの戦闘開始時効果（重複しない）
        const hasNinja = player.deck.passives.some(p => p.name === '忍者');
        if (hasNinja) {
            const drawn = player.deck.draw(1);
            if (drawn > 0) {
                logMsg(`【忍者】の効果発動！戦闘開始時に山札から1枚引いた！`, 'important');
            }
        }
        
        updateUI();
    });

    // ドロー（手札上限まで引く）
    els.btnDraw.addEventListener('click', () => {
        const drawAmount = Math.max(0, player.maxHandSize - player.deck.hand.length);
        if (drawAmount === 0) {
            logMsg('手札はすでに上限まであります。');
            return;
        }
        const drawn = player.deck.draw(drawAmount);
        if (drawn > 0) logMsg(`${drawn}枚ドローしました。`);
        else logMsg('山札がありません！リフレッシュを使用してください。', 'damage');
        updateUI();
    });
    
    // 攻撃実行
    els.btnAttack.addEventListener('click', () => {
        let hasAttackingSummons = player.deck.summons.some(s => s.stance === 'attack');
        
        const setCards = currentCombo.filter(c => c.isSetReaction);
        currentCombo = currentCombo.filter(c => !c.isSetReaction);
        
        if (currentCombo.length === 0 && !hasAttackingSummons) {
            logMsg('出すカードがありません。手札からアクションカードを選ぶか、攻撃可能な召喚ユニットを用意してください。');
            currentCombo = [...currentCombo, ...setCards];
            return;
        }
        
        const dmg = calculateDamageFromCards(currentCombo, player);
        const { toVoid } = executeCardEffects(currentCombo, player, logMsg);
        
        let nextCardBonus = 0;
        const cardLogs = currentCombo.map((c, idx) => {
            let detail = '';
            let currentCardDmg = 0;
            
            const match = c.effect.match(/ダメージ[＋\+](\d+)/);
            if (match) currentCardDmg += parseInt(match[1]);
            
            const voidMatch = c.effect.match(/廃棄札1枚につき.*?ダメージ.*?[＋\+](\d+)/);
            if (voidMatch) {
                const bonus = parseInt(voidMatch[1]) * player.deck.void.length;
                currentCardDmg += bonus;
                detail += `（廃棄札ボーナス＋${bonus}）`;
            }
            
            const emptyHandMatch = c.effect.match(/手札を使い切った時.*?ダメージ[＋\+](\d+)/);
            if (emptyHandMatch && player.deck.hand.length === 0) {
                const bonus = parseInt(emptyHandMatch[1]);
                currentCardDmg += bonus;
                detail += `（手札0ボーナス＋${bonus}）`;
            }
            let isDamageCard = currentCardDmg > 0 || c.effect.includes('ダメージ');
            if (nextCardBonus > 0) {
                if (isDamageCard) {
                    detail += `（直前カードのボーナス＋${nextCardBonus}）`;
                    currentCardDmg += nextCardBonus;
                }
                nextCardBonus = 0; // いずれにせよボーナスは消費される
            }
            
            if (match) detail = `（基本ダメージ＋${match[1]}）` + detail;
            
            const nextMatch = c.effect.match(/この次のカードのダメージを[＋\+](\d+)/);
            if (nextMatch) {
                nextCardBonus += parseInt(nextMatch[1]);
                detail += `（次カードのダメージ＋${nextMatch[1]}）`;
            }
            
            if (toVoid.has(idx)) detail += ` [廃棄へ]`;
            return `・「${c.name}」${detail}`;
        }).join('<br>');
        // 召喚カードの追撃
        let summonDmg = 0;
        let summonLog = '';
        player.deck.summons.forEach(s => {
            if (s.stance === 'attack' || s.stance === 'both') {
                const match = s.card.effect.match(/攻(\d+)\s*[／/]\s*(?:防)?(\d+)/);
                if (match) {
                    const atk = parseInt(match[1]);
                    summonDmg += atk;
                    summonLog += `・召喚「${s.card.name}」の追撃 (＋${atk})<br>`;
                }
            }
        });
        
        let totalDmg = dmg + summonDmg;
        
        // --- フックシステムの呼び出し（攻撃ダメージ計算後、適用前） ---
        const activeCards = [...player.deck.passives, ...player.deck.summons, ...currentCombo];
        const hookContext = triggerHook('onAttack', { 
            totalDmg: totalDmg, 
            player: player,
            logMsg: logMsg,
            enemyNoReact: els.chkEnemyNoReact.checked,
            currentCombo: currentCombo
        }, activeCards);
        totalDmg = hookContext.totalDmg;
        // ----------------------------------------------------

        // 攻撃実行後、チェックボックスをリセット
        els.chkEnemyNoReact.checked = false;

        const hasAllTarget = currentCombo.some(c => c.effect.includes('任意の対象全て') || c.effect.includes('任意の対象すべて'));
        const targetLog = hasAllTarget ? '<br><span style="color:#ffcc00; font-weight:bold;">【任意の対象すべてへの攻撃！】</span>' : '';

        logMsg(`使用カード:<br>${cardLogs}<br>${summonLog}コンボ発動！ 合計 <span class="damage">${totalDmg}</span> のダメージを与えた！${targetLog}`, 'important');
        showDamagePopup(totalDmg);
        enemyHp -= totalDmg;
        
        const finalizeAttackCombo = (savedCardIdx = -1) => {
            currentCombo.forEach((card, idx) => {
                if (idx === savedCardIdx) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.hand.push(card);
                        logMsg(`【残心】の効果で「${card.name}」を手札に戻しました。`, 'important');
                    }
                    return;
                }
                
                // 影刃：リアクション無効化を使用した場合、廃棄札へ
                if (card._kagejinUsed) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        logMsg(`「${card.name}」はリアクション無効化の代償として廃棄札に移動した。`);
                    }
                    delete card._kagejinUsed;
                    return;
                }

                // 影打ち等：捨札から使用した場合、廃棄札へ
                if (card._fromDiscard) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        logMsg(`「${card.name}」は捨札から使用されたため廃棄札に移動した。`);
                    }
                    delete card._fromDiscard;
                    return;
                }
                
                if (card.category.includes('召喚') || card.effect.includes('召喚・攻')) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'attack';
                        player.deck.summons.push({ card: card, stance: initStance });
                    }
                } else if (toVoid.has(idx)) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                    }
                }
            });
            
            // 超速判断の処理
            const hasChosoku = currentCombo.some(c => c.name === '超速判断' || c.effect.includes('捨札からコスト3以下のカードを1枚引く'));
            if (hasChosoku) {
                window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                    detail: {
                        filterFunc: c => c.cost <= 3 && !currentCombo.includes(c),
                        title: "超速判断の効果",
                        desc: "捨札からコスト3以下のカードを1枚引きます。",
                        onSelect: (card) => {
                            player.deck.hand.push(card);
                            logMsg(`【超速判断】捨札から「${card.name}」を手札に加えました。`);
                        },
                        playerObj: player
                    }
                }));
            }

            currentCombo = setCards;
            updateUI();
        };

        // --- 影刃のリアクション無効化チェック ---
        const kagejinCards = currentCombo.filter(c => c.name === '影刃' || c.effect.includes('リアクションを無効化できる'));
        
        const proceedAfterKagejin = () => {
            // --- 残心チェック ---
            const hasZanshin = player.deck.passives.some(p => p.name === '残心' || p.effect.includes('使用したカード1枚は手札に戻る'));
            const actionCardIndexes = currentCombo.map((c, i) => c.category.includes('アクション') ? i : -1).filter(i => i !== -1);
            
            if (hasZanshin && actionCardIndexes.length > 0) {
                window.dispatchEvent(new CustomEvent('requestZanshinReturn', {
                    detail: {
                        actionCardIndexes,
                        combo: currentCombo,
                        callback: finalizeAttackCombo
                    }
                }));
            } else {
                finalizeAttackCombo();
            }
        };

        if (kagejinCards.length > 0) {
            const kagejinModal = document.getElementById('kagejin-modal');
            kagejinModal.classList.remove('hidden');
            
            const btnYes = document.getElementById('btn-kagejin-yes');
            const btnNo = document.getElementById('btn-kagejin-no');
            
            // イベントリスナーの重複防止
            const newBtnYes = btnYes.cloneNode(true);
            const newBtnNo = btnNo.cloneNode(true);
            btnYes.parentNode.replaceChild(newBtnYes, btnYes);
            btnNo.parentNode.replaceChild(newBtnNo, btnNo);
            
            newBtnYes.addEventListener('click', () => {
                kagejinCards.forEach(c => { c._kagejinUsed = true; });
                logMsg(`【影刃】の効果発動！敵のリアクションを無効化した！`, 'important');
                kagejinModal.classList.add('hidden');
                proceedAfterKagejin();
            });
            
            newBtnNo.addEventListener('click', () => {
                kagejinModal.classList.add('hidden');
                proceedAfterKagejin();
            });
        } else {
            proceedAfterKagejin();
        }
    });

    // 防御/被弾（リアクション）
    let pendingDamage = 0;
    let isGuardStanceActive = false; // ガードスタンスの状態を保持
    
    // --- リアクションモーダル用変数 ---
    let pendingInputDmg = 0;
    const reactionModal = document.getElementById('reaction-modal');
    const reactionList = document.getElementById('reaction-list');
    const reactionComboCount = document.getElementById('reaction-combo-count');
    const btnReactionDone = document.getElementById('btn-reaction-done');

    function updateReactionModalUI() {
        reactionList.innerHTML = '';
        reactionComboCount.innerText = currentCombo.length;
        
        // 手札のリアクションカード
        const reactionCards = player.deck.hand.map((c, i) => ({ card: c, originalIndex: i }))
                                             .filter(item => item.card.category.includes('リアクション'));
        
        // 闘禅一致でセット済みのカード（currentCombo内のisSetReaction）
        const setCards = currentCombo.map((c, i) => ({ card: c, comboIndex: i }))
                                     .filter(item => item.card.isSetReaction && !item.card._addedToReaction);

        if (reactionCards.length === 0 && setCards.length === 0) {
            reactionList.innerHTML = '<span style="color:#555; font-size:0.75rem;">手札にリアクションカードはありません</span>';
            return;
        }

        // 手札のリアクションカードを表示
        reactionCards.forEach(item => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card-item';
            cardDiv.innerHTML = `<strong>${item.card.name}</strong><br><small>コスト:${item.card.cost}</small>`;
            cardDiv.onclick = () => {
                const c = player.deck.hand[item.originalIndex];
                player.deck.hand.splice(item.originalIndex, 1);
                player.deck.discard.push(c);
                currentCombo.push(c);
                logMsg(`「${c.name}」をリアクションとして場に出した！`);
                updateUI();
                updateReactionModalUI(); // 再描画
            };
            reactionList.appendChild(cardDiv);
        });

        // 闘禅一致のセットカードを表示（黄色で区別）
        setCards.forEach(item => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card-item';
            cardDiv.style.borderColor = '#ffcc00';
            cardDiv.innerHTML = `<strong><span style="color:#ffcc00;">[闘禅一致]</span> ${item.card.name}</strong><br><small>コスト:${item.card.cost} ― ${item.card.effect}</small>`;
            cardDiv.onclick = () => {
                // セットカードはすでにcurrentComboにあるので、リアクションとして使用済みにマーク
                item.card._addedToReaction = true;
                logMsg(`「${item.card.name}」を闘禅一致のリアクションとして発動準備！`);
                updateUI();
                updateReactionModalUI(); // 再描画
            };
            reactionList.appendChild(cardDiv);
        });
    }
    let pendingIgnoreDef = false;

    function openReactionModal(dmg, ignoreDef) {
        pendingInputDmg = dmg;
        pendingIgnoreDef = ignoreDef;
        updateReactionModalUI();
        reactionModal.classList.remove('hidden');
    }

    btnReactionDone.addEventListener('click', () => {
        reactionModal.classList.add('hidden');
        processReaction(pendingInputDmg, pendingIgnoreDef);
    });

    function processReaction(inputDmg, ignoreDef = false) {
        // ガードスタンス発動チェック
        if (!ignoreDef && currentCombo.some(c => c.effect.includes('その後ダメージを受けるカードがコスト以下のダメージの場合は、ダメージを受けない'))) {
            isGuardStanceActive = true;
        }
        
        const defense = calculateDefenseFromCards(currentCombo, player);
        const { toVoid } = executeCardEffects(currentCombo, player, logMsg);
        
        // --- 闘禅一致などのアクションカード（セット）による反撃ダメージ計算 ---
        // モーダルで選択されたセットカードのみ反撃ダメージを計算
        const activatedSetCards = currentCombo.filter(c => c.isSetReaction && c._addedToReaction);
        const reactionDmg = calculateDamageFromCards(activatedSetCards, player);
        if (reactionDmg > 0) {
            let totalCounterDmg = reactionDmg;
            const hookContext = triggerHook('onAttack', {
                totalDmg: totalCounterDmg,
                logMsg,
                player,
                currentCombo
            }, [...player.deck.passives, ...player.deck.summons]);
            
            totalCounterDmg = hookContext.totalDmg;
            enemyHp -= totalCounterDmg;
            
            const setCardNames = activatedSetCards.map(c => c.name).join('、');
            logMsg(`【闘禅一致】セットされた「${setCardNames || 'カード'}」のリアクション効果が発動！敵に <span class="damage">${totalCounterDmg}</span> のダメージを与えた！`, 'important');
            
            if (typeof showDamagePopup === 'function') showDamagePopup(totalCounterDmg);
            updateUI();
        }
        // ----------------------------------------------------
        
        let actualDmg = Math.max(0, inputDmg - defense);
        
        const cardLogs = currentCombo.map((c, idx) => {
            let detail = '';
            const match1 = c.effect.match(/(\d+)点軽減/);
            const match2 = c.effect.match(/軽減[＋\+]?(\d+)/);
            if (match1) detail = `（軽減 ${match1[1]}）`;
            else if (match2) detail = `（軽減 ${match2[1]}）`;
            
            if (c.effect.includes('捨札と廃棄札の合計コストの半分ダメージを減少')) {
                const d = player.deck.discard.reduce((sum, c) => sum + c.cost, 0);
                const v = player.deck.void.reduce((sum, c) => sum + c.cost, 0);
                detail += `（割合軽減 ${Math.floor((d + v) / 2)}）`;
            }
            if (toVoid.has(idx)) detail += ` [廃棄へ]`;
            return `・「${c.name}」${detail}`;
        }).join('<br>');
        
        // 召喚の防御
        let summonDef = 0;
        let summonLog = '';
        player.deck.summons.forEach(s => {
            if (s.stance === 'defend' || s.stance === 'both') {
                const match = s.card.effect.match(/攻(\d+)\s*[／/]\s*(?:防)?(\d+)/);
                if (match) {
                    const defVal = parseInt(match[2]);
                    summonDef += defVal;
                    summonLog += `・召喚「${s.card.name}」の防御 (軽減 ${defVal})<br>`;
                }
            }
        });
        
        let totalDef = defense + summonDef;
        
        if (ignoreDef) {
            totalDef = 0;
        }
        
        actualDmg = Math.max(0, inputDmg - totalDef);

        const cardStr = currentCombo.length > 0 ? `使用カード:<br>${cardLogs}<br>` : 'カード使用なし<br>';
        
        if (ignoreDef) {
            logMsg(`${cardStr}${summonLog}敵からの攻撃（<span style="color:#cc44ff;">軽減無視！</span>）<br>元ダメージ: ${inputDmg}<br><span style="color:#ff5252;">最終ダメージ: ${actualDmg}</span>`, 'important');
        } else {
            logMsg(`${cardStr}${summonLog}敵からの攻撃！<br>元ダメージ: ${inputDmg}<br>カード軽減: ${totalDef}<br><span style="color:#ff5252;">最終ダメージ: ${actualDmg}</span>`, 'important');
        }
        
        if (actualDmg === 0) {
            // 流し斬りチェックはすべての軽減適用後に行うため、ここでは判定しない
        }
        
        currentCombo.forEach((card, idx) => {
            delete card.isSetReaction;
            delete card._addedToReaction;

            if (card._fromDiscard) {
                const discardIdx = player.deck.discard.lastIndexOf(card);
                if (discardIdx > -1) {
                    player.deck.discard.splice(discardIdx, 1);
                    player.deck.void.push(card);
                    logMsg(`「${card.name}」は捨札から使用されたため廃棄札に移動した。`);
                }
                delete card._fromDiscard;
                return;
            }

            if (card.category.includes('召喚') || card.effect.includes('召喚・攻')) {
                const discardIdx = player.deck.discard.lastIndexOf(card);
                if (discardIdx > -1) {
                    player.deck.discard.splice(discardIdx, 1);
                    const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'defend';
                    player.deck.summons.push({ card: card, stance: initStance });
                }
            } else if (toVoid.has(idx)) {
                const discardIdx = player.deck.discard.lastIndexOf(card);
                if (discardIdx > -1) {
                    player.deck.discard.splice(discardIdx, 1);
                    player.deck.void.push(card);
                }
            }
        });
        
        // 流し斬りの判定用にカウンターフラグを保持（comboクリア前に判定）
        const hasNagashigiri = currentCombo.some(c => c.name === '流し斬り' || c.effect.includes('この効果でダメージを防ぎ切った場合、対象にダメージ＋5を与える'));
        
        // 超速判断の処理
        const hasChosoku = currentCombo.some(c => c.name === '超速判断' || c.effect.includes('捨札からコスト3以下のカードを1枚引く'));
        if (hasChosoku) {
            window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                detail: {
                    filterFunc: c => c.cost <= 3 && !currentCombo.includes(c),
                    title: "超速判断の効果",
                    desc: "捨札からコスト3以下のカードを1枚引きます。",
                    onSelect: (card) => {
                        player.deck.hand.push(card);
                        logMsg(`【超速判断】捨札から「${card.name}」を手札に加えました。`);
                    },
                    playerObj: player
                }
            }));
        }
        
        currentCombo = [];
        els.incomingDmg.value = '';
        els.chkIgnoreDef.checked = false; // チェックをリセット
        
        // --- フックシステムの呼び出し（ダメージ計算後、適用前） ---
        const activeCards = [...player.deck.passives, ...player.deck.summons];
        const hookContext = triggerHook('onBeforeDamageTaken', { 
            pendingDamage: actualDmg, 
            player: player,
            logMsg: logMsg 
        }, activeCards);
        
        if (!ignoreDef) {
            actualDmg = hookContext.pendingDamage;
        }
        // ----------------------------------------------------
        
        // --- 流し斬りカウンター判定（すべての軽減適用後） ---
        if (actualDmg <= 0 && hasNagashigiri) {
            let counterDmg = 5;
            const counterHook = triggerHook('onAttack', {
                totalDmg: counterDmg,
                logMsg,
                player,
                currentCombo: []
            }, player.deck.passives);
            
            counterDmg = counterHook.totalDmg;
            enemyHp -= counterDmg;
            logMsg(`【流し斬り】の効果発動！すべての軽減でダメージを防ぎ切り、カウンターで敵に ${counterDmg} ダメージを与えた！`, 'important');
            if (typeof showDamagePopup === 'function') showDamagePopup(counterDmg);
        }
        
        if (actualDmg > 0) {
            pendingDamage = actualDmg;
            updateDamageModalUI();
            els.damageModal.classList.remove('hidden');
        } else if (hookContext.pendingDamage <= 0 && actualDmg <= 0) {
            logMsg('ダメージ処理が完了しました（最終ダメージ0）。');
            isGuardStanceActive = false;
        }
        updateUI();
    }

    els.btnReact.addEventListener('click', () => {
        let inputDmg = parseInt(els.incomingDmg.value);
        if (isNaN(inputDmg) || inputDmg <= 0) {
            alert('敵のダメージを入力してください。');
            return;
        }
        
        const ignoreDef = els.chkIgnoreDef.checked;
        
        const hasReaction = player.deck.hand.some(c => c.category.includes('リアクション'));
        const hasSetCard = currentCombo.some(c => c.isSetReaction);
        if (hasReaction || hasSetCard) {
            openReactionModal(inputDmg, ignoreDef);
        } else {
            processReaction(inputDmg, ignoreDef);
        }
    });

    document.querySelectorAll('.stat-dmg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const statKey = btn.dataset.stat;
            const stat = player.stats[statKey];
            
            if (stat.currentVal <= 0) {
                alert(`すでに${stat.name}の現在値は0です！別の能力値を選んでください。`);
                return;
            }
            
            const mitigation = stat.takeDamage();
            pendingDamage -= mitigation;
            logMsg(`${stat.name}で受けた！(現在値-1) ダメージを ${mitigation} 点軽減！`);
            
            if (pendingDamage <= 0) {
                pendingDamage = 0;
                logMsg('ダメージ処理が完了しました。');
                els.damageModal.classList.add('hidden'); isGuardStanceActive = false;
            } else {
                updateDamageModalUI();
            }
            updateUI();
            
            if (stat.currentVal === 0) {
                logMsg(`【能力値ブレイク】${stat.name}の現在値が0になりました！`, 'important');
                openZeroStatRecoveryModal();
            }
        });
    });
    
    function openZeroStatRecoveryModal() {
        const renderList = (container, cardArray, sourceName) => {
            container.innerHTML = '';
            if (cardArray.length === 0) {
                container.innerHTML = '<span style="color:#555; font-size:0.75rem;">カードがありません</span>';
                return;
            }
            cardArray.forEach((card, idx) => {
                const cDiv = document.createElement('div');
                cDiv.className = 'discard-item';
                cDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#111; padding:8px; border-radius:5px; margin-bottom:5px; cursor:pointer;';
                cDiv.innerHTML = `
                    <div><strong>${card.name}</strong><br><small style="color:#aaa;">コスト${card.cost} / ${card.category}</small></div>
                    <div style="color:#4caf50;">回収</div>
                `;
                cDiv.addEventListener('click', () => {
                    cardArray.splice(idx, 1);
                    player.deck.hand.push(card);
                    logMsg(`ブレイク効果で${sourceName}から「${card.name}」を手札に戻した！`, 'important');
                    els.zeroStatModal.classList.add('hidden');
                    updateUI();
                });
                container.appendChild(cDiv);
            });
        };
        
        renderList(els.zeroDiscardList, player.deck.discard, '捨札');
        renderList(els.zeroVoidList, player.deck.void, '廃棄札');
        
        els.btnSkipZeroRecovery.onclick = () => {
            els.zeroStatModal.classList.add('hidden');
        };
        
        els.zeroStatModal.classList.remove('hidden');
    }
    
    function updateDamageModalUI() {
        els.remainingDmgDisplay.innerText = pendingDamage;
        
        // 廃棄用リストの描画
        const renderList = (container, cardArray, sourceName) => {
            container.innerHTML = '';
            if (cardArray.length === 0) {
                container.innerHTML = '<span style="color:#555; font-size:0.75rem;">カードがありません</span>';
                return;
            }
            cardArray.forEach((card, idx) => {
                const cDiv = document.createElement('div');
                cDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#111; padding:5px; border-radius:3px; font-size:0.8rem;';
                
                const btnLabel = isGuardStanceActive ? 'ダメージを受ける' : '廃棄';
                cDiv.innerHTML = `<span>${card.name} (コスト${card.cost})</span> <button class="btn btn-primary" style="padding:2px 6px; font-size:0.7rem;">${btnLabel}</button>`;
                
                cDiv.querySelector('button').addEventListener('click', () => {
                    const dmgToTake = pendingDamage;
                    
                    if (isGuardStanceActive) {
                        // ガードスタンス発動中：召喚ユニットと同じ処理
                        if (dmgToTake > card.cost) {
                            cardArray.splice(idx, 1);
                            player.deck.void.push(card);
                            pendingDamage -= card.cost;
                            logMsg(`「${card.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                        } else {
                            pendingDamage = 0;
                            logMsg(`「${card.name}」でダメージを受け止めた！(${sourceName}に残ります)`, 'important');
                        }
                    } else {
                        // 通常：アクションカードを廃棄してコスト分軽減
                        const mitigation = card.cost;
                        cardArray.splice(idx, 1);
                        player.deck.void.push(card);
                        
                        pendingDamage -= mitigation;
                        if (pendingDamage <= 0) {
                            pendingDamage = 0;
                            logMsg(`${sourceName}の「${card.name}」を廃棄してダメージを防ぎ切った！`, 'important');
                        } else {
                            logMsg(`${sourceName}の「${card.name}」を廃棄して ${mitigation} 点軽減！（残り: ${pendingDamage}）`);
                        }
                    }
                    
                    if (pendingDamage <= 0) {
                        pendingDamage = 0;
                        els.damageModal.classList.add('hidden'); isGuardStanceActive = false;
                        updateUI();
                    } else {
                        updateDamageModalUI(); // 再描画
                    }
                });
                container.appendChild(cDiv);
            });
        };
        
        renderList(els.dmgHandList, player.deck.hand, '手札');
        renderList(els.dmgDiscardList, player.deck.discard, '捨札');
        
        // 召喚ユニット用のリスト（コスト分軽減ではなく、ダメージを受ける）
        els.dmgSummonList.innerHTML = '';
        if (player.deck.summons.length === 0) {
            els.dmgSummonList.innerHTML = '<span style="color:#555; font-size:0.75rem;">召喚ユニットがいません</span>';
        } else {
            player.deck.summons.forEach((s, idx) => {
                const cDiv = document.createElement('div');
                cDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#111; padding:5px; border-radius:3px; font-size:0.8rem;';
                cDiv.innerHTML = `<span>${s.card.name} (コスト${s.card.cost})</span> <button class="btn btn-primary" style="padding:2px 6px; font-size:0.7rem;">ダメージを受ける</button>`;
                cDiv.querySelector('button').addEventListener('click', () => {
                    const dmgToTake = pendingDamage;
                    if (dmgToTake > s.card.cost) {
                        // 破壊される
                        player.deck.summons.splice(idx, 1);
                        player.deck.void.push(s.card);
                        pendingDamage -= s.card.cost; // コスト分だけ軽減して残りをプレイヤーが受ける？
                        logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                    } else {
                        // 耐え切る
                        pendingDamage = 0;
                        logMsg(`「${s.card.name}」でダメージを受け止めた！`, 'important');
                    }
                    
                    if (pendingDamage <= 0) {
                        pendingDamage = 0;
                        els.damageModal.classList.add('hidden'); isGuardStanceActive = false;
                        updateUI();
                    } else {
                        updateDamageModalUI(); // 再描画
                    }
                });
                els.dmgSummonList.appendChild(cDiv);
            });
        }
        
        // パッシブ装備用のリスト（すべて表示し、効果によって処理を変える）
        els.dmgPassiveList.innerHTML = '';
        if (player.deck.passives.length === 0) {
            els.dmgPassiveList.innerHTML = '<span style="color:#555; font-size:0.75rem;">身代わりにできるパッシブ装備がありません</span>';
        } else {
            player.deck.passives.forEach((pCard) => {
                const idx = player.deck.passives.indexOf(pCard);
                const cDiv = document.createElement('div');
                cDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#111; padding:5px; border-radius:3px; font-size:0.8rem;';
                
                const isBulwark = pCard.effect.includes('このカードでダメージを受けた場合');
                const btnLabel = (isBulwark || isGuardStanceActive) ? 'ダメージを受ける' : '廃棄';
                
                cDiv.innerHTML = `<span>${pCard.name} (コスト${pCard.cost})</span> <button class="btn btn-primary" style="padding:2px 6px; font-size:0.7rem;">${btnLabel}</button>`;
                cDiv.querySelector('button').addEventListener('click', () => {
                    const dmgToTake = pendingDamage;
                    
                    if (isBulwark || isGuardStanceActive) {
                        // 召喚ユニットやガードスタンスと同じ処理（コスト以下なら耐える）
                        if (dmgToTake > pCard.cost) {
                            player.deck.passives.splice(idx, 1);
                            player.deck.void.push(pCard);
                            pendingDamage -= pCard.cost;
                            logMsg(`「${pCard.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                        } else {
                            pendingDamage = 0;
                            logMsg(`「${pCard.name}」でダメージを受け止めた！(パッシブとして場に残ります)`, 'important');
                        }
                    } else {
                        // アクションカードと同じ処理（強制的に廃棄してコスト分軽減）
                        player.deck.passives.splice(idx, 1);
                        player.deck.void.push(pCard);
                        pendingDamage -= pCard.cost;
                        
                        if (pendingDamage <= 0) {
                            pendingDamage = 0;
                            logMsg(`パッシブ装備「${pCard.name}」を廃棄してダメージを防ぎ切った！`, 'important');
                        } else {
                            logMsg(`パッシブ装備「${pCard.name}」を廃棄して ${pCard.cost} 点軽減！（残り: ${pendingDamage}）`);
                        }
                    }
                    
                    if (pendingDamage <= 0) {
                        pendingDamage = 0;
                        els.damageModal.classList.add('hidden'); isGuardStanceActive = false;
                        updateUI();
                    } else {
                        updateDamageModalUI(); // 再描画
                    }
                });
                els.dmgPassiveList.appendChild(cDiv);
            });
        }
    }
    
    // ナビゲーション
    els.btnDeckToChara.addEventListener('click', () => {
        els.deckBuilderScreen.classList.add('hidden');
        showCharaScreen();
    });

    els.btnPrintDeck.addEventListener('click', () => {
        const cardsToPrint = selectedCardsForDeck.length > 0 ? selectedCardsForDeck : player.deck.mountain;
        if (cardsToPrint.length === 0) {
            alert('印刷するカードがありません。デッキにカードを追加してください。');
            return;
        }
        
        // 印刷用HTMLを構築（9枚ずつページ区切り）
        let printHTML = '';
        const cards = cardsToPrint;
        
        for (let i = 0; i < cards.length; i += 9) {
            printHTML += '<div class="print-page">';
            const pageCards = cards.slice(i, i + 9);
            
            for (let r = 0; r < 3; r++) {
                const rowCards = pageCards.slice(r * 3, r * 3 + 3);
                if (rowCards.length === 0) break;
                
                printHTML += '<div class="print-row">';
                rowCards.forEach(card => {
                    printHTML += `
                        <div class="print-card">
                            <div class="print-card-title">${card.name}</div>
                            <div class="print-card-cat">${card.category}</div>
                            <div class="print-card-stats">
                                <span>ｺｽﾄ:${card.cost}</span>
                                <span>強度:${card.strength}</span>
                            </div>
                            <div class="print-card-effect">${card.effect}</div>
                        </div>
                    `;
                });
                printHTML += '<div style="clear:both;"></div></div>';
            }
            printHTML += '</div>';
        }
        
        els.printArea.innerHTML = printHTML;
        
        // 印刷ダイアログを呼び出す
        setTimeout(() => {
            window.print();
        }, 100);
    });

    els.btnBattleToChara.addEventListener('click', () => {
        if (!confirm('バトルを中断してキャラクター作成に戻りますか？\n（※デッキや手札はリセットされます）')) return;
        els.battleScreen.classList.add('hidden');
        showCharaScreen();
    });

    // リフレッシュ
    els.btnRefresh.addEventListener('click', () => {
        if (player.deck.hasRefreshed) {
            logMsg('リフレッシュは既に使われています（1ゲーム1回のみ）', 'damage');
        } else {
            const success = player.deck.refresh();
            if (success) {
                logMsg('【リフレッシュ発動】捨札をシャッフルして山札に戻しました！', 'important');
                updateUI();
            } else {
                logMsg('捨札がないためリフレッシュできません。');
            }
        }
    });

    let recoveringCards = new Set();
    
    function updateDiscardModalUI() {
        const hasHotLimit = player.deck.passives.some(p => p.effect.includes('能力値にダメージを受けていても、回収ポイントが下がらない'));
        const getRecoveryMax = (stat) => hasHotLimit ? stat.maxVal : stat.currentVal;

        const maxBodyBase = getRecoveryMax(player.stats.body);
        const maxIntBase = getRecoveryMax(player.stats.int);
        const maxMenBase = getRecoveryMax(player.stats.men);
        
        let bonusBody = 0, bonusInt = 0, bonusMen = 0;
        
        const parseFullWidthIntLocal = (str) => {
            if (!str) return 0;
            return parseInt(str.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
        };

        const checkRecoveryBonus = (card, isVoid) => {
            const isDiscardOnly = card.effect.includes('捨札にある間') && card.effect.includes('持続');
            const isBattleLong = card.effect.includes('戦闘中持続する') && !card.effect.includes('捨札にある間');
            const isPassive = player.deck.passives.includes(card);
            
            // パッシブまたは条件を満たした持続効果のみ計算
            if (isPassive || isBattleLong || (!isVoid && isDiscardOnly)) {
                const matchAll = card.effect.match(/すべての回収ポイント\s*[＋\+]\s*([0-9０-９]+)/);
                if (matchAll) {
                    const val = parseFullWidthIntLocal(matchAll[1]);
                    bonusBody += val; bonusInt += val; bonusMen += val;
                }
                
                const matchAny = card.effect.match(/回収ポイント\s*[＋\+]\s*([0-9０-９]+)/);
                if (matchAny && !matchAll) {
                    const val = parseFullWidthIntLocal(matchAny[1]);
                    bonusBody += val; bonusInt += val; bonusMen += val;
                }
                
                const matchMinus = card.effect.match(/回収ポイント[をが]?\s*[\-ー\-－]\s*([0-9０-９]+)/);
                if (matchMinus) {
                    const val = parseFullWidthIntLocal(matchMinus[1]);
                    bonusBody -= val; bonusInt -= val; bonusMen -= val;
                }
            }
        };

        player.deck.passives.forEach(c => checkRecoveryBonus(c, false));
        player.deck.discard.forEach(c => checkRecoveryBonus(c, false));
        player.deck.void.forEach(c => checkRecoveryBonus(c, true));

        const maxBody = maxBodyBase + bonusBody;
        const maxInt = maxIntBase + bonusInt;
        const maxMen = maxMenBase + bonusMen;

        let costBody = 0, costInt = 0, costMen = 0;
        recoveringCards.forEach(idx => {
            const card = player.deck.discard[idx];
            if (card.category.includes('肉体')) costBody += card.cost;
            else if (card.category.includes('知性')) costInt += card.cost;
            else if (card.category.includes('精神')) costMen += card.cost;
        });

        document.getElementById('recover-cost-body').innerText = costBody;
        document.getElementById('recover-max-body').innerText = maxBody;
        document.getElementById('recover-cost-body').style.color = costBody > maxBody ? '#ff5252' : '#fff';

        document.getElementById('recover-cost-int').innerText = costInt;
        document.getElementById('recover-max-int').innerText = maxInt;
        document.getElementById('recover-cost-int').style.color = costInt > maxInt ? '#ff5252' : '#fff';

        document.getElementById('recover-cost-men').innerText = costMen;
        document.getElementById('recover-max-men').innerText = maxMen;
        document.getElementById('recover-cost-men').style.color = costMen > maxMen ? '#ff5252' : '#fff';

        const overLimit = costBody > maxBody || 
                          costInt > maxInt || 
                          costMen > maxMen;
        
        const executeBtn = document.getElementById('btn-execute-recover');
        executeBtn.disabled = overLimit || recoveringCards.size === 0;
        executeBtn.style.opacity = executeBtn.disabled ? '0.5' : '1';

        els.discardList.innerHTML = '';
        if (player.deck.discard.length === 0) {
            els.discardList.innerHTML = '<p style="color:#aaa;">捨札はありません</p>';
        } else {
            player.deck.discard.forEach((card, idx) => {
                const item = document.createElement('div');
                item.className = 'discard-item';
                
                let relatedStat = null;
                if (card.category.includes('肉体')) relatedStat = player.stats.body;
                else if (card.category.includes('知性')) relatedStat = player.stats.int;
                else if (card.category.includes('精神')) relatedStat = player.stats.men;

                if (!relatedStat) {
                    item.style.opacity = '0.5';
                    item.style.cursor = 'not-allowed';
                    item.innerHTML = `
                        <div><strong>${card.name}</strong><br><small style="color:#aaa;">${card.category}</small></div>
                        <div style="text-align:right;">
                            <div>コスト: ${card.cost}</div>
                            <div style="color:#ff5252; font-size:0.7rem;">回収不可カテゴリ</div>
                        </div>
                    `;
                } else {
                    const isSelected = recoveringCards.has(idx);
                    if (isSelected) {
                        item.style.borderColor = '#1976d2';
                        item.style.backgroundColor = 'rgba(25, 118, 210, 0.2)';
                    }
                    
                    const canUseFromDiscard = card.effect.includes('手札にあるように使用できる');
                    const useBtnHtml = canUseFromDiscard ? `<button class="btn btn-action btn-use-discard" data-idx="${idx}" style="font-size:0.7rem; padding:2px 5px; margin-top:5px; width:100%;">捨札から使用</button>` : '';

                    const hasMadanjushi = player.deck.passives.some(p => p.name === '魔弾銃士');
                    const isBullet = card.effect.includes('弾丸');
                    let costDisplay = `コスト: ${card.cost}`;
                    if (hasMadanjushi && isBullet) {
                        costDisplay = `コスト: <span style="text-decoration: line-through;">${card.cost}</span> <span style="color:#ffcc00;">${Math.max(0, card.cost - 1)}</span> <span style="color:#ffcc00; font-size:0.7rem;">(魔弾)</span>`;
                    }

                    item.innerHTML = `
                        <div><strong>${card.name}</strong><br><small style="color:#aaa;">${card.category}</small></div>
                        <div style="text-align:right;">
                            <div>${costDisplay}</div>
                            ${isSelected ? '<div style="color:#4caf50; font-size:0.75rem;">✔ 選択中</div>' : ''}
                            ${useBtnHtml}
                        </div>
                    `;
                    
                    item.addEventListener('click', (e) => {
                        if (e.target.classList.contains('btn-use-discard')) {
                            e.stopPropagation();
                            const targetCard = player.deck.discard[idx];
                            targetCard._fromDiscard = true;
                            currentCombo.push(targetCard);
                            logMsg(`【${targetCard.name}】の効果！捨札から場に出した！`);
                            els.discardModal.classList.add('hidden');
                            updateUI();
                            return;
                        }
                        
                        if (recoveringCards.has(idx)) recoveringCards.delete(idx);
                        else recoveringCards.add(idx);
                        updateDiscardModalUI();
                    });
                }
                els.discardList.appendChild(item);
            });
        }
    }

    // 捨札回収モーダルを開く
    els.btnDiscardView.addEventListener('click', () => {
        recoveringCards.clear();
        updateDiscardModalUI();
        els.discardModal.classList.remove('hidden');
    });

    // 廃棄札確認（山札・手札へ戻す）を開く
    els.btnVoidView?.addEventListener('click', () => {
        if (player.deck.void.length === 0) {
            alert('廃棄札がありません。');
            return;
        }
        window.dispatchEvent(new CustomEvent('requestRecoverCard', {
            detail: {
                title: "廃棄札確認",
                desc: "山札に戻すカードを1枚選んでください。（キャンセルする場合は右上の×か外側をクリック）",
                playerObj: player,
                source: 'void',
                filterFunc: (c) => true,
                onSelect: (selectedCard) => {
                    // 山札（deck）の一番下（もしくはシャッフル）に戻す
                    player.deck.cards.push(selectedCard);
                    logMsg(`廃棄札から「${selectedCard.name}」を山札に戻しました。`);
                    updateUI();
                }
            }
        }));
    });

    document.getElementById('btn-execute-recover').addEventListener('click', () => {
        if (recoveringCards.size === 0) return;
        
        // idxの降順で処理しないとspliceでズレるため、降順ソート
        const sortedIndices = Array.from(recoveringCards).sort((a, b) => b - a);
        let recoveredNames = [];
        for (const idx of sortedIndices) {
            const card = player.deck.discard[idx];
            player.deck.discard.splice(idx, 1);
            player.deck.hand.push(card);
            recoveredNames.push(card.name);
        }
        logMsg(`捨札から ${recoveredNames.length}枚 回収しました！<br><small>(${recoveredNames.join(', ')})</small>`);
        els.discardModal.classList.add('hidden');
        
        // パッシブ「武術家」のチェック
        const hasBujutsuka = player.deck.passives.some(p => p.name === '武術家' || p.effect.includes('回収タイミングで肉体カテゴリーのコスト3以下'));
        if (hasBujutsuka) {
            const validCards = player.deck.discard.filter(c => c.category.includes('肉体') && c.cost <= 3);
            if (validCards.length > 0) {
                window.dispatchEvent(new CustomEvent('requestBujutsukaRecover', {
                    detail: { playerObj: player }
                }));
                return; // updateUIはモーダル完了後に呼ぶ
            }
        }
        
        updateUI();
    });
    
    els.btnCloseDiscard.addEventListener('click', () => {
        els.discardModal.classList.add('hidden');
    });

    // カード詳細モーダル
    els.btnCloseModal.addEventListener('click', () => {
        els.modal.classList.add('hidden');
    });

    const btnDiscardCard = document.getElementById('btn-discard-card');
    if (btnDiscardCard) {
        btnDiscardCard.addEventListener('click', () => {
            if (selectedCardIndex !== null) {
                const card = player.deck.hand[selectedCardIndex];
                player.deck.hand.splice(selectedCardIndex, 1);
                player.deck.discard.push(card);
                logMsg(`手札から「${card.name}」を捨札に送りました。`);
                els.modal.classList.add('hidden');
                updateUI();
            }
        });
    }
    
    els.btnUseCard.addEventListener('click', () => {
        if (selectedCardIndex !== null) {
            const card = player.deck.hand[selectedCardIndex];
            
            // プレイ条件チェック
            if (card.name === '血の咆哮') {
                const voidCount = player.deck.void.length;
                const hasZeroStat = player.stats.body.currentVal === 0 || 
                                    player.stats.int.currentVal === 0 || 
                                    player.stats.men.currentVal === 0;
                if (voidCount < 2 && !hasZeroStat) {
                    alert('【血の咆哮】は廃棄札が2枚以上、もしくは能力値が0になっている場合のみ使用可能です。');
                    return;
                }
            }

            if (card.effect.includes('単独で使用することができない')) {
                if (currentCombo.length === 0) {
                    alert(`【${card.name}】は単独で使用することができません。ダメージを発生させるカードの次に出してください。`);
                    return;
                }
                const prevCard = currentCombo[currentCombo.length - 1];
                const prevDmg = calculateDamageFromCards([prevCard], player);
                if (prevDmg <= 0 && !prevCard.effect.includes('ダメージ')) {
                    alert(`【${card.name}】はダメージを発生させるカードの次にしか出せません。`);
                    return;
                }
            }
            
            player.deck.hand.splice(selectedCardIndex, 1); 
            player.deck.discard.push(card); 
            currentCombo.push(card);
            logMsg(`「${card.name}」を場に出した！`);
            
            // 汎用ドロー効果（山札からX枚引く）
            const drawMatch = card.effect.match(/山札から([0-9０-９]+)枚引く/);
            if (drawMatch) {
                const drawCount = parseInt(drawMatch[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
                let drawnNames = [];
                for (let i = 0; i < drawCount; i++) {
                    if (player.deck.mountain.length > 0) {
                        const drawn = player.deck.mountain.shift();
                        player.deck.hand.push(drawn);
                        drawnNames.push(drawn.name);
                    }
                }
                if (drawnNames.length > 0) {
                    logMsg(`【${card.name}】の効果で山札から ${drawnNames.length}枚 引きました！<br><small>(${drawnNames.join(', ')})</small>`, 'important');
                } else {
                    logMsg(`【${card.name}】の効果：山札がありませんでした。`);
                }
            }

            if (card.name === '風読み' || card.effect.includes('イニシアチブフェイズに山札から1枚引き')) {
                if (player.deck.mountain.length > 0) {
                    const drawnCard = player.deck.mountain.shift();
                    window.dispatchEvent(new CustomEvent('requestKazeyomiSelection', {
                        detail: { drawnCard, playerObj: player }
                    }));
                } else {
                    logMsg(`【${card.name}】の効果：山札がありませんでした。`);
                }
            }
            
            els.modal.classList.add('hidden');
            updateUI();
        }
    });

    els.btnComboClose.addEventListener('click', () => els.modal.classList.add('hidden'));
    if (els.btnSetCard) {
        els.btnSetCard.addEventListener('click', () => {
            if (selectedCardIndex !== null) {
                const card = player.deck.hand[selectedCardIndex];
                
                const setCards = currentCombo.filter(c => c.isSetReaction);
                if (setCards.length >= 1) {
                    alert('「闘禅一致」の効果でセットできるのは1枚までです。');
                    return;
                }
                
                player.deck.hand.splice(selectedCardIndex, 1);
                player.deck.discard.push(card);
                
                const clonedCard = { ...card };
                clonedCard.isSetReaction = true;
                currentCombo.push(clonedCard);
                
                logMsg(`「${card.name}」を闘禅一致の効果でリアクションとして配置しました。`);
                
                els.modal.classList.add('hidden');
                updateUI();
            }
        });
    }
    
    els.btnComboReturn.addEventListener('click', () => {
        if (selectedCardIndex !== null) {
            const card = currentCombo[selectedCardIndex];
            currentCombo.splice(selectedCardIndex, 1);
            delete card.isSetReaction;
            
            if (card._fromDiscard) {
                // 捨札から出していた場合は、手札ではなく捨札に戻る（すでにdiscard配列にはある）
                delete card._fromDiscard;
                logMsg(`「${card.name}」を捨札に戻しました。`);
            } else {
                // 通常はdiscardから削除してhandに戻す
                const discardIdx = player.deck.discard.lastIndexOf(card);
                if (discardIdx > -1) {
                    player.deck.discard.splice(discardIdx, 1);
                }
                player.deck.hand.push(card);
                logMsg(`「${card.name}」を手札に戻しました。`);
            }
            
            els.modal.classList.add('hidden');
            updateUI();
        }
    });

    els.btnComboLeft.addEventListener('click', () => {
        if (selectedCardIndex !== null && selectedCardIndex > 0) {
            const temp = currentCombo[selectedCardIndex - 1];
            currentCombo[selectedCardIndex - 1] = currentCombo[selectedCardIndex];
            currentCombo[selectedCardIndex] = temp;
            openCardModal(currentCombo[selectedCardIndex - 1], selectedCardIndex - 1, false, true);
            updateUI();
        }
    });

    els.btnComboRight.addEventListener('click', () => {
        if (selectedCardIndex !== null && selectedCardIndex < currentCombo.length - 1) {
            const temp = currentCombo[selectedCardIndex + 1];
            currentCombo[selectedCardIndex + 1] = currentCombo[selectedCardIndex];
            currentCombo[selectedCardIndex] = temp;
            openCardModal(currentCombo[selectedCardIndex + 1], selectedCardIndex + 1, false, true);
            updateUI();
        }
    });

    // --- 風読みの処理 ---
    let kazeyomiPendingCard = null;
    window.addEventListener('requestKazeyomiSelection', (e) => {
        const { drawnCard } = e.detail;
        kazeyomiPendingCard = drawnCard;
        
        const modal = document.getElementById('kazeyomi-modal');
        const display = document.getElementById('kazeyomi-card-display');
        
        display.innerHTML = `<strong>${drawnCard.name}</strong><br><small>${drawnCard.category}</small><br>コスト: ${drawnCard.cost} / 強度: ${drawnCard.power}<br><span style="font-size:0.8rem; color:#aaa;">${drawnCard.effect}</span>`;
        modal.classList.remove('hidden');
    });

    document.getElementById('btn-kazeyomi-hand')?.addEventListener('click', () => {
        if (kazeyomiPendingCard) {
            player.deck.hand.push(kazeyomiPendingCard);
            logMsg(`【風読み】引いたカード「${kazeyomiPendingCard.name}」を手札に加えました。`);
            kazeyomiPendingCard = null;
        }
        document.getElementById('kazeyomi-modal').classList.add('hidden');
        updateUI();
    });

    document.getElementById('btn-kazeyomi-discard')?.addEventListener('click', () => {
        if (kazeyomiPendingCard) {
            player.deck.discard.push(kazeyomiPendingCard);
            const bonus = kazeyomiPendingCard.cost;
            player.initiativeModifier = (player.initiativeModifier || 0) + bonus;
            logMsg(`【風読み】引いたカード「${kazeyomiPendingCard.name}」を捨札にしました。イニシアチブ＋${bonus}！`, 'important');
            kazeyomiPendingCard = null;
        }
        document.getElementById('kazeyomi-modal').classList.add('hidden');
        updateUI();
    });

    // --- 汎用回収イベント（捨札/廃棄札） ---
    window.addEventListener('requestRecoverCard', (e) => {
        const { filterFunc, title, desc, onSelect, playerObj, source } = e.detail;
        const sourceArray = source === 'void' ? playerObj.deck.void : playerObj.deck.discard;
        const validCards = sourceArray.filter(filterFunc);
        
        const modal = document.getElementById('select-discard-modal');
        const listDiv = document.getElementById('select-discard-list');
        document.getElementById('select-discard-title').innerText = title || "カードを選択";
        document.getElementById('select-discard-desc').innerText = desc || "カードを1枚選んでください。";
        
        listDiv.innerHTML = '';
        if (validCards.length === 0) {
            listDiv.innerHTML = '<p style="color:#aaa;">対象のカードがありません。</p>';
        } else {
            validCards.forEach(card => {
                const item = document.createElement('div');
                item.className = 'discard-item';
                const hasMadanjushi = playerObj.deck.passives.some(p => p.name === '魔弾銃士');
                const isBullet = card.effect.includes('弾丸');
                let costDisplay = `コスト: ${card.cost}`;
                if (hasMadanjushi && isBullet) {
                    costDisplay = `コスト: <span style="text-decoration: line-through;">${card.cost}</span> <span style="color:#ffcc00;">${Math.max(0, card.cost - 1)}</span> <span style="color:#ffcc00; font-size:0.7rem;">(魔弾)</span>`;
                }

                item.innerHTML = `
                    <div><strong>${card.name}</strong><br><small style="color:#aaa;">${card.category}</small></div>
                    <div style="text-align:right;">
                        <div>${costDisplay}</div>
                        <button class="btn btn-primary" style="font-size:0.7rem; padding:2px 5px; margin-top:5px; width:100%;">選択</button>
                    </div>
                `;
                item.addEventListener('click', () => {
                    const idx = sourceArray.lastIndexOf(card);
                    if (idx > -1) {
                        sourceArray.splice(idx, 1);
                    }
                    modal.classList.add('hidden');
                    if (onSelect) onSelect(card);
                    updateUI();
                });
                listDiv.appendChild(item);
            });
        }
        modal.classList.remove('hidden');
    });

    document.getElementById('btn-close-select-discard')?.addEventListener('click', () => {
        document.getElementById('select-discard-modal').classList.add('hidden');
    });
}

function updateUI() {
    els.statBody.innerText = `${player.stats.body.currentVal}/${player.stats.body.maxVal}`;
    els.statInt.innerText = `${player.stats.int.currentVal}/${player.stats.int.maxVal}`;
    els.statMen.innerText = `${player.stats.men.currentVal}/${player.stats.men.maxVal}`;
    els.statInit.innerText = player.initiative;
    
    els.passiveArea.innerHTML = '';
    if (player.deck.passives.length > 0) {
        const groupedPassives = {};
        player.deck.passives.forEach(card => {
            if (!groupedPassives[card.name]) {
                groupedPassives[card.name] = { 
                    card: card,
                    name: card.name,
                    strength: card.strength,
                    count: 1
                };
            } else {
                groupedPassives[card.name].strength += card.strength;
                groupedPassives[card.name].count++;
            }
        });

        Object.values(groupedPassives).forEach(group => {
            const pDiv = document.createElement('div');
            pDiv.className = 'passive-card';
            pDiv.innerHTML = `<strong>${group.name}${group.count > 1 ? ` x${group.count}` : ''}</strong> (強度+${group.strength})`;
            pDiv.addEventListener('click', () => {
                openCardModal(group.card, -1, true); // isPassive = true
            });
            els.passiveArea.appendChild(pDiv);
        });
    } else {
        els.passiveArea.innerHTML = '<span style="color:#555; font-size:0.75rem;">なし</span>';
    }
    
    // 召喚エリアの描画
    els.summonArea.innerHTML = '';
    if (player.deck.summons.length > 0) {
        player.deck.summons.forEach((s, idx) => {
            let atk = "?", def = "?";
            const match = s.card.effect.match(/攻(\d+)\s*[／/]\s*(?:防)?(\d+)/);
            if (match) {
                atk = match[1];
                def = match[2];
            }
            
            const sDiv = document.createElement('div');
            sDiv.className = 'summon-card';
            sDiv.innerHTML = `
                <div class="summon-card-header" style="cursor: pointer;">
                    <span class="summon-card-name">${s.card.name}</span>
                    <span class="summon-card-stats">攻${atk}/防${def}</span>
                </div>
                <div class="summon-controls">
                    <button class="summon-btn btn-atk ${s.stance === 'attack' || s.stance === 'both' ? 'active-attack' : ''}">攻撃</button>
                    <button class="summon-btn btn-def ${s.stance === 'defend' || s.stance === 'both' ? 'active-defend' : ''}">防御</button>
                    <button class="summon-btn summon-btn-dismiss">廃棄</button>
                </div>
            `;
            
            sDiv.querySelector('.summon-card-header').addEventListener('click', () => {
                openCardModal(s.card, -1, true); // isPassive=trueとして扱い、「使用する」ボタンを非表示にする
            });
            
            sDiv.querySelector('.btn-atk').addEventListener('click', () => {
                if (s.card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる')) {
                    if (s.stance === 'defend' || s.stance === 'both') s.stance = 'both';
                    else s.stance = 'both';
                } else {
                    s.stance = 'attack';
                }
                updateUI();
            });
            sDiv.querySelector('.btn-def').addEventListener('click', () => {
                if (s.card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる')) {
                    if (s.stance === 'attack' || s.stance === 'both') s.stance = 'both';
                    else s.stance = 'both';
                } else {
                    s.stance = 'defend';
                }
                updateUI();
            });
            sDiv.querySelector('.summon-btn-dismiss').addEventListener('click', () => {
                if (confirm(`${s.card.name} を廃棄してよろしいですか？`)) {
                    player.deck.summons.splice(idx, 1);
                    player.deck.discard.push(s.card);
                    updateUI();
                }
            });
            
            els.summonArea.appendChild(sDiv);
        });
    } else {
        els.summonArea.innerHTML = '<span style="color:#555; font-size:0.75rem;">なし</span>';
    }

    // コンボエリアの描画
    const comboArea = document.getElementById('combo-area');
    comboArea.innerHTML = '';
    if (currentCombo.length > 0) {
        currentCombo.forEach((card, comboIdx) => {
            const cDiv = document.createElement('div');
            cDiv.className = 'passive-card';
            if (card.isSetReaction) {
                cDiv.style.borderColor = '#ffcc00';
                cDiv.innerHTML = `<strong><span style="color:#ffcc00;">[セット]</span> ${card.name}</strong><br><small>コスト${card.cost}</small>`;
            } else {
                cDiv.style.borderColor = '#ff5252';
                cDiv.innerHTML = `<strong>${card.name}</strong><br><small>コスト${card.cost}</small>`;
            }
            cDiv.addEventListener('click', () => {
                openCardModal(card, comboIdx, false, true); // isCombo=true
            });
            comboArea.appendChild(cDiv);
        });
    } else {
        comboArea.innerHTML = '<span style="color:#555; font-size:0.75rem;">まだカードが出されていません</span>';
    }

    if (els.maxHandSizeDisplay) els.maxHandSizeDisplay.innerText = player.maxHandSize;
    els.deckCount.innerText = player.deck.mountain.length;
    els.discardCount.innerText = player.deck.discard.length;
    els.voidCount.innerText = player.deck.void.length;
    
    els.enemyHp.innerText = Math.max(0, enemyHp);
    
    els.handContainer.innerHTML = '';
    player.deck.hand.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-cat">${card.category}</div>
            <div class="card-stats"><span>C:${card.cost}</span><span>S:+${card.strength}</span></div>
            <div class="card-effect">${card.effect}</div>
        `;
        cardDiv.addEventListener('click', () => openCardModal(card, index));
        cardDiv.style.zIndex = index;
        els.handContainer.appendChild(cardDiv);
    });

    // 戦闘不能の判定（山札、手札、コンボエリアがすべて空で、捨札もなく、攻撃可能な召喚もない場合）
    const hasAttackingSummons = player.deck.summons.some(s => s.stance === 'attack' || s.stance === 'both');
    const hasDiscardCards = player.deck.discard.length > 0;
    
    if (player.deck.mountain.length === 0 && player.deck.hand.length === 0 && currentCombo.length === 0 && !hasAttackingSummons && !hasDiscardCards) {
        if (!player.isDead) {
            logMsg('【戦闘不能】山札・手札・捨札がすべてなくなり、攻撃可能なユニットもいません。これ以上行動できません。', 'damage');
            player.isDead = true;
        }
        els.btnDraw.disabled = true;
        els.btnAttack.disabled = true;
        els.btnReact.disabled = true;
        els.btnRefresh.disabled = true;
        els.btnDiscardView.disabled = true;
        els.btnDraw.style.opacity = '0.5';
        els.btnAttack.style.opacity = '0.5';
        els.btnReact.style.opacity = '0.5';
        els.btnRefresh.style.opacity = '0.5';
        els.btnDiscardView.style.opacity = '0.5';
    } else {
        player.isDead = false;
        els.btnDraw.disabled = false;
        els.btnAttack.disabled = false;
        els.btnReact.disabled = false;
        els.btnRefresh.disabled = false;
        els.btnDiscardView.disabled = false;
        els.btnDraw.style.opacity = '1';
        els.btnAttack.style.opacity = '1';
        els.btnReact.style.opacity = '1';
        els.btnRefresh.style.opacity = '1';
        els.btnDiscardView.style.opacity = '1';
    }

    // デバフ（持続効果）アラートの描画
    const debuffArea = document.getElementById('debuff-alert-area');
    if (debuffArea) {
        debuffArea.innerHTML = '';
        const hasIceBolt = player.deck.discard.some(c => c.name === 'アイスボルト');
        if (hasIceBolt) {
            debuffArea.innerHTML += `
                <div style="background-color: rgba(50, 100, 255, 0.2); border-left: 4px solid #4da6ff; padding: 5px; font-size: 0.8rem; color: #b3d9ff; border-radius: 3px;">
                    <strong>❄️ アイスボルト効果発動中！</strong><br>
                    対象の回収時のコストが全て＋1されています。
                </div>
            `;
        }
        
        const hasHyosetsu = player.deck.discard.some(c => c.name === '氷雪魔弾');
        if (hasHyosetsu) {
            const hasMadanjushi = player.deck.passives.some(p => p.name === '魔弾銃士');
            const str = hasMadanjushi ? 4 : 3;
            debuffArea.innerHTML += `
                <div style="background-color: rgba(50, 150, 255, 0.2); border-left: 4px solid #66b3ff; padding: 5px; font-size: 0.8rem; color: #cce6ff; border-radius: 3px;">
                    <strong>❄️ 氷雪魔弾効果発動中！</strong><br>
                    対象が <b>コスト${str} 以下</b> のカードを回収する際、コストが＋1されます。
                </div>
            `;
        }
    }
}

function showDamagePopup(dmg) {
    const popup = document.createElement('div');
    popup.className = 'damage-popup';
    popup.innerText = `${dmg} DMG`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1300);
}

function openCardModal(card, index, isPassive = false, isCombo = false) {
    selectedCardIndex = index;
    els.mTitle.innerText = card.name;
    els.mCat.innerText = card.category;
    els.mCost.innerText = card.cost;
    els.mStr.innerText = card.strength;
    els.mDesc.innerHTML = card.effect;
    
    if (isCombo) {
        els.normalActions.classList.add('hidden');
        els.comboActions.classList.remove('hidden');
        els.btnComboLeft.disabled = index === 0;
        els.btnComboLeft.style.opacity = index === 0 ? '0.5' : '1';
        els.btnComboRight.disabled = index === currentCombo.length - 1;
        els.btnComboRight.style.opacity = index === currentCombo.length - 1 ? '0.5' : '1';
    } else {
        els.comboActions.classList.add('hidden');
        els.normalActions.classList.remove('hidden');
        if (isPassive) {
            els.btnUseCard.classList.add('hidden');
            if (els.btnSetCard) els.btnSetCard.classList.add('hidden');
        } else {
            els.btnUseCard.classList.remove('hidden');
            if (els.btnSetCard) {
                const hasTouzen = player.deck.passives.some(p => p.name === '闘禅一致');
                if (hasTouzen && card.category.includes('アクション')) {
                    els.btnSetCard.classList.remove('hidden');
                } else {
                    els.btnSetCard.classList.add('hidden');
                }
            }
        }
    }
    
    els.modal.classList.remove('hidden');
}

// Start
init();


    // 山札へ戻すモーダルのリスナー
    window.addEventListener('requestZanshinReturn', (e) => {
        const { actionCardIndexes, combo, callback } = e.detail;
        const modal = document.getElementById('zanshin-modal');
        const step1 = document.getElementById('zanshin-step1');
        const step2 = document.getElementById('zanshin-step2');
        const list = document.getElementById('zanshin-list');
        const btnYes = document.getElementById('btn-zanshin-yes');
        const btnNo = document.getElementById('btn-zanshin-no');
        const btnSkip = document.getElementById('btn-skip-zanshin');
        
        step1.classList.remove('hidden');
        step2.classList.add('hidden');
        
        btnYes.onclick = () => {
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
            
            list.innerHTML = '';
            actionCardIndexes.forEach(idx => {
                const card = combo[idx];
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `<div class="card-title">${card.name} (コスト${card.cost})</div><div class="card-effect">${card.effect}</div>`;
                div.addEventListener('click', () => {
                    modal.classList.add('hidden');
                    callback(idx);
                });
                list.appendChild(div);
            });
        };
        
        btnNo.onclick = () => {
            modal.classList.add('hidden');
            callback(-1);
        };
        
        btnSkip.onclick = () => {
            modal.classList.add('hidden');
            callback(-1);
        };
        
        modal.classList.remove('hidden');
    });
