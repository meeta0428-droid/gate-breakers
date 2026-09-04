with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add CSS for prof-input
css_block = """
    .prof-input {
        width: 100%;
        box-sizing: border-box;
        background: #111;
        color: #fff;
        border: 1px solid #444;
        border-radius: 4px;
        padding: 8px;
        margin-top: 5px;
        font-family: inherit;
        font-size: 0.9rem;
    }
    .profile-form label {
        display: block;
        font-size: 0.9rem;
        color: #ccc;
    }
"""
html = html.replace("</style>", css_block + "\n    </style>")

# Add button
btn_html = '<button id="btn-chara-profile" class="btn" style="padding:8px 12px; flex:none; font-size:0.8rem; background:#8e44ad;">設定・10の質問</button>'
html = html.replace('<button id="btn-deck-to-chara"', btn_html + '\n                    <button id="btn-deck-to-chara"')

# Add modal
modal_html = """
    <!-- キャラクター設定モーダル -->
    <div id="profile-modal" class="modal hidden">
        <div class="modal-content" style="max-height: 85vh; overflow-y: auto; text-align: left;">
            <h2 style="text-align: center; margin-bottom: 10px;">キャラクター設定</h2>
            
            <div class="profile-form" style="display: flex; flex-direction: column; gap: 15px;">
                <label>名前 <input type="text" id="prof-name" class="prof-input"></label>
                <label>性別 <input type="text" id="prof-gender" class="prof-input"></label>
                <label>年齢 <input type="text" id="prof-age" class="prof-input"></label>
                <label>大事なもの <input type="text" id="prof-important" class="prof-input"></label>
                <label>嫌いなもの <input type="text" id="prof-dislike" class="prof-input"></label>
                <label>身長・体重・外見 <textarea id="prof-appearance" rows="3" class="prof-input"></textarea></label>
                <label>メモ <textarea id="prof-memo" rows="4" class="prof-input"></textarea></label>

                <h3 style="margin-top: 15px; font-size: 1rem; color: #ffcc00; border-bottom: 1px solid #444; padding-bottom: 5px;">プレイヤーキャラクターへの10の質問</h3>
                
                <label>1. ゲートが現れる前の現代日本で、あなたは何をして生きていましたか？
                    <textarea id="prof-q1" rows="3" class="prof-input"></textarea>
                </label>
                <label>2. 近代兵器が通じない絶望の中、あなたが初めて「マナの力」に覚醒したのはどんな状況でしたか？
                    <textarea id="prof-q2" rows="3" class="prof-input"></textarea>
                </label>
                <label>3. あなたの扱う武器や防具は、どんな魔獣の部位（骨、牙、鱗）や、未知の自然素材から作られていますか？
                    <textarea id="prof-q3" rows="3" class="prof-input"></textarea>
                </label>
                <label>4. 異界砕きとして活動する中で、どうしても手放せずに持ち歩いている「思い入れの品」は何ですか？
                    <textarea id="prof-q4" rows="3" class="prof-input"></textarea>
                </label>
                <label>5. 怪物と対峙する時、あなたは「野生の勘（肉体）」「冷徹な観察眼（知性）」「揺るぎない心（精神）」のどれを最も頼りにしていますか？
                    <textarea id="prof-q5" rows="3" class="prof-input"></textarea>
                </label>
                <label>6. 限界まで追い詰められ、戦術も体力も尽きかけた時、あなたを再び奮い立たせる「記憶」や「感情」は何ですか？
                    <textarea id="prof-q6" rows="3" class="prof-input"></textarea>
                </label>
                <label>7. あなたにとって「煉獄の怪物」とは何ですか？
                    <textarea id="prof-q7" rows="3" class="prof-input"></textarea>
                </label>
                <label>8. 激しい死闘を終えた後、拠点での短い休息の間、あなたはどうやって過ごすことが多いですか？
                    <textarea id="prof-q8" rows="3" class="prof-input"></textarea>
                </label>
                <label>9. 生き残るだけでなく、命を懸けて次元の裂け目を閉じる「ゲートブレイカー」となった決定的な理由は何ですか？
                    <textarea id="prof-q9" rows="3" class="prof-input"></textarea>
                </label>
                <label>10. もし全てのゲートが閉じられ、世界に新たな調和が訪れたら、一番最初にやりたいことは何ですか？
                    <textarea id="prof-q10" rows="3" class="prof-input"></textarea>
                </label>
            </div>
            
            <div class="modal-actions" style="margin-top:20px; display:flex; gap:10px;">
                <button id="btn-save-profile" class="btn btn-action" style="flex:1;">保存して閉じる</button>
                <button id="btn-close-profile" class="btn btn-secondary" style="flex:1;">キャンセル</button>
            </div>
        </div>
    </div>
"""

html = html.replace('<!-- リアクションモーダル -->', modal_html + '\n    <!-- リアクションモーダル -->')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

