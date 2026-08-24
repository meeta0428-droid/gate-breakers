import { Character, calculateDamageFromCards, calculateDefenseFromCards, executeCardEffects, triggerHook } from './game_logic_v9.js?v=258';

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
    psychometryArea: document.getElementById('psychometry-area'),
    psychometryContainer: document.getElementById('psychometry-container'),
    
    // Buttons
    btnDraw: document.getElementById('btn-draw'),
    btnDiscardView: document.getElementById('btn-discard-view'),
    btnVoidView: document.getElementById('btn-void-view'),
    btnRefresh: document.getElementById('btn-refresh'),
    btnAttack: document.getElementById('btn-attack'),
    btnReact: document.getElementById('btn-react'),
    incomingDmg: document.getElementById('incoming-dmg'),
    chkIgnoreDef: document.getElementById('chk-ignore-def'),
    chkAttackFromOpen: document.getElementById('chk-attack-from-open'),
    chkEnemyNoReact: document.getElementById('chk-enemy-no-react'),
    chkEnemyOpen: document.getElementById('chk-enemy-open'),
    
    // Navigation
    btnDeckToChara: document.getElementById('btn-deck-to-chara'),
    btnBattleToChara: document.getElementById('btn-battle-to-chara'),
    btnShareStatus: document.getElementById('btn-share-status'),
    btnToggleMode: document.getElementById('btn-toggle-mode'),
    btnOpenDiscordModal: document.getElementById('btn-open-discord-modal'),
    discordModal: document.getElementById('discord-modal'),
    discordWebhookUrl: document.getElementById('discord-webhook-url'),
    btnSaveDiscord: document.getElementById('btn-save-discord'),
    btnCloseDiscordModal: document.getElementById('btn-close-discord-modal'),
    attackConfirmModal: document.getElementById('attack-confirm-modal'),
    attackConfirmList: document.getElementById('attack-confirm-list'),
    btnConfirmAttackFinal: document.getElementById('btn-confirm-attack-final'),
    btnCancelAttackConfirm: document.getElementById('btn-cancel-attack-confirm'),
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
    btnTriggerPassive: document.getElementById('btn-trigger-passive'),
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
let isGeneralMode = false;

function sendDiscordWebhook(msgHtml) {
    const webhookUrl = localStorage.getItem('discordWebhookUrl');
    if (!webhookUrl) return;

    // HTMLタグを取り除いてプレーンテキストに（簡易的）
    let plainMsg = msgHtml.replace(/<br\s*\/?>/ig, '\n');
    plainMsg = plainMsg.replace(/<\/?[^>]+(>|$)/g, "");
    
    // 文字実体参照の戻し（必要最低限）
    plainMsg = plainMsg.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

    const payload = {
        content: plainMsg
    };

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).catch(e => console.error("Discord Webhook Error:", e));
}

function getDisplayCost(card, playerObj) {
    if (!playerObj || !playerObj.deck) return card.cost;
    let displayCost = card.cost;
    
    // 魔導杖ウィル
    const hasWill = playerObj.deck.passives.some(p => p.name === '魔導杖ウィル');
    if (hasWill && card.category.includes('知性') && card.category.includes('アクション')) {
        displayCost = Math.max(0, displayCost - 1);
    }
    
    // 魔弾銃士
    const hasMadanjushi = playerObj.deck.passives.some(p => p.name === '魔弾銃士');
    if (hasMadanjushi && card.effect.includes('弾丸')) {
        displayCost = Math.max(0, displayCost - 1);
    }
    
    return displayCost;
}

function logMsg(msg, type = '') {
    const p = document.createElement('p');
    const playerName = (typeof player !== 'undefined' && player.name) ? player.name : 'プレイヤー';
    const prefix = `[${playerName}] `;
    
    p.innerHTML = `<span style="color:#aaa; font-size:0.75rem;">${prefix}</span>` + msg;
    if (type) p.classList.add(type);
    els.log.prepend(p);
    
    sendDiscordWebhook(prefix + msg);
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
    
    player.name = slot.name || `スロット${slotIndex}`;
    selectedCardsForDeck = [];
    for (const name of slot.cards) {
        let cardName = name;
        if (cardName === '獣の共鳴') cardName = '獣操棍';
        
        const cardData = cardPool.find(c => c.name === cardName);
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
    
    const filterAttr = document.getElementById('filter-attr') ? document.getElementById('filter-attr').value : 'all';
    const filterType = document.getElementById('filter-type') ? document.getElementById('filter-type').value : 'all';
    const sortCost = document.getElementById('sort-cost') ? document.getElementById('sort-cost').value : 'default';

    let displayPool = [...cardPool];

    if (filterAttr !== 'all') {
        displayPool = displayPool.filter(c => c.category.includes(filterAttr));
    }
    
    if (filterType !== 'all') {
        displayPool = displayPool.filter(c => c.category.includes(filterType));
    }

    if (sortCost === 'asc') {
        displayPool.sort((a, b) => a.cost - b.cost);
    } else if (sortCost === 'desc') {
        displayPool.sort((a, b) => b.cost - a.cost);
    }
    
    displayPool.forEach(card => {
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
            if (card.effect.includes('制限：デッキ1枚') || card.effect.includes('【制限：デッキ1枚')) {
                if (selectedCardsForDeck.some(c => c.name === card.name)) {
                    alert(`「${card.name}」はデッキに1枚しか入れられません。`);
                    return;
                }
            }
            
            // 「ブーステッド」選択時の特別ルール
            const hasBoosted = selectedCardsForDeck.some(c => c.name === '『ブーステッド』');
            
            const isProhibitedByBoosted = (c) => {
                if (c.effect && c.effect.includes('【メビウス専用】')) return false; // 専用カードは許可
                
                // コスト4以上の アクション・リアクション・召喚・弾丸 を禁止
                const isTargetCat = c.category.includes('アクション') || c.category.includes('リアクション') || c.category.includes('召喚') || c.category.includes('弾丸');
                if (isTargetCat && c.cost >= 4) {
                    return true;
                }
                return false;
            };
            
            if (card.name === '『ブーステッド』') {
                const originalLength = selectedCardsForDeck.length;
                selectedCardsForDeck = selectedCardsForDeck.filter(c => !isProhibitedByBoosted(c));
                if (selectedCardsForDeck.length < originalLength) {
                    alert('【ブーステッド制限】デッキに入っていたコスト4以上の対象カード（アクション/リアクション/召喚/弾丸）を自動除外しました。');
                }
            } else if (hasBoosted) {
                if (isProhibitedByBoosted(card)) {
                    alert('【ブーステッド制限】コスト4以上の対象カード（アクション/リアクション/召喚/弾丸）はデッキに追加できません。');
                    return;
                }
            }
            
            selectedCardsForDeck.push(card);
            renderSelectedDeck();
        });
        els.cardPoolList.appendChild(div);
    });
}

// フィルター・ソート用のイベントリスナーを登録
setTimeout(() => {
    const attrSel = document.getElementById('filter-attr');
    const typeSel = document.getElementById('filter-type');
    const costSel = document.getElementById('sort-cost');
    if (attrSel) attrSel.addEventListener('change', renderCardPool);
    if (typeSel) typeSel.addEventListener('change', renderCardPool);
    if (costSel) costSel.addEventListener('change', renderCardPool);
}, 100);

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
        player._alchemistUsed = false; // 1ラウンド1回の制限をリセット
        logMsg(`イニシアチブを手動で−1しました（調整値: ${player.initiativeModifier >= 0 ? '+' : ''}${player.initiativeModifier}）`);
        updateUI();
    });

    document.getElementById('btn-manual-heal').addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('requestStatHeal', {
            detail: {
                amount: 1,
                playerObj: player,
                desc: "【味方からの回復・手動回復】回復する能力値を1つ選んでください。（各1点回復）"
            }
        }));
    });

    // バトル開始ボタン
    els.btnStartBattle.addEventListener('click', () => {
        const currentCost = selectedCardsForDeck.reduce((sum, c) => sum + c.cost, 0);
        if (selectedCardsForDeck.length === 0) {
            alert('カードを選択してください！');
            return;
        }
        
        // ウィスプ（他召喚カードを所有）のバリデーション
        const wispCards = selectedCardsForDeck.filter(c => c.name === 'ウィスプ');
        if (wispCards.length > 0) {
            const hasOtherSummon = selectedCardsForDeck.some(c => c.name !== 'ウィスプ' && (c.category.includes('召喚') || c.effect.includes('召喚・攻')));
            if (!hasOtherSummon) {
                alert('【制限】「ウィスプ」をデッキに入れるには、他に「召喚」カードを入れる必要があります。');
                return;
            }
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
        player._boostedUsed = false;
        
        logMsg('戦闘開始！パッシブカードは自動的に装備されました。', 'important');
        
        // 忍者パッシブの戦闘開始時効果（重複しない）
        const hasNinja = player.deck.passives.some(p => p.name === '忍者' && !p.isDisabled);
        if (hasNinja) {
            const drawn = player.deck.draw(1);
            if (drawn > 0) {
                logMsg(`【忍者】の効果発動！戦闘開始時に山札から1枚引いた！`, 'important');
            }
        }
        
        updateUI();
    });

    // 任意のタイミングで1枚手動ドローする機能（味方からの効果など）
    const btnManualDraw = document.getElementById('btn-manual-draw');
    if (btnManualDraw) {
        btnManualDraw.addEventListener('click', () => {
            if (player.deck.mountain.length > 0) {
                if (confirm('山札から1枚ドローしますか？（※味方からの効果用などの手動ドロー）')) {
                    player.deck.draw(1);
                    logMsg('手動で山札から1枚ドローしました！', 'important');
                    updateUI();
                }
            } else {
                alert('山札がありません。');
            }
        });
    }

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
        
        // 新ラウンド開始時に各ターン1回フラグをリセット
        player.deck.hasUsedCyomancer = false;
        player.deck.hasUsedKyoudousensen = false;
        player._undeadUsed = false;
        
        updateUI();
    });
    
    // 手動ダメージ補正UIの制御
    let manualDmgBonus = 0;
    const btnManualMinus = document.getElementById('btn-manual-dmg-minus');
    const btnManualPlus = document.getElementById('btn-manual-dmg-plus');
    const manualDmgVal = document.getElementById('manual-dmg-val');
    
    if (btnManualMinus && btnManualPlus && manualDmgVal) {
        btnManualMinus.addEventListener('click', () => {
            manualDmgBonus--;
            manualDmgVal.innerText = manualDmgBonus;
        });
        btnManualPlus.addEventListener('click', () => {
            manualDmgBonus++;
            manualDmgVal.innerText = manualDmgBonus;
        });
    }
    
    // 攻撃実行
    
    const doAttackProcess = (isPreview = false, gatlingBonus = 0, halberdBonus = 0) => {
        let hasAttackingSummons = player.deck.summons.some(s => s.stance === 'attack' || s.stance === 'both');
        
        // setCards は preview 時にも分離し、final 時にも分離する。
        // final時にはすでに preview 時点で分離されている可能性もあるが安全のため。
        const setCards = currentCombo.filter(c => c.isSetReaction);
        currentCombo = currentCombo.filter(c => !c.isSetReaction);
        
        if (currentCombo.length === 0 && !hasAttackingSummons) {
            logMsg('出すカードがありません。手札からアクションカードを選ぶか、攻撃可能な召喚ユニットを用意してください。');
            currentCombo = [...currentCombo, ...setCards];
            return;
        }

        if (isGeneralMode) {
            let logs = [];
            currentCombo.forEach(c => {
                let statVal = 0;
                let statName = 'なし';
                let passiveBonus = 0;
                
                const getPassiveBonus = (categoryFilter) => {
                    return player.deck.passives.reduce((sum, p) => {
                        if (p.isDisabled) return sum; // 無効化されている場合は加算しない
                        if (p.category.includes(categoryFilter) || p.category.includes('全て')) {
                            return sum + (p.strength || 0);
                        }
                        return sum;
                    }, 0);
                };

                if (c.category.includes('肉体')) { 
                    statVal = player.stats.body.maxVal; 
                    statName = '肉体'; 
                    passiveBonus = getPassiveBonus('肉体');
                }
                else if (c.category.includes('知性')) { 
                    statVal = player.stats.int.maxVal; 
                    statName = '知性'; 
                    passiveBonus = getPassiveBonus('知性');
                }
                else if (c.category.includes('精神')) { 
                    statVal = player.stats.men.maxVal; 
                    statName = '精神'; 
                    passiveBonus = getPassiveBonus('精神');
                }
                else if (c.category.includes('全て')) {
                    const bTotal = player.stats.body.maxVal + getPassiveBonus('肉体');
                    const iTotal = player.stats.int.maxVal + getPassiveBonus('知性');
                    const mTotal = player.stats.men.maxVal + getPassiveBonus('精神');
                    const maxTotal = Math.max(bTotal, iTotal, mTotal);
                    
                    if (maxTotal === bTotal) {
                        statVal = player.stats.body.maxVal; statName = '最大(肉体)'; passiveBonus = getPassiveBonus('肉体');
                    } else if (maxTotal === iTotal) {
                        statVal = player.stats.int.maxVal; statName = '最大(知性)'; passiveBonus = getPassiveBonus('知性');
                    } else {
                        statVal = player.stats.men.maxVal; statName = '最大(精神)'; passiveBonus = getPassiveBonus('精神');
                    }
                }
                
                const str = c.strength || 0;
                const total = statVal + str + passiveBonus;
                logs.push(`・「${c.name}」：判定結果 <b style="color:#00ffff; font-size:1.1rem;">${total}</b> （${statName} ${statVal} ＋ 強度 ${str} ＋ パッシブ補正 ${passiveBonus}）`);
                
                if (/このカードは.*?廃棄札.*?移動する/.test(c.effect)) {
                    // Preview時には移動させない
                    if (!isPreview) {
                        const discardIdx = player.deck.discard.lastIndexOf(c);
                        if (discardIdx > -1) {
                            player.deck.discard.splice(discardIdx, 1);
                            player.deck.void.push(c);
                        }
                    }
                    logs.push(`　┗「${c.name}」は効果により廃棄札に移動した。`);
                }
            });
            logMsg(`【一般判定】<br>${logs.join('<br>')}`, 'important');
            currentCombo = [...setCards]; // セットカードは維持
            updateUI();
            return;
        }
        
        // --- プレビュー時用のダミーlogMsg ---
        const originalLogMsg = logMsg;
        let tempLogs = [];
        const dummyLogMsg = (msg, type) => {
            tempLogs.push({msg, type});
        };
        const currentLogMsg = isPreview ? dummyLogMsg : originalLogMsg;
        
        const dmg = calculateDamageFromCards(currentCombo, player);
        const { toVoid } = executeCardEffects(currentCombo, player, currentLogMsg);
        
        let nextCardBonus = 0;
        let continuousBonus = 0;
        const cardLogs = currentCombo.map((c, idx) => {
            let detail = '';
            let currentCardDmg = 0;
            
            const match = c.effect.match(/ダメージ[＋\+](\d+)/);
            if (match) currentCardDmg += parseInt(match[1]);
            
            if (c.name === 'ロックオンアサルト' && player.deck.summons.length > 0) {
                currentCardDmg += 2;
                detail += `（召喚配置ボーナス＋2 🎯任意のカードにダメージ）`;
            }
            
            if (c.name === '獣の戦意' && player.deck.summons.length > 0) {
                let maxStr = 0;
                let targetName = '';
                player.deck.summons.forEach(s => {
                    if (s.card.strength > maxStr) {
                        maxStr = s.card.strength;
                        targetName = s.card.name;
                    }
                });
                if (maxStr > 0) {
                    currentCardDmg += maxStr;
                    detail += `（召喚「${targetName}」の強度ボーナス＋${maxStr}）`;
                }
            }
            
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
            
            const hasCyomancer = player.deck.passives.some(p => p.name === 'サイオマンサー' && !p.isDisabled);
            if (hasCyomancer && c.category.includes('精神') && c.category.includes('アクション')) {
                currentCardDmg += 1;
                detail += `（サイオマンサー＋1）`;
            }
            
            let isDamageCard = currentCardDmg > 0 || c.effect.includes('ダメージ');
            if (nextCardBonus > 0) {
                if (isDamageCard) {
                    detail += `（直前カードのボーナス＋${nextCardBonus}）`;
                    currentCardDmg += nextCardBonus;
                }
                nextCardBonus = 0; // いずれにせよボーナスは消費される
            }
            
            if (continuousBonus > 0 && isDamageCard) {
                detail += `（継続コンボボーナス＋${continuousBonus}）`;
                currentCardDmg += continuousBonus;
            }
            
            if (match) detail = `（基本ダメージ＋${match[1]}）` + detail;
            
            const nextMatch = c.effect.match(/この次のカードのダメージを[＋\+](\d+)/);
            if (nextMatch) {
                nextCardBonus += parseInt(nextMatch[1]);
                detail += `（次カードのダメージ＋${nextMatch[1]}）`;
            }
            
            const continuousMatch = c.effect.match(/コンボしたあらゆるカードのダメージが[＋\+](\d+)/);
            if (continuousMatch) {
                continuousBonus += parseInt(continuousMatch[1]);
                detail += `（これ以降のダメージに＋${continuousMatch[1]}）`;
            }
            
            if (!isDamageCard) {
                detail += `<br><span style="color:#aaa; font-size:0.8rem; margin-left:1em;">【効果】${c.effect}</span>`;
            }
            
            if (toVoid.has(idx)) detail += ` [廃棄へ]`;
            return `・「${c.name}」${detail}`;
        }).join('<br>');
        
        let summonDmg = 0;
        let summonLog = '';
        const honnouBuff = player.deck.discard.filter(c => c.name === '本能の覚醒').length * 2;
        const jusoBuff = player.deck.passives.filter(c => c.name === '獣操棍' && !c.isDisabled).length * 1;
        player.deck.summons.forEach(s => {
            if (s.stance === 'attack' || s.stance === 'both') {
                const match = s.card.effect.match(/攻(\d+)\s*[／/]\s*(?:防)?(\d+)/);
                if (match) {
                    let atk = parseInt(match[1]);
                    if (s.elementalerBuff) atk += 2 * s.elementalerBuff;
                    atk += honnouBuff + jusoBuff;
                    
                    summonDmg += atk;
                    let extraInfo = '';
                    if (s.card.name === 'サラマンダー' || s.card.name === 'ファントムレオ') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[リアクション不可]</span>';
                    }
                    if (s.card.name === '狂雷の凶鳥') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[リアクション不可]</span><br><span style="color:#ff5252; font-weight:bold;">※このユニットのダメージはリアクションすることができない！</span>';
                    }
                    if (s.card.name === 'フォレストコング') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[身代わり無視／狙い撃ち]</span>';
                    }
                    if (s.card.name === 'ミストストーカー') {
                        extraInfo = ' <span style="color:#ffcc00; font-weight:bold;">[「肉体」リアクション不可]</span>';
                    }
                    if (s.card.name === 'フリップサイド・ヒュドラ') {
                        extraInfo = '<br><span style="color:#ffcc00; font-weight:bold;">※『多頭の暴虐』：任意の対象全員に4点のダメージ！</span>';
                    }
                    if (s.card.name === '泥瘴の悪鬼') {
                        extraInfo = '<br><span style="color:#ff5252; font-weight:bold;">※任意の対象全ての回収ポイントを-1する！</span>';
                    }
                    summonLog += `・召喚「${s.card.name}」の追撃 (＋${atk})${extraInfo}<br>`;
                }
            }
        });
        
        let totalDmg = dmg + summonDmg;
        
        // --- フックシステムの呼び出し ---
        const activeCards = [...player.deck.passives, ...player.deck.summons, ...currentCombo];
        const hookContext = triggerHook('onAttack', { 
            totalDmg: totalDmg, 
            player: player,
            logMsg: currentLogMsg,
            enemyNoReact: els.chkEnemyNoReact.checked,
            enemyOpen: els.chkEnemyOpen ? els.chkEnemyOpen.checked : false,
            currentCombo: currentCombo,
            isPreview: isPreview
        }, activeCards);
        totalDmg = hookContext.totalDmg;
        
        let manualLog = '';
        if (gatlingBonus > 0) {
            totalDmg += gatlingBonus;
            manualLog += `<br><span style="color:#ffcc00; font-weight:bold;">（ガトリングガンの追加効果！ 捨札廃棄によりダメージ ＋${gatlingBonus}）</span>`;
        }
        if (halberdBonus > 0) {
            totalDmg += halberdBonus;
            manualLog += `<br><span style="color:#ffcc00; font-weight:bold;">（ハルバードの追加効果！ 手札から捨札へ移動によりダメージ ＋${halberdBonus}）</span>`;
        }
        if (manualDmgBonus !== 0) {
            totalDmg += manualDmgBonus;
            const sign = manualDmgBonus > 0 ? '＋' : '';
            manualLog = `<br><span style="color:#4caf50;">（味方からの効果補正 ${sign}${manualDmgBonus} を適用）</span>`;
        }

        const hasAllTarget = currentCombo.some(c => c.effect.includes('任意の対象全て') || c.effect.includes('任意の対象すべて'));
        const targetLog = hasAllTarget ? '<br><span style="color:#ffcc00; font-weight:bold;">【任意の対象すべてへの攻撃！】</span>' : '';

        const finalMsg = `使用カード:<br>${cardLogs}<br>${summonLog}コンボ発動！ 合計 <span class="damage">${totalDmg}</span> のダメージを与えた！${targetLog}${manualLog}`;

        if (isPreview) {
            // プレビュー時の処理：ログだけ流してモーダルを開く
            originalLogMsg(`【攻撃仮計算】<br>${finalMsg}`, 'important');
            
            // 効果ログなども出力する
            tempLogs.forEach(l => {
                originalLogMsg(`【仮効果】${l.msg}`, l.type);
            });
            
            // モーダルのリスト生成
            els.attackConfirmList.innerHTML = '';
            currentCombo.forEach((c, idx) => {
                const div = document.createElement('div');
                div.style.background = '#333';
                div.style.padding = '8px';
                div.style.marginBottom = '5px';
                div.style.borderRadius = '4px';
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.alignItems = 'center';
                
                const nameSpan = document.createElement('span');
                nameSpan.innerText = c.name;
                
                const select = document.createElement('select');
                select.className = 'confirm-action-select';
                select.dataset.idx = idx;
                select.innerHTML = `
                    <option value="normal">通常処理（効果通り）</option>
                    <option value="hand">手札に戻す（無効化等）</option>
                    <option value="discard">捨札にする</option>
                    <option value="void">廃棄札にする</option>
                `;
                
                div.appendChild(nameSpan);
                div.appendChild(select);
                els.attackConfirmList.appendChild(div);
            });
            
            // ガトリングガンの追加UI
            const hasGatling = player.deck.passives.some(p => p.name === 'ガトリングガン' && !p.isDisabled);
            if (hasGatling) {
                const gatlingDiv = document.createElement('div');
                gatlingDiv.style.marginTop = '15px';
                gatlingDiv.style.padding = '10px';
                gatlingDiv.style.border = '1px solid #ffcc00';
                gatlingDiv.style.borderRadius = '5px';
                gatlingDiv.innerHTML = `<h3 style="color:#ffcc00; margin-top:0; margin-bottom:10px; font-size:1rem;">【ガトリングガン】追加効果</h3>
                                        <p style="font-size:0.8rem; margin-bottom:10px;">捨札を廃棄して追加ダメージ（1枚につき＋3）</p>`;
                
                const discardListDiv = document.createElement('div');
                discardListDiv.style.maxHeight = '100px';
                discardListDiv.style.overflowY = 'auto';
                discardListDiv.style.background = '#222';
                discardListDiv.style.padding = '5px';
                
                const pureDiscard = player.deck.discard.filter(c => !currentCombo.includes(c));
                
                if (pureDiscard.length === 0) {
                    discardListDiv.innerHTML = '<span style="color:#aaa; font-size:0.8rem;">現在、廃棄できる捨札はありません。</span>';
                } else {
                    pureDiscard.forEach((c) => {
                        const label = document.createElement('label');
                        label.style.display = 'block';
                        label.style.fontSize = '0.9rem';
                        label.style.marginBottom = '3px';
                        
                        const cb = document.createElement('input');
                        cb.type = 'checkbox';
                        cb.className = 'gatling-discard-cb';
                        cb.dataset.idx = player.deck.discard.indexOf(c);
                        
                        label.appendChild(cb);
                        label.appendChild(document.createTextNode(' ' + c.name));
                        discardListDiv.appendChild(label);
                    });
                }
                
                gatlingDiv.appendChild(discardListDiv);
                els.attackConfirmList.appendChild(gatlingDiv);
            }
            
            // ハルバードの追加UI
            const hasHalberd = player.deck.passives.some(p => p.name === 'ハルバード' && !p.isDisabled);
            if (hasHalberd) {
                const halberdDiv = document.createElement('div');
                halberdDiv.style.marginTop = '15px';
                halberdDiv.style.padding = '10px';
                halberdDiv.style.border = '1px solid #ffcc00';
                halberdDiv.style.borderRadius = '5px';
                halberdDiv.innerHTML = `<h3 style="color:#ffcc00; margin-top:0; margin-bottom:10px; font-size:1rem;">【ハルバード】追加効果</h3>
                                        <p style="font-size:0.8rem; margin-bottom:10px;">手札を捨札にして追加ダメージ（1枚につき＋3）</p>`;
                
                const handListDiv = document.createElement('div');
                handListDiv.style.maxHeight = '100px';
                handListDiv.style.overflowY = 'auto';
                handListDiv.style.background = '#222';
                handListDiv.style.padding = '5px';
                
                if (player.deck.hand.length === 0) {
                    handListDiv.innerHTML = '<span style="color:#aaa; font-size:0.8rem;">現在、捨札にできる手札はありません。</span>';
                } else {
                    player.deck.hand.forEach((c) => {
                        const label = document.createElement('label');
                        label.style.display = 'block';
                        label.style.fontSize = '0.9rem';
                        label.style.marginBottom = '3px';
                        
                        const cb = document.createElement('input');
                        cb.type = 'checkbox';
                        cb.className = 'halberd-hand-cb';
                        cb.dataset.idx = player.deck.hand.indexOf(c);
                        
                        label.appendChild(cb);
                        label.appendChild(document.createTextNode(' ' + c.name));
                        handListDiv.appendChild(label);
                    });
                }
                
                halberdDiv.appendChild(handListDiv);
                els.attackConfirmList.appendChild(halberdDiv);
            }
            
            els.attackConfirmModal.classList.remove('hidden');
            currentCombo = [...currentCombo, ...setCards]; // セットカードを一時的に戻す
            return;
        }

        // --- 確定時 (isPreview === false) の処理 ---
        originalLogMsg(finalMsg, 'important');
        tempLogs.forEach(l => {
            originalLogMsg(l.msg, l.type);
        });
        showDamagePopup(totalDmg);
        enemyHp -= totalDmg;
        
        // 攻撃実行後、チェックボックスをリセット
        els.chkEnemyNoReact.checked = false;
        
        if (manualDmgBonus !== 0) {
            manualDmgBonus = 0;
            if (manualDmgVal) manualDmgVal.innerText = manualDmgBonus;
        }
        
        const finalizeAttackCombo = (savedCardIdx = -1) => {
            currentCombo.forEach((card, idx) => {
                if (idx === savedCardIdx) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.hand.push(card);
                        originalLogMsg(`【残心】の効果で「${card.name}」を手札に戻しました。`, 'important');
                    }
                    return;
                }
                
                if (card._kagejinUsed) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        originalLogMsg(`「${card.name}」はリアクション無効化の代償として廃棄札に移動した。`);
                    }
                    delete card._kagejinUsed;
                    return;
                }

                if (card._fromDiscard) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        originalLogMsg(`「${card.name}」は捨札から使用されたため廃棄札に移動した。`);
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
                        if (card.name === 'ウィスプ') {
                            const drawn = player.deck.draw(1);
                            if (drawn > 0) logMsg(`【ウィスプ】召喚時効果：山札からカードを1枚引いた！`, 'important');
                        }
                        if (card.name === 'ケットシー') {
                            const drawn = player.deck.draw(2);
                            if (drawn > 0) logMsg(`【ケットシー】召喚時効果：山札からカードを${drawn}枚引いた！`, 'important');
                        }
                    }
                    return;
                }
                
                if (/このカードは.*?廃棄札.*?移動する/.test(card.effect)) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                        originalLogMsg(`「${card.name}」は使用されたため廃棄札に移動した。`);
                    }
                    return;
                }
                
                if (toVoid.has(idx)) {
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                        player.deck.void.push(card);
                    }
                }
            });
            
            const hasChosoku = currentCombo.some(c => c.name === '超速判断' || c.effect.includes('捨札からコスト3以下のカードを1枚引く'));
            if (hasChosoku) {
                window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                    detail: {
                        filterFunc: c => c.cost <= 3 && !currentCombo.includes(c),
                        title: "超速判断の効果",
                        desc: "捨札からコスト3以下のカードを1枚引きます。",
                        onSelect: (card) => {
                            player.deck.hand.push(card);
                            originalLogMsg(`【超速判断】捨札から「${card.name}」を手札に加えました。`);
                        },
                        playerObj: player
                    }
                }));
            }
            
            
            // マナパージのデバフログ
            const hasPurge = currentCombo.some(c => c.name === '『マナパージ』');
            if (hasPurge) {
                originalLogMsg(`【『マナパージ』のデバフ効果】<br><span style="color:#ffcc00; font-weight:bold;">この攻撃でダメージを受けた対象は、現在配置している「すべてのパッシブカード」を裏返し（無効化）にしなければならない！</span><br><span style="color:#aaa; font-size:0.8rem;">※裏返されたパッシブは、パッシブ名の横にある「裏返し」チェックを手動で付けてください。次のラウンドから毎ターン1枚ずつ表に戻せます。</span>`, 'important');
            }
            
            // アニマドレインの回収案内ログ
            const hasAnima = currentCombo.some(c => c.name === '『アニマドレイン』');
            if (hasAnima) {
                originalLogMsg(`【『アニマドレイン』の回収効果】<br><span style="color:#ffcc00; font-weight:bold;">相手がこの攻撃に対して「リアクション」を使用した場合、相手が使用したカードと同じコストまでのカードを1枚、自分の捨札から手札に戻すことができる！</span><br><span style="color:#aaa; font-size:0.8rem;">※通信対戦ではないため、相手のリアクションを確認後、画面下部の「捨札確認」から手動で回収を行ってください。</span>`, 'important');
            }

            currentCombo = [...setCards];
            updateUI();
        };

        const zanshinCardIdx = currentCombo.findIndex(c => c.name === '残心');
        if (zanshinCardIdx !== -1) {
            let options = currentCombo.map(c => c.name);
            options.push('戻さない');
            window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                detail: {
                    filterFunc: c => currentCombo.includes(c),
                    title: "残心の効果",
                    desc: "このコンボで使用したカードのうち1枚を手札に戻すことができます。",
                    onSelect: (card) => {
                        const idx = currentCombo.indexOf(card);
                        finalizeAttackCombo(idx);
                    },
                    onSkip: () => {
                        finalizeAttackCombo(-1);
                    },
                    playerObj: player
                }
            }));
        } else {
            finalizeAttackCombo();
        }
    };

    els.btnAttack.addEventListener('click', () => {
        doAttackProcess(true);
    });

    if (els.btnConfirmAttackFinal) {
        els.btnConfirmAttackFinal.addEventListener('click', () => {
            els.attackConfirmModal.classList.add('hidden');
            
            // モーダルでの選択を適用する
            const selects = els.attackConfirmList.querySelectorAll('.confirm-action-select');
            
            // setCards は除外して処理するため分離
            const setCards = currentCombo.filter(c => c.isSetReaction);
            let activeCards = currentCombo.filter(c => !c.isSetReaction);
            
            // 後ろから削除していくとインデックスがずれないが、直接 splice などで処理する
            // 選択されたアクションを適用
            let finalActiveCards = [];
            
            selects.forEach(sel => {
                const idx = parseInt(sel.dataset.idx);
                const action = sel.value;
                const card = activeCards[idx];
                if (!card) return;
                
                if (action === 'normal') {
                    finalActiveCards.push(card);
                } else {
                    // discard から取り出す
                    const discardIdx = player.deck.discard.lastIndexOf(card);
                    if (discardIdx > -1) {
                        player.deck.discard.splice(discardIdx, 1);
                    }
                    
                    if (action === 'hand') {
                        player.deck.hand.push(card);
                        logMsg(`「${card.name}」は妨害により手札に戻りました。（コストは自動回復しません）`);
                    } else if (action === 'discard') {
                        player.deck.discard.push(card);
                        logMsg(`「${card.name}」は効果により捨札になりました。`);
                    } else if (action === 'void') {
                        player.deck.void.push(card);
                        logMsg(`「${card.name}」は効果により廃棄札になりました。`);
                    }
                }
            });
            
            let gatlingBonus = 0;
            let halberdBonus = 0;
            
            // ハルバードの処理 (インデックスがずれないよう降順処理)
            const halberdChecks = els.attackConfirmList.querySelectorAll('.halberd-hand-cb:checked');
            if (halberdChecks.length > 0) {
                const idxsToRemove = Array.from(halberdChecks).map(cb => parseInt(cb.dataset.idx)).sort((a,b) => b-a);
                idxsToRemove.forEach(idx => {
                    const card = player.deck.hand.splice(idx, 1)[0];
                    player.deck.discard.push(card);
                    logMsg(`【ハルバード】追加効果により手札の「${card.name}」を捨札にした！`);
                });
                halberdBonus = idxsToRemove.length * 3;
            }

            const gatlingChecks = els.attackConfirmList.querySelectorAll('.gatling-discard-cb:checked');
            if (gatlingChecks.length > 0) {
                const idxsToRemove = Array.from(gatlingChecks).map(cb => parseInt(cb.dataset.idx)).sort((a,b) => b-a);
                idxsToRemove.forEach(idx => {
                    const card = player.deck.discard.splice(idx, 1)[0];
                    player.deck.void.push(card);
                    logMsg(`【ガトリングガン】追加効果により「${card.name}」を捨札から廃棄札に移動した！`);
                });
                gatlingBonus = idxsToRemove.length * 3;
            }

            // 新しい currentCombo で final 処理を実行
            currentCombo = [...finalActiveCards, ...setCards];
            
            // 通常の攻撃処理（確定版）を呼び出す
            doAttackProcess(false, gatlingBonus, halberdBonus);
        });
    }

    if (els.btnCancelAttackConfirm) {
        els.btnCancelAttackConfirm.addEventListener('click', () => {
            els.attackConfirmModal.classList.add('hidden');
            logMsg('攻撃をキャンセルしました。手札やコンボの状態はそのままです。');
            updateUI();
        });
    }

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
        const dmgLabel = document.getElementById('reaction-pending-dmg');
        if (dmgLabel) dmgLabel.innerText = pendingInputDmg;

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

                if (c.name === '錬成壁') {
                    if (player.deck.mountain.length > 0) {
                        const drawnCard = player.deck.mountain.shift();
                        player.deck.hand.push(drawnCard);
                        const oldDmg = pendingInputDmg;
                        pendingInputDmg = Math.max(0, pendingInputDmg - drawnCard.cost);
                        if (els.incomingDmg) els.incomingDmg.value = pendingInputDmg; // メイン画面の入力欄も同期
                        logMsg(`【錬成壁】山札から「${drawnCard.name}」を引いた！<br>現在の被ダメージを <b>${drawnCard.cost}</b> 点軽減！（残り: ${pendingInputDmg}）`, 'important');
                    } else {
                        logMsg(`【錬成壁】効果不発：山札がありませんでした。`);
                    }
                }

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

                if (item.card.name === '錬成壁') {
                    if (player.deck.mountain.length > 0) {
                        const drawnCard = player.deck.mountain.shift();
                        player.deck.hand.push(drawnCard);
                        const oldDmg = pendingInputDmg;
                        pendingInputDmg = Math.max(0, pendingInputDmg - drawnCard.cost);
                        if (els.incomingDmg) els.incomingDmg.value = pendingInputDmg;
                        logMsg(`【錬成壁(闘禅)】山札から「${drawnCard.name}」を引いた！<br>現在の被ダメージを <b>${drawnCard.cost}</b> 点軽減！（残り: ${pendingInputDmg}）`, 'important');
                    } else {
                        logMsg(`【錬成壁(闘禅)】効果不発：山札がありませんでした。`);
                    }
                }

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
        // ノームの廃棄・無効化チェック
        let nohmBlocked = false;
        const nohmIdx = player.deck.summons.findIndex(s => s.card.name === 'ノーム');
        if (nohmIdx > -1) {
            const doNohmBlock = confirm(`【ノーム】が場にいます。\nノームを廃棄して、今回の攻撃を阻止（ダメージ無効化）しますか？\n（※OKを押すとノームが廃棄され、最終ダメージが0になります）`);
            if (doNohmBlock) {
                const nohmCard = player.deck.summons[nohmIdx].card;
                player.deck.summons.splice(nohmIdx, 1);
                player.deck.void.push(nohmCard);
                nohmBlocked = true;
            }
        }
        
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
                enemyOpen: els.chkEnemyOpen ? els.chkEnemyOpen.checked : false,
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
            
            if (c.name === 'ワイルドコール' && player.deck.summons.length > 0) {
                detail = `（召喚配置ボーナス軽減 2）`;
            }
            
            if (c.name === 'トラップコンボ') {
                let maxStr = 0;
                player.deck.summons.forEach(s => {
                    if (s.card.strength > maxStr) maxStr = s.card.strength;
                });
                detail = `（基本軽減2 ＋ 召喚強度ボーナス${maxStr}）`;
            }
            
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
                    let defVal = parseInt(match[2]);
                    
                    if (s.card.name === '骸鎧の暴君') {
                        const isCost4Over = confirm("【骸鎧の暴君】の特殊効果について確認します。\n相手が使用したカードの中に「コスト4以上」のカードはありましたか？\n（※「キャンセル/いいえ」を押すと、防＋5が適用され合計8軽減になります）");
                        if (!isCost4Over) {
                            defVal += 5;
                            summonLog += `・召喚「${s.card.name}」の防御 (軽減 ${defVal}) <span style="color:#00ffff; font-size:0.8rem;">※特殊効果 ＋5適用</span><br>`;
                        } else {
                            summonLog += `・召喚「${s.card.name}」の防御 (軽減 ${defVal}) <span style="color:#ff5252; font-size:0.8rem;">※特殊効果は無効化された</span><br>`;
                        }
                        summonDef += defVal;
                    } else {
                        summonDef += defVal;
                        summonLog += `・召喚「${s.card.name}」の防御 (軽減 ${defVal})<br>`;
                    }
                }
            }
            
            if (s.card.name === 'ノーム') {
                summonDef += 2;
                summonLog += `・【ノーム】常時効果 (軽減 2)<br>`;
            }
            
            if (s.card.name === 'アイアン・タイガー') {
                summonDef += 2;
                summonLog += `・【アイアン・タイガー】常時効果 (軽減 2)<br>`;
            }
            
            if (s.card.name === '菌糸の獣骸') {
                summonDef += 1;
                summonLog += `・【菌糸の獣骸】常時効果 (軽減 1)<br>`;
            }
        });
        
        let totalDef = defense + summonDef;
        
        if (ignoreDef) {
            totalDef = 0;
        }
        
        actualDmg = Math.max(0, inputDmg - totalDef);
        
        if (nohmBlocked) {
            actualDmg = 0;
        }
        

        
        // 予測防壁の効果：攻撃に使用されたカードが「公開状態」だった場合、ダメージを無効化
        let yosokuTriggered = false;
        if (els.chkAttackFromOpen && els.chkAttackFromOpen.checked) {
            if (currentCombo.some(c => c.name === '予測防壁')) {
                actualDmg = 0;
                yosokuTriggered = true;
            }
        }
        
        // マナカウンターの効果：ダメージを0にし、相手のコンボ枚数分の反射ダメージを与える
        let manaCounterTriggered = false;
        let counterDamage = 0;
        if (currentCombo.some(c => c.name === '『マナカウンター』')) {
            actualDmg = 0;
            manaCounterTriggered = true;
            const enemyComboCount = prompt("【『マナカウンター』効果】\n相手がこの攻撃で繋げた「コンボ枚数」を入力してください。\n（※その数値がそのまま相手への反射ダメージになります）", "0");
            if (enemyComboCount && !isNaN(enemyComboCount)) {
                counterDamage = parseInt(enemyComboCount);
            }
        }

        const cardStr = currentCombo.length > 0 ? `使用カード:<br>${cardLogs}<br>` : 'カード使用なし<br>';
        const yosokuMsg = yosokuTriggered ? `<br><span style="color:#00ffff; font-weight:bold;">【予測防壁】攻撃元が公開状態だったため、ダメージを完全に無効化！</span>` : '';
        const nohmMsg = nohmBlocked ? `<br><span style="color:#00ffff; font-weight:bold;">【ノーム】ユニットを廃棄し、ダメージを無効化（阻止）した！</span>` : '';
        const manaCounterMsg = manaCounterTriggered ? `<br><span style="color:#ffcc00; font-weight:bold;">【『マナカウンター』】ダメージを完全に無効化（0にする）！<br>さらに、相手に「${counterDamage}点」のカウンターダメージを反射！</span>` : '';
        const additionalMsg = yosokuMsg + nohmMsg + manaCounterMsg;
        
        if (ignoreDef) {
            logMsg(`${cardStr}${summonLog}敵からの攻撃（<span style="color:#cc44ff;">軽減無視！</span>）<br>元ダメージ: ${inputDmg}${additionalMsg}<br><span style="color:#ff5252;">最終ダメージ: ${actualDmg}</span>`, 'important');
        } else {
            logMsg(`${cardStr}${summonLog}敵からの攻撃！<br>元ダメージ: ${inputDmg}<br>カード軽減: ${totalDef}${additionalMsg}<br><span style="color:#ff5252;">最終ダメージ: ${actualDmg}</span>`, 'important');
        }
        
        if (actualDmg === 0) {
            // 流し斬りチェックはすべての軽減適用後に行うため、ここでは判定しない
        }
        
        if (manaCounterTriggered && counterDamage > 0) {
            enemyHp -= counterDamage;
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

            // 使用後廃棄のテキストを持つカード
            if (/このカードは.*?廃棄札.*?移動する/.test(card.effect)) {
                const discardIdx = player.deck.discard.lastIndexOf(card);
                if (discardIdx > -1) {
                    player.deck.discard.splice(discardIdx, 1);
                    player.deck.void.push(card);
                    logMsg(`「${card.name}」は効果により廃棄札に移動した。`);
                }
                return;
            }

            if (card.category.includes('召喚') || card.effect.includes('召喚・攻')) {
                const discardIdx = player.deck.discard.lastIndexOf(card);
                if (discardIdx > -1) {
                    player.deck.discard.splice(discardIdx, 1);
                    const initStance = card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'defend';
                    player.deck.summons.push({ card: card, stance: initStance });
                    if (card.name === 'ウィスプ') {
                        const drawn = player.deck.draw(1);
                        if (drawn > 0) logMsg(`【ウィスプ】召喚時効果：山札からカードを1枚引いた！`, 'important');
                    }
                    if (card.name === 'ケットシー') {
                        const drawn = player.deck.draw(2);
                        if (drawn > 0) logMsg(`【ケットシー】召喚時効果：山札からカードを${drawn}枚引いた！`, 'important');
                    }
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
        const hasGenwaku = currentCombo.some(c => c.name === '幻惑のコーラス');
        
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
        
        // 大地の息吹の処理
        const hasDaichi = currentCombo.some(c => c.name === '大地の息吹');
        const daichiTargetCards2 = [...player.deck.void, ...player.deck.discard];
        if (hasDaichi && daichiTargetCards2.some(c => c.category.includes('召喚') || c.effect.includes('召喚・攻'))) {
            window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                detail: {
                    filterFunc: c => c.category.includes('召喚') || c.effect.includes('召喚・攻'),
                    title: "大地の息吹の効果",
                    desc: "捨札または廃棄札から「召喚」カードを1枚選んで手札に加えます。",
                    source: 'void_or_discard',
                    onSelect: (card) => {
                        player.deck.hand.push(card);
                        logMsg(`【大地の息吹】「${card.name}」を手札に加えました。`);
                    },
                    playerObj: player
                }
            }));
        }
        
        // ウンディーネ召喚時効果
        const hasUndine = currentCombo.some(c => c.name === 'ウンディーネ');
        if (hasUndine && player.deck.void.some(c => c.cost <= 2)) {
            window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                detail: {
                    filterFunc: c => c.cost <= 2,
                    title: "ウンディーネ：召喚時効果",
                    desc: "山札に戻すコスト2以下の廃棄札を選んでください。",
                    source: 'void',
                    onSelect: (card) => {
                        player.deck.mountain.push(card);
                        logMsg(`【ウンディーネ】対象の廃棄札「${card.name}」を山札に戻した！`);
                    },
                    playerObj: player
                }
            }));
        }
        
        // ジャミングプロトコルの処理
        const hasJamming = currentCombo.some(c => c.name === 'ジャミングプロトコル');
        if (hasJamming) {
            logMsg(`【ジャミングプロトコル】通信を傍受・妨害！<br><span style="color:#ffcc00; font-weight:bold;">※攻撃を行ってきた敵の任意の手札1枚を表向き（公開状態）にさせてください！</span><br>（公開状態にした場合は、画面下部の「敵手札オープン中」にチェックを入れてください）`, 'important');
        }
        
        currentCombo = [];
        els.incomingDmg.value = '';
        els.chkIgnoreDef.checked = false; // チェックをリセット
        els.chkAttackFromOpen.checked = false;
        
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
                enemyOpen: els.chkEnemyOpen ? els.chkEnemyOpen.checked : false,
                currentCombo: []
            }, player.deck.passives);
            
            counterDmg = counterHook.totalDmg;
            enemyHp -= counterDmg;
            logMsg(`【流し斬り】の効果発動！すべての軽減でダメージを防ぎ切り、カウンターで敵に ${counterDmg} ダメージを与えた！`, 'important');
            if (typeof showDamagePopup === 'function') showDamagePopup(counterDmg);
        }
        
        // --- 幻惑のコーラス判定 ---
        if (actualDmg <= 0 && hasGenwaku) {
            logMsg(`【幻惑のコーラス】ダメージを完全に防ぎ切った！<br><span style="color:#ffcc00; font-weight:bold;">※この攻撃を受けた対象者は、山札からカードを1枚引いてください。</span>`, 'important');
        }
        
        // --- トラップコンボカウンター判定 ---
        const hasTrapCombo = currentCombo.some(c => c.name === 'トラップコンボ');
        if (hasTrapCombo && player.deck.summons.length > 0) {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px;';
            
            const title = document.createElement('h3');
            title.innerText = 'トラップコンボ：カウンターを行うユニットを選択';
            title.style.color = '#fff';
            title.style.marginBottom = '20px';
            title.style.textAlign = 'center';
            overlay.appendChild(title);
            
            const honnouBuff = player.deck.discard.filter(c => c.name === '本能の覚醒').length * 2;
            const jusoBuff = player.deck.passives.filter(c => c.name === '獣操棍' && !c.isDisabled).length * 1;
            
            player.deck.summons.forEach(s => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-primary';
                btn.style.cssText = 'margin:10px; width:80%; max-width:300px; padding:10px; font-size:1.1rem; text-align:center;';
                btn.innerText = s.card.name;
                btn.addEventListener('click', () => {
                    document.body.removeChild(overlay);
                    
                    let trapCounterDmg = 0;
                    const match = s.card.effect.match(/攻(\d+)\s*[／/]\s*(?:防)?(\d+)/);
                    if (match) {
                        let atk = parseInt(match[1]);
                        if (s.elementalerBuff) atk += 2 * s.elementalerBuff;
                        atk += honnouBuff + jusoBuff;
                        trapCounterDmg += atk;
                    }
                    
                    if (trapCounterDmg > 0) {
                        const counterHook = triggerHook('onAttack', {
                            totalDmg: trapCounterDmg,
                            logMsg,
                            player,
                            enemyOpen: els.chkEnemyOpen ? els.chkEnemyOpen.checked : false,
                            currentCombo: []
                        }, player.deck.passives);
                        trapCounterDmg = counterHook.totalDmg;
                        enemyHp -= trapCounterDmg;
                        logMsg(`【トラップコンボ】の効果発動！召喚「${s.card.name}」によるカウンター攻撃で敵に ${trapCounterDmg} ダメージを与えた！`, 'important');
                        if (typeof showDamagePopup === 'function') showDamagePopup(trapCounterDmg);
                        updateUI();
                    }
                });
                overlay.appendChild(btn);
            });
            document.body.appendChild(overlay);
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
            
            const hasBoar = player.deck.summons.some(s => s.card.name === 'ライトニングボア');
            if (hasBoar) {
                logMsg('【ライトニングボアの効果】ダメージを受けたため、対象へ「1点」のダメージを返す！', 'important');
                if (typeof enemyHp !== 'undefined') {
                    enemyHp -= 1;
                }
                if (typeof showDamagePopup === 'function') {
                    showDamagePopup(1);
                }
            }
            
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
    
    const btnAllOut = document.getElementById('btn-all-out');
    if (btnAllOut) {
        btnAllOut.addEventListener('click', () => {
            if (confirm('本当に「オールアウト」を実行しますか？\n手札と捨札がすべて廃棄札に送られ、ダメージを0にします。')) {
                const handCount = player.deck.hand.length;
                const discardCount = player.deck.discard.length;
                
                player.deck.void.push(...player.deck.hand);
                player.deck.hand = [];
                
                player.deck.void.push(...player.deck.discard);
                player.deck.discard = [];
                
                pendingDamage = 0;
                logMsg(`【オールアウト発動】手札${handCount}枚・捨札${discardCount}枚をすべて廃棄し、ダメージを0にした！`, 'important');
                
                els.damageModal.classList.add('hidden');
                isGuardStanceActive = false;
                updateUI();
            }
        });
    }
    
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
                    let dmgToTake = pendingDamage;
                    let endurance = s.card.cost;
                    
                    if (s.card.name === '古の屍竜') {
                        const isFlesh = confirm("【古の屍竜】の特殊効果について確認します。\nこの攻撃によるダメージは「肉体カテゴリー」によるものですか？\n（※「OK」を押すと、自身に対するダメージを3点軽減して判定します）");
                        if (isFlesh) {
                            dmgToTake = Math.max(0, dmgToTake - 3);
                            logMsg(`【古の屍竜の効果】「肉体カテゴリー」のダメージを3点軽減！（${pendingDamage} → ${dmgToTake}）`, 'important');
                        }
                    }
                    
                    if (s.card.name === '彷徨う砂塵霊') {
                        // ダメージを全て無効化し、廃棄札へ移動する
                        player.deck.summons.splice(idx, 1);
                        player.deck.void.push(s.card);
                        pendingDamage = 0;
                        logMsg(`「${s.card.name}」がダメージを身代わりにした！<br><span style="color:#00ffff; font-weight:bold;">【特殊効果】ダメージを0にし、廃棄札へ移動した！</span>`, 'important');
                    } else if (dmgToTake > endurance) {
                        // 破壊される
                        player.deck.summons.splice(idx, 1);
                        pendingDamage -= endurance;
                        
                        if (s.card.isChimera && s.card.originalCards) {
                            // 合成獣が破壊された場合、素材カードを全て廃棄札へ
                            s.card.originalCards.forEach(c => player.deck.void.push(c));
                            logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊された！<br><span style="color:#00ffff; font-weight:bold;">合成素材となっていた全てのカードが廃棄札に移動した！</span>（残り: ${pendingDamage}）`, 'damage');
                        } else if (s.card.name === 'シルフ') {
                            player.deck.hand.push(s.card);
                            logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、<span style="color:#00ffff; font-weight:bold;">手札に戻った！</span>（残り: ${pendingDamage}）`, 'damage');
                        } else if (s.card.name === 'フリップサイド・ヒュドラ') {
                            const doRegen = confirm(`【フリップサイド・ヒュドラ】が破壊されました。\n②『超再生』を発動しますか？\n（※OKを押すと、ヒュドラは廃棄札ではなく山札の一番上に戻ります。捨札からコスト合計8になるよう手動でカードを廃棄してください）`);
                            if (doRegen) {
                                player.deck.deck.unshift(s.card);
                                logMsg(`「${s.card.name}」が破壊されたが、<span style="color:#00ffff; font-weight:bold;">『超再生』により山札の一番上に戻った！</span><br>（※捨札からコスト8分を手動で廃棄してください）`, 'important');
                            } else {
                                player.deck.void.push(s.card);
                                logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                            }
                        } else {
                            player.deck.void.push(s.card);
                            logMsg(`「${s.card.name}」で受けたが、ダメージに耐えきれず破壊され、廃棄札に移動した！（残り: ${pendingDamage}）`, 'damage');
                        }
                        
                        if (s.card.name === '怨樹の角魔') {
                            logMsg('【怨樹の角魔の効果】廃棄札に移動したため、攻撃者はコスト4以下のカード1枚を廃棄札に移動する！', 'damage');
                        }
                        
                        if (s.card.name === '赫怒の熔魔') {
                            logMsg('【赫怒の熔魔の効果】廃棄札に移動したため、任意の対象全てに3点のダメージを与える！', 'damage');
                        }
                        
                        if (s.card.name === '呪響骸鳥') {
                            logMsg('【呪響骸鳥の効果】自身が廃棄札に移動したため、対象のコスト3以下の捨札1枚を強制的に廃棄札へと移動させる！', 'damage');
                        }
                        
                        if (s.card.name === 'ライトニングボア') {
                            logMsg('【ライトニングボアの効果】自身がダメージを受けたため、対象へ「1点」のダメージを返す！', 'important');
                            if (typeof enemyHp !== 'undefined') enemyHp -= 1;
                            if (typeof showDamagePopup === 'function') showDamagePopup(1);
                        }
                    } else {
                        // 耐え切る
                        pendingDamage = 0;
                        logMsg(`「${s.card.name}」でダメージを受け止めた！`, 'important');
                        
                        if (s.card.name === 'ライトニングボア') {
                            logMsg('【ライトニングボアの効果】自身がダメージを受けたため、対象へ「1点」のダメージを返す！', 'important');
                            if (typeof enemyHp !== 'undefined') enemyHp -= 1;
                            if (typeof showDamagePopup === 'function') showDamagePopup(1);
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

    if (els.btnShareStatus) {
        els.btnShareStatus.addEventListener('click', () => {
            let msg = '';
            if (isGeneralMode) {
                const getPassiveBonus = (categoryFilter) => {
                    return player.deck.passives.reduce((sum, p) => {
                        if (p.isDisabled) return sum; // 無効化されている場合は加算しない
                        if (p.category.includes(categoryFilter) || p.category.includes('全て')) {
                            return sum + (p.strength || 0);
                        }
                        return sum;
                    }, 0);
                };
                const bodyBonus = getPassiveBonus('肉体');
                const intBonus = getPassiveBonus('知性');
                const menBonus = getPassiveBonus('精神');
                
                const bodyTotal = player.stats.body.maxVal + bodyBonus;
                const intTotal = player.stats.int.maxVal + intBonus;
                const menTotal = player.stats.men.maxVal + menBonus;
                
                msg = `【一般判定ステータス（最大値＋パッシブ補正）】<br>` +
                      `肉体: ${bodyTotal} (基本${player.stats.body.maxVal}+補正${bodyBonus}) | ` +
                      `知性: ${intTotal} (基本${player.stats.int.maxVal}+補正${intBonus}) | ` +
                      `精神: ${menTotal} (基本${player.stats.men.maxVal}+補正${menBonus})<br>`;
            } else {
                msg = `【現在のステータス】<br>` +
                      `肉体: ${player.stats.body.currentVal}/${player.stats.body.maxVal} | ` +
                      `知性: ${player.stats.int.currentVal}/${player.stats.int.maxVal} | ` +
                      `精神: ${player.stats.men.currentVal}/${player.stats.men.maxVal}<br>`;
            }
            
            msg += `手札: ${player.deck.hand.length}枚 | ` +
                   `山札: ${player.deck.mountain.length}枚 | ` +
                   `捨札: ${player.deck.discard.length}枚 | ` +
                   `廃棄: ${player.deck.void.length}枚`;
                   
            logMsg(msg, 'important');
        });
    }

    if (els.btnToggleMode) {
        els.btnToggleMode.addEventListener('click', () => {
            isGeneralMode = !isGeneralMode;
            if (isGeneralMode) {
                els.btnToggleMode.innerText = 'バトルモードに戻す';
                els.btnToggleMode.style.background = '#8e24aa'; // 色を変えて目立たせる
                els.btnAttack.innerText = '一般判定を実行';
                els.btnAttack.style.background = '#8e24aa';
                els.btnReact.style.display = 'none'; // 防御ボタンは隠す
                logMsg('【システム】一般判定モードに切り替えました。手札の効果は無視され、能力値＋強度で判定を行います。', 'important');
            } else {
                els.btnToggleMode.innerText = '一般モード';
                els.btnToggleMode.style.background = '#555';
                els.btnAttack.innerText = '攻撃実行';
                els.btnAttack.style.background = '#1976d2';
                els.btnReact.style.display = 'block'; // 防御ボタンを戻す
                logMsg('【システム】バトルモードに戻りました。', 'important');
            }
        });
    }

    if (els.btnOpenDiscordModal) {
        els.btnOpenDiscordModal.addEventListener('click', () => {
            const savedUrl = localStorage.getItem('discordWebhookUrl');
            if (savedUrl) els.discordWebhookUrl.value = savedUrl;
            els.discordModal.classList.remove('hidden');
        });
    }

    if (els.btnSaveDiscord) {
        els.btnSaveDiscord.addEventListener('click', () => {
            const url = els.discordWebhookUrl.value.trim();
            if (url) {
                localStorage.setItem('discordWebhookUrl', url);
                alert('Discord Webhook URL を保存しました！');
            } else {
                localStorage.removeItem('discordWebhookUrl');
                alert('Discord送信設定を解除しました。');
            }
            els.discordModal.classList.add('hidden');
        });
    }

    if (els.btnCloseDiscordModal) {
        els.btnCloseDiscordModal.addEventListener('click', () => {
            els.discordModal.classList.add('hidden');
        });
    }

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
    let manualRecoveryBonus = { body: 0, int: 0, men: 0 };
    
    // 捨札回収モーダルの手動補正ボタンリスナー（document全体で1回だけ登録する想定だが、動的追加要素ではないためinit時に登録でOK。ここではイベントデリゲーションを利用）
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-adj-recover')) {
            const stat = e.target.getAttribute('data-stat');
            const val = parseInt(e.target.getAttribute('data-val'));
            if (manualRecoveryBonus[stat] !== undefined) {
                manualRecoveryBonus[stat] += val;
                updateDiscardModalUI();
            }
        }
    });

    function updateDiscardModalUI() {
        const hasHotLimit = player.deck.passives.some(p => p.effect.includes('能力値にダメージを受けていても、回収ポイントが下がらない') && !p.isDisabled);
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
                
                const matchAny = card.effect.match(/回収ポイント[をが]?\s*[＋\+]\s*([0-9０-９]+)/);
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

        let maxBody = maxBodyBase + bonusBody + manualRecoveryBonus.body;
        let maxInt = maxIntBase + bonusInt + manualRecoveryBonus.int;
        let maxMen = maxMenBase + bonusMen + manualRecoveryBonus.men;
        
        // ウィスプの召喚ボーナス（場にいれば精神回収ポイント＋1）
        const wispCount = player.deck.summons.filter(s => s.card.name === 'ウィスプ').length;
        if (wispCount > 0) {
            maxMen += wispCount;
        }

        // ★回収可能リストの生成
        window._currentRecoverableCards = player.deck.discard.map((card, originalIdx) => ({ card, originalIdx, source: 'discard' }));

        let costBody = 0, costInt = 0, costMen = 0, costAll = 0;
        recoveringCards.forEach(idx => {
            const cardItem = window._currentRecoverableCards[idx];
            if (!cardItem) return;
            const card = cardItem.card;
            let actualCost = getDisplayCost(card, player);
            if (card.category.includes('肉体')) costBody += actualCost;
            else if (card.category.includes('知性')) costInt += actualCost;
            else if (card.category.includes('精神')) costMen += actualCost;
            else if (card.category.includes('全て')) costAll += actualCost;
        });
        
        let remB = Math.max(0, maxBody - costBody);
        let remI = Math.max(0, maxInt - costInt);
        let remM = Math.max(0, maxMen - costMen);
        
        while (costAll > 0 && (remB > 0 || remI > 0 || remM > 0)) {
            if (remB > 0) { remB--; costBody++; costAll--; continue; }
            if (remI > 0) { remI--; costInt++; costAll--; continue; }
            if (remM > 0) { remM--; costMen++; costAll--; continue; }
        }
        if (costAll > 0) {
            costBody += costAll; // 余ってしまった場合はとりあえず肉体に足してエラーを出す
        }

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
        if (window._currentRecoverableCards.length === 0) {
            els.discardList.innerHTML = '<p style="color:#aaa;">回収可能なカードがありません</p>';
        } else {
            window._currentRecoverableCards.forEach((cardItem, idx) => {
                const card = cardItem.card;
                const isFromVoid = cardItem.source === 'void';
                const item = document.createElement('div');
                item.className = 'discard-item';
                
                let relatedStat = null;
                if (card.category.includes('肉体')) relatedStat = player.stats.body;
                else if (card.category.includes('知性')) relatedStat = player.stats.int;
                else if (card.category.includes('精神')) relatedStat = player.stats.men;
                else if (card.category.includes('全て')) relatedStat = true;

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

                    const dCost = getDisplayCost(card, player);
                    let costDisplay = `コスト: ${card.cost}`;
                    if (dCost < card.cost) {
                        costDisplay = `コスト: <span style="text-decoration: line-through;">${card.cost}</span> <span style="color:#ffcc00;">${dCost}</span> <span style="color:#ffcc00; font-size:0.7rem;">(軽減適用)</span>`;
                    }

                    item.innerHTML = `
                        <div><strong>${card.name}</strong><br><small style="color:#aaa;">${card.category}</small></div>
                        <div style="text-align:right;">
                            <div>${costDisplay}</div>
                            ${isSelected ? '<div style="color:#4caf50; font-size:0.75rem;">✔ 選択中</div>' : ''}
                            <div style="display:flex; justify-content:flex-end; gap:5px; margin-top:5px;">
                                ${useBtnHtml}
                                <button class="btn btn-secondary btn-return-hand-item" style="font-size:0.7rem; padding:2px 5px;">手札へ</button>
                                <button class="btn btn-danger btn-void-discard-item" style="font-size:0.7rem; padding:2px 5px;">廃棄</button>
                            </div>
                        </div>
                    `;
                    
                    item.addEventListener('click', (e) => {
                        if (e.target.classList.contains('btn-return-hand-item')) {
                            e.stopPropagation();
                            if (confirm(`上限を無視して捨札から「${card.name}」を手札に戻しますか？（※英雄のファンファーレ等のバフ効果用）`)) {
                                const targetCard = player.deck.discard.splice(idx, 1)[0];
                                player.deck.hand.push(targetCard);
                                logMsg(`味方からの効果等により、捨札から「${targetCard.name}」を手動で手札に戻した。`, 'important');
                                updateDiscardModalUI();
                                updateUI();
                            }
                            return;
                        }

                        if (e.target.classList.contains('btn-void-discard-item')) {
                            e.stopPropagation();
                            if (confirm(`捨札から「${card.name}」を廃棄札へ移動させますか？（敵からの効果用など）`)) {
                                const targetCard = player.deck.discard.splice(idx, 1)[0];
                                player.deck.void.push(targetCard);
                                logMsg(`捨札から「${targetCard.name}」を廃棄した。`);
                                updateDiscardModalUI();
                                updateUI();
                            }
                            return;
                        }

                        if (e.target.classList.contains('btn-use-discard')) {
                            e.stopPropagation();
                            const targetCard = window._currentRecoverableCards[idx].card;
                            targetCard._fromDiscard = true;
                            currentCombo.push(targetCard);
                            logMsg(`【${targetCard.name}】の効果！捨札（または廃棄札）から場に出した！`);
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
        manualRecoveryBonus = { body: 0, int: 0, men: 0 };
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
                    player.deck.mountain.push(selectedCard);
                    logMsg(`廃棄札から「${selectedCard.name}」を山札に戻しました。`);
                    updateUI();
                }
            }
        }));
    });

    document.getElementById('btn-execute-recover').addEventListener('click', () => {
        if (recoveringCards.size === 0) return;
        
        const selectedItems = Array.from(recoveringCards).map(idx => window._currentRecoverableCards[idx]).filter(item => item);
        let recoveredNames = [];
        
        // 元の配列から削除するため、sourceごとに分けて originalIdx の降順でソート
        const discardItems = selectedItems.filter(i => i.source === 'discard').sort((a, b) => b.originalIdx - a.originalIdx);
        const voidItems = selectedItems.filter(i => i.source === 'void').sort((a, b) => b.originalIdx - a.originalIdx);
        
        for (const item of discardItems) {
            player.deck.discard.splice(item.originalIdx, 1);
            player.deck.hand.push(item.card);
            recoveredNames.push(item.card.name);
        }
        for (const item of voidItems) {
            player.deck.void.splice(item.originalIdx, 1);
            player.deck.hand.push(item.card);
            recoveredNames.push(item.card.name);
        }
        
        logMsg(`手札に ${recoveredNames.length}枚 回収しました！<br><small>(${recoveredNames.join(', ')})</small>`);
        els.discardModal.classList.add('hidden');
        
        // パッシブ「武術家」のチェック
        const hasBujutsuka = player.deck.passives.some(p => (p.name === '武術家' || p.effect.includes('回収タイミングで肉体カテゴリーのコスト3以下')) && !p.isDisabled);
        if (hasBujutsuka) {
            const validCards = player.deck.discard.filter(c => c.category.includes('肉体') && c.cost <= 3);
            if (validCards.length > 0) {
                window.dispatchEvent(new CustomEvent('requestBujutsukaRecover', {
                    detail: { playerObj: player }
                }));
                // ここでリターンすると戦術解析士のログが出なくなるので注意
            }
        }
        
        // パッシブ「戦術解析士」のチェック
        const hasSenjutsu = player.deck.passives.some(p => p.name === '戦術解析士' && !p.isDisabled);
        if (hasSenjutsu) {
            logMsg(`【戦術解析士】情報のアドバンテージ！<br><span style="color:#ffcc00; font-weight:bold;">※任意の対象の手札1枚を公開状態にしてください！</span><br>（公開状態にした場合は、画面下部の「敵手札オープン中」にチェックを入れてください）`, 'important');
        }
        
        // 武術家のモーダル表示がある場合は updateUI を呼ばずにリターンしていたが、
        // 武術家の処理がある場合でも戦術解析士のログは出すべき。
        // updateUIのタイミングが変わるため、武術家チェックの中の return を除去または条件付きにする。
        if (hasBujutsuka) {
            const validCards = player.deck.discard.filter(c => c.category.includes('肉体') && c.cost <= 3);
            if (validCards.length > 0) {
                return; // 武術家のモーダルが開くため、ここではUI更新しない
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

    const btnVoidCard = document.getElementById('btn-void-card');
    if (btnVoidCard) {
        btnVoidCard.addEventListener('click', () => {
            if (selectedCardIndex !== null) {
                const card = player.deck.hand[selectedCardIndex];
                player.deck.hand.splice(selectedCardIndex, 1);
                player.deck.void.push(card);
                logMsg(`手札から「${card.name}」を廃棄札に送りました。`);
                els.modal.classList.add('hidden');
                updateUI();
            }
        });
    }

    if (els.btnTriggerPassive) {
        els.btnTriggerPassive.addEventListener('click', () => {
            if (selectedCardIndex !== null) {
                let passiveCard = null;
                if (selectedCardIndex >= 0) {
                    passiveCard = player.deck.passives[selectedCardIndex];
                } else {
                    const cardName = els.mTitle.innerText;
                    passiveCard = player.deck.summons.find(s => s.card.name === cardName)?.card;
                    if (!passiveCard) passiveCard = player.deck.passives.find(p => p.name === cardName);
                }
                
                if (!passiveCard) return;
                
                els.modal.classList.add('hidden'); // 詳細モーダルを閉じる

                if (passiveCard.name === '武具錬成') {
                    logMsg(`【武具錬成】効果を対象に共有しました！<br><span style="color:#ffcc00; font-size:0.9rem;">（対象の攻撃ダメージ＋1、または受けるダメージ1点軽減）</span>`, 'important');
                    return;
                }

                if (passiveCard.name === '『不死者』') {
                    if (player._undeadUsed) {
                        alert('この効果は1ラウンドに1回しか使用できません。');
                        return;
                    }
                    const voidCards = player.deck.void.filter(c => c.cost <= 3);
                    if (voidCards.length === 0) {
                        alert('廃棄札にコスト3以下のカードがありません。');
                        return;
                    }
                    
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: "『不死者』：無償回収",
                            desc: "手札に戻すカードを1枚選んでください。",
                            playerObj: player,
                            source: 'void',
                            filterFunc: (c) => c.cost <= 3,
                            onSelect: (selectedCard) => {
                                player.deck.hand.push(selectedCard);
                                player._undeadUsed = true;
                                logMsg(`【『不死者』の効果】廃棄札から「${selectedCard.name}」を無償で手札に戻しました！`, 'important');
                                updateUI();
                            }
                        }
                    }));
                    return;
                }

                if (passiveCard.name === 'サイオマンサー') {
                    if (player.deck.hasUsedCyomancer) {
                        alert('この効果は1ラウンドに1回しか使用できません。（手札補充でラウンドが更新されます）');
                        return;
                    }
                    if (player.deck.mountain.length === 0) {
                        alert('山札がありません。');
                        return;
                    }
                    const drawn = player.deck.draw(1);
                    if (drawn > 0) {
                        logMsg(`【サイオマンサー】の効果で山札から1枚ドローしました！`, 'important');
                        player.deck.hasUsedCyomancer = true;
                        updateUI();
                    }
                    return;
                }

                if (passiveCard.name === 'バディビースト' || passiveCard.name === '相棒の獣' || passiveCard.name === '相棒の鳥' || passiveCard.name === '相棒の竜') {
                    const pIdx = player.deck.passives.findIndex(p => p === passiveCard);
                    if (pIdx > -1) {
                        player.deck.passives.splice(pIdx, 1);
                        player.deck.summons.push({ card: passiveCard, stance: 'both' });
                        logMsg(`【${passiveCard.name}】自身を召喚エリアに配置しました！`, 'important');
                        els.modal.classList.add('hidden');
                        updateUI();
                    }
                    return;
                }
                
                if (passiveCard.name === '金の加護') {
                    const passiveVoidCards = player.deck.void.filter(c => c.category.includes('パッシブ'));
                    if (passiveVoidCards.length === 0) {
                        alert('廃棄札の中にパッシブカテゴリーのカードがありません。');
                        return;
                    }
                    
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: "金の加護：山札に戻すカードを選択",
                            desc: "廃棄札からパッシブカードを1枚選んでください。",
                            playerObj: player,
                            source: 'void',
                            filterFunc: (c) => c.category.includes('パッシブ'),
                            onSelect: (recoveredCard) => {
                                // 山札に戻す（シャッフルするわけではないが、一番下でも上でもシステム上山札に入ればドローできるようになる。末尾に追加。）
                                player.deck.mountain.push(recoveredCard);
                                
                                // 金の加護自身を廃棄札へ移動
                                const pIdx = player.deck.passives.indexOf(passiveCard);
                                if (pIdx > -1) {
                                    player.deck.passives.splice(pIdx, 1);
                                }
                                player.deck.void.push(passiveCard);
                                
                                logMsg(`【金の加護】効果発動！廃棄札から「${recoveredCard.name}」を山札に戻しました。<br><small>※金の加護は使用されたため廃棄札に移動しました。</small>`, 'important');
                                updateUI();
                            }
                        }
                    }));
                    return;
                }

                if (passiveCard.name === 'ファミリア') {
                    if (player.deck.mountain.length === 0) {
                        alert('山札がありません。');
                        return;
                    }
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: "ファミリア：召喚ユニットを選択",
                            desc: "山札から「召喚」カードを1枚選んでください。",
                            playerObj: player,
                            source: 'mountain',
                            filterFunc: (c) => c.effect.includes('召喚'),
                            onSelect: (selectedCard) => {
                                const initStance = selectedCard.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる') ? 'both' : 'attack';
                                player.deck.summons.push({ card: selectedCard, stance: initStance, isFamiliar: true });
                                logMsg(`【ファミリア】効果発動！山札から「${selectedCard.name}」を永続召喚しました！`, 'important');
                            }
                        }
                    }));
                    return;
                }

                if (passiveCard.name === 'ノーム') {
                    const summonIdx = player.deck.summons.findIndex(s => s.card.name === 'ノーム');
                    if (summonIdx > -1) {
                        const nohmCard = player.deck.summons[summonIdx].card;
                        player.deck.summons.splice(summonIdx, 1);
                        player.deck.void.push(nohmCard);
                        logMsg(`【ノーム】ユニットを廃棄して効果発動！<br><span style="color:#00ffff; font-weight:bold;">※ダメージを無効化した！</span>`, 'important');
                        updateUI();
                    }
                    return;
                }

                if (passiveCard.name === 'エレメンタラー') {
                    if (player.deck.summons.length === 0) {
                        alert('場に召喚ユニットがいません。');
                        return;
                    }
                    const overlay = document.createElement('div');
                    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px;';
                    
                    const title = document.createElement('h3');
                    title.innerText = '強化するユニットを選択';
                    title.style.color = '#fff';
                    title.style.marginBottom = '20px';
                    overlay.appendChild(title);
                    
                    player.deck.summons.forEach((s, idx) => {
                        const btn = document.createElement('button');
                        btn.className = 'btn btn-primary';
                        btn.style.cssText = 'margin:10px; width:80%; padding:10px; font-size:1.1rem; text-align:center;';
                        btn.innerText = s.card.name;
                        btn.addEventListener('click', () => {
                            s.elementalerBuff = (s.elementalerBuff || 0) + 1;
                            
                            // エレメンタラーをパッシブから削除して廃棄札へ
                            const pIdx = player.deck.passives.findIndex(p => p === passiveCard);
                            if (pIdx > -1) {
                                const elemCard = player.deck.passives[pIdx];
                                player.deck.passives.splice(pIdx, 1);
                                player.deck.void.push(elemCard);
                                logMsg(`【エレメンタラー】効果適用！「${s.card.name}」の攻/防を＋2しました。（※エレメンタラーを下に重ねてください）`, 'important');
                            }
                            
                            document.body.removeChild(overlay);
                            els.modal.classList.add('hidden');
                            updateUI();
                        });
                        overlay.appendChild(btn);
                    });
                    
                    const cancelBtn = document.createElement('button');
                    cancelBtn.className = 'btn btn-secondary';
                    cancelBtn.style.cssText = 'margin-top:20px; padding:5px 20px;';
                    cancelBtn.innerText = 'キャンセル';
                    cancelBtn.addEventListener('click', () => {
                        document.body.removeChild(overlay);
                    });
                    overlay.appendChild(cancelBtn);
                    
                    document.body.appendChild(overlay);
                    return;
                }

                if (passiveCard.name === 'シルフ') {
                    const summonIdx = player.deck.summons.findIndex(s => s.card.name === 'シルフ');
                    if (summonIdx > -1) {
                        const sylphCard = player.deck.summons[summonIdx].card;
                        player.deck.summons.splice(summonIdx, 1);
                        player.deck.void.push(sylphCard);
                        logMsg(`【シルフ】ユニットを廃棄札に送って効果発動！<br><span style="color:#00ffff; font-weight:bold;">※任意の全ての対象のイニシアチブを＋5してください！</span>`, 'important');
                        updateUI();
                    }
                    return;
                }

                if (passiveCard.name === '共同戦線') {
                    if (player.deck.hasUsedKyoudousensen) {
                        alert('【共同戦線】の効果は1ラウンドに1回しか使用できません。（手札補充でラウンドが更新されます）');
                        return;
                    }
                    logMsg(`【共同戦線】効果発動！<br><span style="color:#ffcc00; font-weight:bold;">※味方の捨札にあるコスト4以下のカード1枚を指定し、自身がコストを支払う（能力値を消費する）ことで即座に使用してください！<br>（手動で能力値を消費し、使用処理を行ってください）</span>`, 'important');
                    player.deck.hasUsedKyoudousensen = true;
                    updateUI();
                    return;
                }

                if (passiveCard.name === '『ブーステッド』') {
                    if (player._boostedUsed) {
                        alert('『ブーステッド』の効果は既に使われています。');
                        return;
                    }
                    const statList = ['肉体', '知性', '精神'];
                    const chosen = prompt("上昇させる能力値を選択してください（肉体、知性、精神のいずれかを入力）：", "肉体");
                    if (chosen && statList.includes(chosen)) {
                        if (chosen === '肉体') { player.stats.body.maxVal += 2; player.stats.body.currentVal += 2; }
                        if (chosen === '知性') { player.stats.int.maxVal += 2; player.stats.int.currentVal += 2; }
                        if (chosen === '精神') { player.stats.men.maxVal += 2; player.stats.men.currentVal += 2; }
                        
                        player._boostedUsed = true;
                        logMsg(`【『ブーステッド』効果発動】<br><span style="color:#ffcc00; font-weight:bold;">任意の能力値「${chosen}」の最大値・現在値が ＋2 された！</span>`, 'important');
                        updateUI();
                    } else if (chosen) {
                        alert('無効な入力です。肉体、知性、精神のいずれかを入力してください。');
                    }
                    return;
                }

                if (passiveCard.name === '『キメラドライブ』') {
                    if (player.deck.summons.length < 2) {
                        alert('合成するには、召喚エリアに2体以上のユニットが必要です。');
                        return;
                    }
                    
                    const synthesisConfirm = confirm(`【『キメラドライブ』】
現在配置されている全ての召喚ユニットを合成しますか？
（合成されたユニットは1体として扱われ、コスト・攻撃・防御が合算されます。また1ラウンドの間に攻撃と防御を1回ずつ行えます）`);
                    
                    if (synthesisConfirm) {
                        let totalCost = 0;
                        let totalAtk = 0;
                        let totalDef = 0;
                        const originalCards = [];
                        
                        // 合算処理（効果文は「召喚・攻X / Y」形式）
                        player.deck.summons.forEach(s => {
                            totalCost += s.card.cost;
                            const atkDefMatch = s.card.effect.match(/攻([0-9０-９]+)\s*[/／]\s*([0-9０-９]+)/);
                            if (atkDefMatch) {
                                totalAtk += parseInt(atkDefMatch[1], 10);
                                totalDef += parseInt(atkDefMatch[2], 10);
                            }
                            originalCards.push(s.card);
                        });
                        
                        // 全召喚ユニットを消去
                        player.deck.summons = [];
                        
                        // 合成獣オブジェクトの生成
                        const chimeraCard = {
                            name: '【合成獣（キメラ）】',
                            category: '召喚',
                            cost: totalCost,
                            strength: 0,
                            effect: `召喚・攻${totalAtk}／防${totalDef}<br>※『キメラドライブ』によって合成されたユニット。1ターンの間に攻撃と防御を1回ずつ行うことができる。<br>※このユニットが破壊された、または廃棄された場合、合成素材となった元のカードはすべて廃棄札へ移動する。`,
                            isChimera: true,
                            originalCards: originalCards
                        };
                        
                        player.deck.summons.push({ card: chimeraCard, stance: 'both' });
                        logMsg(`【『キメラドライブ』効果発動】<br><span style="color:#ffcc00; font-weight:bold;">配置されていた全ての召喚ユニットが合成され、1体の『合成獣（キメラ）』となった！（耐久コスト:${totalCost} / 攻:${totalAtk} / 防:${totalDef}）</span>`, 'important');
                        updateUI();
                    }
                    return;
                }

                if (passiveCard.name === '『アポクリファ』') {
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: "『アポクリファ』：ユニットを召喚",
                            desc: "山札（全カードリスト）から「召喚」カードを1枚指定して、召喚エリアに配置します。",
                            playerObj: player,
                            source: 'all',
                            filterFunc: (c) => c.category.includes('召喚'),
                            onSelect: (selectedCard) => {
                                // 召喚時のスタンス判定
                                let initStance = 'attack'; // デフォルトは攻撃
                                if (selectedCard.effect.includes('召喚・防')) {
                                    initStance = 'defend';
                                } else if (selectedCard.effect.includes('召喚・攻')) {
                                    initStance = 'attack';
                                }
                                if (selectedCard.effect.includes('1ターンの間に攻撃と防御を1回ずつ行うことができる')) {
                                    initStance = 'both';
                                }
                                
                                player.deck.summons.push({ card: selectedCard, stance: initStance });
                                logMsg(`【『アポクリファ』効果発動】<br><span style="color:#00ffff; font-weight:bold;">データベースから「${selectedCard.name}」を指定して召喚した！</span>`, 'important');
                                updateUI();
                            }
                        }
                    }));
                    return;
                }
                
                if (passiveCard.name === 'サラマンダー') {
                    const summonIdx = player.deck.summons.findIndex(s => s.card.name === 'サラマンダー');
                    if (summonIdx > -1) {
                        const salamanderCard = player.deck.summons[summonIdx].card;
                        player.deck.summons.splice(summonIdx, 1);
                        player.deck.void.push(salamanderCard);
                        logMsg(`【サラマンダー】ユニットを廃棄札に送って効果発動！<br><span style="color:#ff5252; font-weight:bold;">※ダメージ＋9！この攻撃にはリアクションできない！</span>`, 'important');
                        updateUI();
                    }
                    return;
                }

                if (passiveCard.name === 'ウンディーネ') {
                    const summonIdx = player.deck.summons.findIndex(s => s.card.name === 'ウンディーネ');
                    if (summonIdx > -1) {
                        const undineCard = player.deck.summons[summonIdx].card;
                        player.deck.summons.splice(summonIdx, 1);
                        player.deck.void.push(undineCard);
                        logMsg(`【ウンディーネ】ユニットを廃棄札に送って効果発動！`, 'important');
                        
                        let remainingCount = 2;
                        const showUndineModal = () => {
                            const validCards = player.deck.void.filter(c => c !== undineCard);
                            if (validCards.length === 0) {
                                if (remainingCount === 2) logMsg(`戻せる廃棄札がありませんでした。`);
                                updateUI();
                                return;
                            }
                            window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                                detail: {
                                    title: `ウンディーネ (残り枠: ${remainingCount}枚)`,
                                    desc: `山札に戻す廃棄札を選んでください。（右上の×で終了）`,
                                    playerObj: player,
                                    source: 'void',
                                    filterFunc: (c) => c !== undineCard,
                                    onSelect: (selectedCard) => {
                                        player.deck.mountain.push(selectedCard);
                                        logMsg(`廃棄札から「${selectedCard.name}」を山札に戻した！`);
                                        remainingCount--;
                                        if (remainingCount > 0) {
                                            setTimeout(showUndineModal, 100);
                                        } else {
                                            updateUI();
                                        }
                                    }
                                }
                            }));
                        };
                        showUndineModal();
                    }
                    return;
                }

                if (passiveCard.name === 'ハンドヘルドコンピュータ') {
                    if (player.deck.mountain.length < 2) {
                        alert('山札が2枚未満のため確認できません。');
                        return;
                    }
                    const card1 = player.deck.mountain[0];
                    const card2 = player.deck.mountain[1];
                    
                    document.getElementById('handheld-card1-name').innerText = card1.name;
                    document.getElementById('handheld-card2-name').innerText = card2.name;
                    
                    // 初期状態として、1枚目を上、2枚目も上（元の順序のまま）とする
                    let pos1 = 'top';
                    let pos2 = 'top';
                    
                    const updateBtnStyles = () => {
                        document.getElementById('btn-hc-c1-top').className = pos1 === 'top' ? 'btn btn-primary' : 'btn btn-secondary';
                        document.getElementById('btn-hc-c1-bottom').className = pos1 === 'bottom' ? 'btn btn-primary' : 'btn btn-secondary';
                        document.getElementById('btn-hc-c2-top').className = pos2 === 'top' ? 'btn btn-primary' : 'btn btn-secondary';
                        document.getElementById('btn-hc-c2-bottom').className = pos2 === 'bottom' ? 'btn btn-primary' : 'btn btn-secondary';
                    };
                    updateBtnStyles();
                    
                    document.getElementById('btn-hc-c1-top').onclick = () => { pos1 = 'top'; updateBtnStyles(); };
                    document.getElementById('btn-hc-c1-bottom').onclick = () => { pos1 = 'bottom'; updateBtnStyles(); };
                    document.getElementById('btn-hc-c2-top').onclick = () => { pos2 = 'top'; updateBtnStyles(); };
                    document.getElementById('btn-hc-c2-bottom').onclick = () => { pos2 = 'bottom'; updateBtnStyles(); };
                    
                    document.getElementById('btn-handheld-confirm').onclick = () => {
                        // 山札から2枚を取り出す
                        const c1 = player.deck.mountain.shift();
                        const c2 = player.deck.mountain.shift();
                        
                        // 下に置くカードと上に置くカードに分ける
                        const toBottom = [];
                        const toTop = [];
                        
                        if (pos1 === 'top') toTop.push(c1); else toBottom.push(c1);
                        if (pos2 === 'top') toTop.push(c2); else toBottom.push(c2);
                        
                        // 下に戻す
                        toBottom.forEach(c => player.deck.mountain.push(c));
                        
                        // 上に戻す（後から入れたものが上に来るように逆順にunshift）
                        // ※例：1枚目も2枚目も上の場合、toTop = [c1, c2]。元の順序にするには c2 を先に入れ、c1 を後に入れるか、単純に配列として結合するか。
                        // Array.prototype.unshift は可変長引数で渡した要素をそのままの順序で先頭に追加する
                        if (toTop.length > 0) {
                            player.deck.mountain.unshift(...toTop);
                        }
                        
                        document.getElementById('handheld-modal').classList.add('hidden');
                        logMsg('【ハンドヘルドコンピュータ】山札の上から2枚を確認し、戻しました。', 'important');
                        updateUI();
                    };
                    
                    document.getElementById('handheld-modal').classList.remove('hidden');
                    return;
                }

                if (passiveCard.name === '錬成の法') {
                    if (player.deck.hand.length === 0) {
                        alert('捨てる手札がありません。');
                        return;
                    }
                    if (player.deck.void.length === 0) {
                        alert('廃棄札がありません。');
                        return;
                    }

                    // まず捨てる手札を選ぶ
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: "錬成の法：捨てる手札を選択",
                            desc: "捨札にする手札を1枚選んでください。",
                            playerObj: player,
                            source: 'hand',
                            filterFunc: (c) => true,
                            onSelect: (discardedCard) => {
                                player.deck.discard.push(discardedCard); // 選択した手札を捨札へ
                                
                                // 次に、回収する廃棄札を選ぶ（捨てたカードのコスト以下）
                                setTimeout(() => {
                                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                                        detail: {
                                            title: "錬成の法：回収する廃棄札を選択",
                                            desc: `コスト ${discardedCard.cost} 以下のカードを選んでください。`,
                                            playerObj: player,
                                            source: 'void',
                                            filterFunc: (c) => c.cost <= discardedCard.cost,
                                            onSelect: (recoveredCard) => {
                                                player.deck.hand.push(recoveredCard); // 回収
                                                // 錬成の法自身をパッシブから捨札へ移動
                                                const passiveIdx = player.deck.passives.indexOf(passiveCard);
                                                if (passiveIdx > -1) {
                                                    player.deck.passives.splice(passiveIdx, 1);
                                                    player.deck.discard.push(passiveCard);
                                                }
                                                logMsg(`【錬成の法】効果発動！手札の「${discardedCard.name}」を捨て、廃棄札から「${recoveredCard.name}」を手札に加えました！<br><small>※錬成の法は使用されたため捨札に移動しました。</small>`, 'important');
                                                updateUI();
                                            }
                                        }
                                    }));
                                }, 100);
                            }
                        }
                    }));
                    return; // 発動フローに入ったのでリターン
                }

                if (passiveCard.name === '錬金術師') {
                    if (player._alchemistUsed) {
                        alert('錬金術師の効果は1ラウンドに1回までです。');
                        return;
                    }
                    if (player.deck.hand.length === 0) {
                        alert('捨てる手札がありません。');
                        return;
                    }
                    if (player.deck.discard.length === 0) {
                        alert('捨札がありません。');
                        return;
                    }

                    // まず捨てる手札を選ぶ
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: "錬金術師：捨てる手札を選択",
                            desc: "捨てる手札を1枚選んでください。",
                            playerObj: player,
                            source: 'hand',
                            filterFunc: (c) => true,
                            onSelect: (discardedCard) => {
                                player.deck.discard.push(discardedCard); // 選択した手札を捨札へ
                                
                                // 次に、回収する捨札を選ぶ（捨てたカードのコスト以下）
                                setTimeout(() => {
                                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                                        detail: {
                                            title: "錬金術師：回収する捨札を選択",
                                            desc: `コスト ${discardedCard.cost} 以下のカードを選んでください。`,
                                            playerObj: player,
                                            source: 'discard',
                                            filterFunc: (c) => c.cost <= discardedCard.cost,
                                            onSelect: (recoveredCard) => {
                                                player.deck.hand.push(recoveredCard); // 回収
                                                player._alchemistUsed = true; // 1ラウンド1回の制限フラグ
                                                logMsg(`【錬金術師】効果発動！手札の「${discardedCard.name}」を捨て、捨札から「${recoveredCard.name}」を回収しました！`, 'important');
                                                updateUI();
                                            }
                                        }
                                    }));
                                }, 100);
                            }
                        }
                    }));
                }
            }
        });
    }
    
    els.btnUseCard.addEventListener('click', () => {
        if (selectedCardIndex !== null) {
            const card = selectedCardSource === 'psychometry' 
                ? player.deck.mountain[selectedCardIndex] 
                : player.deck.hand[selectedCardIndex];
            
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
            
            if (selectedCardSource === 'psychometry') {
                player.deck.mountain.splice(selectedCardIndex, 1);
            } else {
                player.deck.hand.splice(selectedCardIndex, 1); 
            }
            player.deck.discard.push(card); 
            currentCombo.push(card);
            
            const displayCost = getDisplayCost(card, player);
            logMsg(`「${card.name}」（コスト:${displayCost} / 強度:${card.strength || 0}）を場に出した！`);
            if (displayCost < card.cost) {
                logMsg(`<span style="color:#ffcc00; font-size:0.8rem;">※効果によりコストが軽減されています</span>`);
            }
            
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
            
            // 魂の応援歌のログ出力
            if (card.name === '魂の応援歌') {
                logMsg(`【魂の応援歌】コンボ元のカードは、使用者の該当能力値以下のコストだった場合、即座に対象の手札に戻ります！（※味方は対象カードを手動で手札に戻してください）`, 'important');
            }
            // 英雄のファンファーレのログ出力
            if (card.name === '英雄のファンファーレ') {
                logMsg(`【英雄のファンファーレ】対象の味方1人のイニシアチブを＋3！<br>さらに、対象の味方はこのラウンドの回収フェイズ時、任意の能力値の回収枠が＋2されます。（※回収枠を超える場合は、捨札リストの『手札へ』ボタンで手動回収してください）<br><span style="color:#ffcc00; font-size:0.8rem;">※この効果はこのカードが捨札にある間持続します。手札や山札、廃棄札など、捨札以外に移動した時に効果は失われます。</span>`, 'important');
            }
            if (card.name === 'クイックリロード') {
                let remainingCost = 6;
                const showQuickReloadModal = () => {
                    const validCards = player.deck.discard.filter(c => c.effect.includes('弾丸') && c.cost <= remainingCost);
                    if (validCards.length === 0) {
                        if (remainingCost === 6) {
                            logMsg(`【クイックリロード】回収可能な「弾丸」カードが捨札にありませんでした。`);
                        } else {
                            logMsg(`【クイックリロード】回収を終了しました。（残りコスト枠: ${remainingCost}）`);
                        }
                        updateUI();
                        return;
                    }
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: `クイックリロード (残り枠: ${remainingCost})`,
                            desc: `回収する「弾丸」カードを選んでください。（右上の×で終了）`,
                            playerObj: player,
                            filterFunc: (c) => c.effect.includes('弾丸') && c.cost <= remainingCost,
                            onSelect: (selectedCard) => {
                                player.deck.hand.push(selectedCard);
                                remainingCost -= selectedCard.cost;
                                logMsg(`【クイックリロード】捨札から「${selectedCard.name}」を回収した！`);
                                if (remainingCost > 0) {
                                    setTimeout(showQuickReloadModal, 100);
                                } else {
                                    updateUI();
                                }
                            }
                        }
                    }));
                };
                showQuickReloadModal();
            }

            if (card.name === '癒しの雫') {
                let remainingCost = 6;
                const showIyashiModal = () => {
                    const validCards = player.deck.void.filter(c => c.cost <= remainingCost);
                    if (validCards.length === 0) {
                        if (remainingCost === 6) {
                            logMsg(`【癒しの雫】山札に戻せる廃棄札がありませんでした。`);
                        } else {
                            logMsg(`【癒しの雫】処理を終了しました。（残りコスト枠: ${remainingCost}）`);
                        }
                        updateUI();
                        return;
                    }
                    window.dispatchEvent(new CustomEvent('requestRecoverCard', {
                        detail: {
                            title: `癒しの雫 (残り枠: ${remainingCost})`,
                            desc: `山札に戻す廃棄札を選んでください。（右上の×で終了）`,
                            playerObj: player,
                            source: 'void',
                            filterFunc: (c) => c.cost <= remainingCost,
                            onSelect: (selectedCard) => {
                                player.deck.mountain.push(selectedCard); // 廃棄札から山札へ（シャッフル等する場合deck.cardsかmountainか。このアプリはそのまま一番下でOKならcardsに入れてshuffleするか。既存はどこに？）
                                // 既存の btnVoidView では player.deck.mountain.push(selectedCard) で戻している
                                logMsg(`【癒しの雫】廃棄札から「${selectedCard.name}」を山札に戻した！`);
                                remainingCost -= selectedCard.cost;
                                if (remainingCost > 0) {
                                    setTimeout(showIyashiModal, 100);
                                } else {
                                    updateUI();
                                }
                            }
                        }
                    }));
                };
                showIyashiModal();
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


    // --- 能力値回復イベント ---
    window.addEventListener('requestStatHeal', (e) => {
        const { amount, desc, onComplete, playerObj } = e.detail;
        const modal = document.getElementById('heal-stat-modal');
        document.getElementById('heal-stat-desc').innerText = desc || `回復する能力値を1つ選んでください。（各${amount}点回復します）`;

        const updateBtn = (statId, statObj) => {
            document.getElementById(`heal-curr-${statId}`).innerText = statObj.currentVal;
            document.getElementById(`heal-max-${statId}`).innerText = statObj.maxVal;
            const btn = document.getElementById(`btn-heal-${statId}`);
            if (statObj.currentVal >= statObj.maxVal) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
            }
            // 既存のリスナーを削除して新しく登録（簡易的にクローンする）
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
                statObj.currentVal = Math.min(statObj.maxVal, statObj.currentVal + amount);
                logMsg(`【回復】${statId === 'body' ? '肉体' : statId === 'int' ? '知性' : '精神'}のダメージを ${amount} 点回復しました。`);
                modal.classList.add('hidden');
                updateUI();
                if (onComplete) onComplete();
            });
        };

        updateBtn('body', playerObj.stats.body);
        updateBtn('int', playerObj.stats.int);
        updateBtn('men', playerObj.stats.men);

        document.getElementById('btn-close-heal-stat').onclick = () => {
            modal.classList.add('hidden');
        };

        modal.classList.remove('hidden');
    });

    // --- 汎用回収イベント（捨札/廃棄札/手札選択） ---
    window.addEventListener('requestRecoverCard', (e) => {
        const { filterFunc, title, desc, onSelect, playerObj, source } = e.detail;
        let sourceArray;
        if (source === 'void') sourceArray = playerObj.deck.void;
        else if (source === 'hand') sourceArray = playerObj.deck.hand;
        else if (source === 'mountain') sourceArray = playerObj.deck.mountain;
        else if (source === 'all') sourceArray = cardPool;
        else if (source === 'void_or_discard') sourceArray = [...playerObj.deck.void, ...playerObj.deck.discard];
        else if (source === 'hand_or_discard') sourceArray = [...playerObj.deck.hand, ...playerObj.deck.discard];
        else sourceArray = playerObj.deck.discard;

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
                const dCost = getDisplayCost(card, playerObj);
                let costDisplay = `コスト: ${card.cost}`;
                if (dCost < card.cost) {
                    costDisplay = `コスト: <span style="text-decoration: line-through;">${card.cost}</span> <span style="color:#ffcc00;">${dCost}</span> <span style="color:#ffcc00; font-size:0.7rem;">(軽減適用)</span>`;
                }

                item.innerHTML = `
                    <div><strong>${card.name}</strong><br><small style="color:#aaa;">${card.category}</small></div>
                    <div style="text-align:right;">
                        <div>${costDisplay}</div>
                        <button class="btn btn-primary" style="font-size:0.7rem; padding:2px 5px; margin-top:5px; width:100%;">選択</button>
                    </div>
                `;
                item.addEventListener('click', () => {
                    if (source === 'void_or_discard') {
                        const vIdx = playerObj.deck.void.lastIndexOf(card);
                        if (vIdx > -1) {
                            playerObj.deck.void.splice(vIdx, 1);
                        } else {
                            const dIdx = playerObj.deck.discard.lastIndexOf(card);
                            if (dIdx > -1) playerObj.deck.discard.splice(dIdx, 1);
                        }
                    } else if (source === 'hand_or_discard') {
                        const hIdx = playerObj.deck.hand.lastIndexOf(card);
                        if (hIdx > -1) {
                            playerObj.deck.hand.splice(hIdx, 1);
                        } else {
                            const dIdx = playerObj.deck.discard.lastIndexOf(card);
                            if (dIdx > -1) playerObj.deck.discard.splice(dIdx, 1);
                        }
                    } else {
                        const idx = sourceArray.lastIndexOf(card);
                        if (idx > -1) {
                            sourceArray.splice(idx, 1);
                        }
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
        player.deck.passives.forEach((card, originalIdx) => {
            const pDiv = document.createElement('div');
            pDiv.className = 'passive-card';
            if (card.isDisabled) pDiv.classList.add('disabled-passive');
            
            pDiv.innerHTML = `
                <div class="passive-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="passive-name" style="cursor:pointer;">
                        <strong>${card.name}</strong> ${card.isDisabled ? '<span style="color:#ff5252; font-size:0.7rem;">[無効]</span>' : `(強度+${card.strength || 0})`}
                    </div>
                    <label style="font-size:0.7rem; color:#aaa; margin-left:10px;" onclick="event.stopPropagation();">
                        <input type="checkbox" class="passive-disable-chk" ${card.isDisabled ? 'checked' : ''}> 裏返し
                    </label>
                </div>
            `;
            
            pDiv.querySelector('.passive-name').addEventListener('click', () => {
                openCardModal(card, originalIdx, true); // isPassive = true
            });
            
            pDiv.querySelector('.passive-disable-chk').addEventListener('change', (e) => {
                card.isDisabled = e.target.checked;
                updateUI();
            });
            
            els.passiveArea.appendChild(pDiv);
        });
    } else {
        els.passiveArea.innerHTML = '<span style="color:#555; font-size:0.75rem;">なし</span>';
    }
    
    // 召喚エリアの描画
    els.summonArea.innerHTML = '';
    if (player.deck.summons.length > 0) {
        const honnouBuff = player.deck.discard.filter(c => c.name === '本能の覚醒').length * 2;
        const jusoBuff = player.deck.passives.filter(c => c.name === '獣操棍' && !c.isDisabled).length * 1;
        player.deck.summons.forEach((s, idx) => {
            let atk = "?", def = "?";
            const match = s.card.effect.match(/攻(\d+)\s*[／/]\s*(?:防)?(\d+)/);
            if (match) {
                let atkVal = parseInt(match[1], 10);
                let defVal = parseInt(match[2], 10);
                if (s.elementalerBuff) {
                    atkVal += 2 * s.elementalerBuff;
                    defVal += 2 * s.elementalerBuff;
                }
                atkVal += honnouBuff + jusoBuff;
                defVal += honnouBuff + jusoBuff;
                
                // スプリガンの独自処理（パッシブ強度の合計値を攻防に加算）
                if (s.card.name === 'スプリガン') {
                    const passiveStrSum = player.deck.passives.reduce((sum, p) => sum + (p.isDisabled ? 0 : (p.strength || 0)), 0);
                    atkVal += passiveStrSum;
                    defVal += passiveStrSum;
                }
                
                atk = atkVal;
                def = defVal;
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
                if (s.card.name === '災厄の群魔') {
                    const useSpecial = confirm("【災厄の群魔】の行動を選択してください。\n\n「OK」：特殊効果を使用する\n（任意の対象全ての山札1枚を捨札へ。このラウンドは攻撃スタンスになりません）\n\n「キャンセル」：通常通り「攻撃スタンス（攻5）」にする");
                    if (useSpecial) {
                        logMsg(`【災厄の群魔の特殊効果】任意の対象全ての山札1枚を捨札に移動する！<br><span style="color:#ff5252; font-size:0.8rem;">（※この効果を使用したラウンドは、ユニットとしての攻撃・防御は行えない）</span>`, 'important');
                        s.stance = null; 
                        updateUI();
                        return;
                    }
                }

                if (s.card.isChimera || s.card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる')) {
                    if (s.stance === 'defend' || s.stance === 'both') s.stance = 'both';
                    else s.stance = 'both';
                } else {
                    s.stance = 'attack';
                }
                
                if (s.card.name === 'ベヒーモス') {
                    logMsg(`【ベヒーモスの攻撃】任意の対象全員に対して、それぞれ「3点」のダメージ！`, 'damage');
                }
                
                if (s.card.name === 'シャドウストーカー') {
                    logMsg(`【シャドウストーカーの攻撃】相手の手札を全て公開させ、その中から1枚を指定して捨札に移動させる！<br><span style="color:#aaa; font-size:0.8rem;">（※対象以外が代わりに受けることはできない）</span>`, 'damage');
                    player.deck.summons.splice(idx, 1);
                    player.deck.void.push(s.card);
                    logMsg(`「シャドウストーカー」は攻撃使用後、自身の効果によって廃棄札に移動した。`, 'important');
                    updateUI();
                    return;
                }
                
                if (s.card.name === 'ブラッドピット・バット') {
                    logMsg(`【ブラッドピット・バットの攻撃】攻撃でダメージを与えた時、対象の任意の手札を捨札へ送る。その後、自身の山札から1枚ドローする。`, 'damage');
                }
                
                if (s.card.name === 'エアロタロン') {
                    logMsg(`【エアロタロンの効果】任意の一体のイニシアチブを「-2」する！`, 'important');
                }
                
                if (s.card.name === 'ヴェノムラプター') {
                    logMsg(`【ヴェノムラプターの攻撃】このユニットの攻撃がダメージを与えた時、対象は任意の手札1枚を捨札に移動する。`, 'damage');
                }
                
                if (s.card.name === 'ヴァイパーヴァイン') {
                    logMsg(`【ヴァイパーヴァインの攻撃】ダメージを与えた時、対象のコスト3以下の捨札1枚を廃棄札に移動させる！`, 'damage');
                }
                
                if (s.card.name === '熱砂の魔神') {
                    logMsg(`【熱砂の魔神の攻撃】ダメージを与えた時、対象のコスト3以下の捨札1枚を廃棄札に移動させる！`, 'damage');
                }
                
                if (s.card.name === 'マインドブレイク・フラウ') {
                    logMsg(`【マインドブレイク・フラウの宣言】このユニットが場に存在する限り、相手陣営は回収タイミングの合計ポイントが-1される！`, 'important');
                }
                
                if (s.card.name === 'フリップサイド・ヒュドラ') {
                    logMsg(`【フリップサイド・ヒュドラの攻撃】①『多頭の暴虐』：任意の対象全員に4点のダメージ！`, 'damage');
                }
                
                if (s.card.name === '泥瘴の悪鬼') {
                    logMsg(`【泥瘴の悪鬼の攻撃】任意の対象全ての回収ポイントを-1する！`, 'damage');
                }
                
                if (s.card.name === '呪縛の悪霊') {
                    logMsg(`【呪縛の悪霊の効果】任意の対象1体はコスト2以下のカードを使用できない！<br><span style="color:#aaa; font-size:0.8rem;">（※この効果は、このユニットが場から廃棄札に送られるまで持続する）</span>`, 'important');
                }
                
                if (s.card.name === '砂の呪骸') {
                    logMsg(`【砂の呪骸の効果】任意の対象1体のイニシアチブを「-2」する！`, 'important');
                }
                
                if (s.card.name === '深淵の触魔') {
                    logMsg(`【深淵の触魔の効果】対象の任意の手札1枚を指定し、その戦闘中使用不可（ロック）にする！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、指定された手札をこの戦闘中使わないようにしてください）</span>`, 'important');
                }
                
                if (s.card.name === '浸食の骸樹') {
                    logMsg(`【浸食の骸樹の効果】任意の捨札1枚を廃棄札に移動させる！その後、自身の山札から1枚ドローした！`, 'important');
                    player.deck.draw(1);
                }
                
                if (s.card.name === '泥濘の人形') {
                    logMsg(`【泥濘の人形の効果】任意の対象全ては、そのターンの「コンボ」を最大2枚までに制限される！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、このラウンドのコンボ枚数を自己管理してください）</span>`, 'important');
                }
                
                if (s.card.name === '狂雷の凶鳥') {
                    logMsg(`【狂雷の凶鳥の攻撃】このユニットのダメージはリアクションすることができない！`, 'damage');
                }
                
                if (s.card.name === 'テクトニックライノ') {
                    logMsg(`【テクトニックライノの効果】任意の全ての対象は、手札からコスト3以下のカード1枚を選び捨札に移動する！`, 'damage');
                }
                
                if (s.card.name === 'ファントムレオ') {
                    logMsg(`【ファントムレオの攻撃】この攻撃はリアクション不可！`, 'damage');
                }
                
                if (s.card.name === 'フォレストコング') {
                    logMsg(`【フォレストコングの攻撃】任意のカードを指定して攻撃する！（身代わり無視／狙い撃ち）`, 'damage');
                }
                
                if (s.card.name === 'ミストストーカー') {
                    logMsg(`【ミストストーカーの攻撃】この攻撃に対し、対象は「肉体」カテゴリーのリアクションを使用することができない！`, 'damage');
                }
                
                updateUI();
            });
            sDiv.querySelector('.btn-def').addEventListener('click', () => {
                if (s.card.isChimera || s.card.effect.includes('このユニットは1ターンの間に攻撃と防御を1回ずつ行うことができる')) {
                    if (s.stance === 'attack' || s.stance === 'both') s.stance = 'both';
                    else s.stance = 'both';
                } else {
                    s.stance = 'defend';
                }
                
                if (s.card.name === 'ガイアグリズリー') {
                    logMsg(`【ガイアグリズリーの防御】コスト1のカードを無効化する！`, 'important');
                }
                
                if (s.card.name === 'ガイアギガース') {
                    logMsg(`【ガイアギガースの防御】そのラウンドの「精神」または「知性」カテゴリーの効果を1枚無効化する！`, 'important');
                }
                
                if (s.card.name === '呪縛の悪霊') {
                    logMsg(`【呪縛の悪霊の効果】任意の対象1体はコスト2以下のカードを使用できない！<br><span style="color:#aaa; font-size:0.8rem;">（※この効果は、このユニットが場から廃棄札に送られるまで持続する）</span>`, 'important');
                }
                
                if (s.card.name === '砂の呪骸') {
                    logMsg(`【砂の呪骸の効果】任意の対象1体のイニシアチブを「-2」する！`, 'important');
                }
                
                if (s.card.name === '深淵の触魔') {
                    logMsg(`【深淵の触魔の効果】対象の任意の手札1枚を指定し、その戦闘中使用不可（ロック）にする！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、指定された手札をこの戦闘中使わないようにしてください）</span>`, 'important');
                }
                
                if (s.card.name === '浸食の骸樹') {
                    logMsg(`【浸食の骸樹の効果】任意の捨札1枚を廃棄札に移動させる！その後、自身の山札から1枚ドローした！`, 'important');
                    player.deck.draw(1);
                }
                
                if (s.card.name === '泥濘の人形') {
                    logMsg(`【泥濘の人形の効果】任意の対象全ては、そのターンの「コンボ」を最大2枚までに制限される！<br><span style="color:#aaa; font-size:0.8rem;">（※対象となったプレイヤーは、このラウンドのコンボ枚数を自己管理してください）</span>`, 'important');
                }
                
                updateUI();
            });
            sDiv.querySelector('.summon-btn-dismiss').addEventListener('click', () => {
                if (confirm(`${s.card.name} を廃棄札へ移動してよろしいですか？\n（※「廃棄札に移動することで〜」等の効果を発動する場合に使用します）`)) {
                    player.deck.summons.splice(idx, 1);
                    if (s.card.isChimera && s.card.originalCards) {
                        // 合成獣の場合、素材カードを全て廃棄札へ
                        s.card.originalCards.forEach(c => player.deck.void.push(c));
                        logMsg(`合成獣「${s.card.name}」を解体！<br><span style="color:#00ffff; font-weight:bold;">合成素材となっていた全てのカードが廃棄札に移動した！</span>`, 'important');
                    } else if (s.card.name === 'シルフ') {
                        player.deck.hand.push(s.card);
                        logMsg(`「${s.card.name}」は破壊され、手札に戻った！`);
                    } else {
                        player.deck.void.push(s.card);
                        let effectText = s.card.effect;
                        if (s.card.name === 'スプリガン') {
                            effectText = `<span style="color:#ffcc00; font-weight:bold;">※現在の「攻」の数値： ${atk} </span><br>` + effectText;
                        }
                        if (s.card.name === 'ベヒーモス') {
                            effectText = `<span style="color:#ffcc00; font-weight:bold;">※任意の対象全員に対して、それぞれ「6点」のダメージ！</span><br>` + effectText;
                        }
                        if (s.card.name === 'フロストシェル') {
                            effectText = `<span style="color:#00ffff; font-weight:bold;">※このラウンド中、自身または味方が受ける「知性」カテゴリーのダメージをすべて「0」にする！</span><br>` + effectText;
                        }
                        logMsg(`召喚ユニット「${s.card.name}」を廃棄札へ移動しました！<br><span style="color:#aaa; font-size:0.8rem;">【効果】${effectText}</span>`, 'important');
                    }
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
        const dCost = getDisplayCost(card, player);
        const costColor = dCost < card.cost ? '#ffcc00' : 'inherit';
        cardDiv.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-cat">${card.category}</div>
            <div class="card-stats"><span>C:<span style="color:${costColor}">${dCost}</span></span><span>S:+${card.strength}</span></div>
            <div class="card-effect">${card.effect}</div>
        `;
        cardDiv.addEventListener('click', () => openCardModal(card, index));
        cardDiv.style.zIndex = index;
        els.handContainer.appendChild(cardDiv);
    });
    
    // ---------------------------------
    // サイコメトリーの描画
    // ---------------------------------
    const hasPsychometry = player.deck.passives.some(p => p.name === 'サイコメトリー' && !p.isDisabled);
    if (els.psychometryArea && els.psychometryContainer) {
        if (hasPsychometry && player.deck.mountain.length > 0) {
            els.psychometryArea.classList.remove('hidden');
            els.psychometryContainer.innerHTML = '';
            
            const maxView = Math.min(3, player.deck.mountain.length);
            for (let i = 0; i < maxView; i++) {
                const card = player.deck.mountain[i];
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card';
                cardDiv.style.transform = 'scale(0.9)'; // 少し小さめに
                cardDiv.style.transformOrigin = 'top left';
                const dCost = getDisplayCost(card, player);
                const costColor = dCost < card.cost ? '#ffcc00' : 'inherit';
                cardDiv.innerHTML = `
                    <div class="card-name">${card.name}</div>
                    <div class="card-cat">${card.category}</div>
                    <div class="card-stats"><span>C:<span style="color:${costColor}">${dCost}</span></span><span>S:+${card.strength}</span></div>
                    <div class="card-effect">${card.effect}</div>
                `;
                cardDiv.addEventListener('click', () => openCardModal(card, i, false, false, true));
                els.psychometryContainer.appendChild(cardDiv);
            }
        } else {
            els.psychometryArea.classList.add('hidden');
            els.psychometryContainer.innerHTML = '';
        }
    }

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
            const hasMadanjushi = player.deck.passives.some(p => p.name === '魔弾銃士' && !p.isDisabled);
            const str = hasMadanjushi ? 4 : 3;
            debuffArea.innerHTML += `
                <div style="background-color: rgba(50, 150, 255, 0.2); border-left: 4px solid #66b3ff; padding: 5px; font-size: 0.8rem; color: #cce6ff; border-radius: 3px;">
                    <strong>❄️ 氷雪魔弾効果発動中！</strong><br>
                    対象が <b>コスト${str} 以下</b> のカードを回収する際、コストが＋1されます。
                </div>
            `;
        }
        
        const fukatsuCount = player.deck.discard.filter(c => c.name === '賦活の秘薬').length;
        if (fukatsuCount > 0) {
            debuffArea.innerHTML += `
                <div style="background-color: rgba(50, 200, 100, 0.2); border-left: 4px solid #4dff88; padding: 5px; font-size: 0.8rem; color: #b3ffcc; border-radius: 3px; margin-top: 5px;">
                    <strong>🧪 賦活の秘薬 効果適用中！</strong><br>
                    すべての回収ポイントが ＋${fukatsuCount} されています。
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

let selectedCardSource = 'hand'; // 'hand' or 'psychometry'
function openCardModal(card, index, isPassive = false, isCombo = false, isPsychometry = false) {
    selectedCardIndex = index;
    selectedCardSource = isPsychometry ? 'psychometry' : 'hand';
    els.mTitle.innerText = card.name;
    els.mCat.innerText = card.category;
    const dCost = getDisplayCost(card, player);
    els.mCost.innerText = dCost;
    if (dCost < card.cost) {
        els.mCost.style.color = '#ffcc00';
    } else {
        els.mCost.style.color = 'inherit';
    }
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
            const btnDiscard = document.getElementById('btn-discard-card');
            if (btnDiscard) btnDiscard.classList.add('hidden'); // パッシブエリアのカードは捨てられない
            const btnVoid = document.getElementById('btn-void-card');
            if (btnVoid) btnVoid.classList.add('hidden');

            // 発動可能なパッシブ効果の判定
            if (els.btnTriggerPassive) {
                if (isPassive && card.isDisabled) {
                    els.btnTriggerPassive.classList.add('hidden');
                    return;
                }
                if (card.name === '錬金術師') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '『ブーステッド』') {
                    if (player._boostedUsed) {
                        els.btnTriggerPassive.innerText = '使用済み';
                        els.btnTriggerPassive.disabled = true;
                        els.btnTriggerPassive.classList.remove('hidden');
                    } else {
                        els.btnTriggerPassive.innerText = '効果を発動（能力値+2）';
                        els.btnTriggerPassive.disabled = false;
                        els.btnTriggerPassive.classList.remove('hidden');
                    }
                } else if (card.name === '『キメラドライブ』') {
                    els.btnTriggerPassive.innerText = '効果を発動（合成）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '『アポクリファ』') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '武具錬成') {
                    els.btnTriggerPassive.innerText = '効果を共有';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '錬成の法') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === 'ハンドヘルドコンピュータ') {
                    els.btnTriggerPassive.innerText = '効果を発動（山札確認）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === 'ファミリア') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === 'バディビースト' || card.name === '相棒の獣' || card.name === '相棒の鳥' || card.name === '相棒の竜') {
                    els.btnTriggerPassive.innerText = '自身を召喚する';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '金の加護') {
                    els.btnTriggerPassive.innerText = '効果を発動';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === 'エレメンタラー') {
                    els.btnTriggerPassive.innerText = '効果を発動（対象ユニットの攻防＋2）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === 'ノーム') {
                    els.btnTriggerPassive.innerText = '効果を発動（ユニット廃棄）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === 'シルフ') {
                    els.btnTriggerPassive.innerText = '効果を発動（イニシアチブ＋5）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '共同戦線') {
                    els.btnTriggerPassive.innerText = '効果を発動（味方のカードを使用）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === 'ウンディーネ') {
                    els.btnTriggerPassive.innerText = '効果を発動（廃棄札2枚を山札へ）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === 'サラマンダー') {
                    els.btnTriggerPassive.innerText = '効果を発動（ダメージ＋9）';
                    els.btnTriggerPassive.classList.remove('hidden');
                } else if (card.name === '『不死者』') {
                    if (player._undeadUsed) {
                        els.btnTriggerPassive.innerText = '使用済み';
                        els.btnTriggerPassive.disabled = true;
                        els.btnTriggerPassive.classList.remove('hidden');
                    } else {
                        els.btnTriggerPassive.innerText = '効果を発動（コスト3以下を無償回収）';
                        els.btnTriggerPassive.disabled = false;
                        els.btnTriggerPassive.classList.remove('hidden');
                    }
                } else {
                    els.btnTriggerPassive.classList.add('hidden');
                }
            }
        } else {
            if (els.btnTriggerPassive) els.btnTriggerPassive.classList.add('hidden');
            const btnDiscard = document.getElementById('btn-discard-card');
            if (btnDiscard) btnDiscard.classList.remove('hidden'); // 手札は捨てられる
            const btnVoid = document.getElementById('btn-void-card');
            if (btnVoid) btnVoid.classList.remove('hidden');
            els.btnUseCard.classList.remove('hidden');
            if (els.btnSetCard) {
                const hasTouzen = player.deck.passives.some(p => p.name === '闘禅一致' && !p.isDisabled);
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
