with open('app_v6.js', 'r', encoding='utf-8') as f:
    js = f.read()

events_str = """
    // キャラ設定モーダル
    const btnCharaProfile = document.getElementById('btn-chara-profile');
    const profileModal = document.getElementById('profile-modal');
    if (btnCharaProfile && profileModal) {
        btnCharaProfile.addEventListener('click', () => {
            if (!player.profile) player.profile = {};
            
            // Load current profile into inputs
            document.getElementById('prof-name').value = player.profile.name || player.name || '';
            document.getElementById('prof-gender').value = player.profile.gender || '';
            document.getElementById('prof-age').value = player.profile.age || '';
            document.getElementById('prof-important').value = player.profile.important || '';
            document.getElementById('prof-dislike').value = player.profile.dislike || '';
            document.getElementById('prof-appearance').value = player.profile.appearance || '';
            document.getElementById('prof-memo').value = player.profile.memo || '';
            for (let i = 1; i <= 10; i++) {
                document.getElementById('prof-q' + i).value = player.profile['q' + i] || '';
            }
            
            profileModal.classList.remove('hidden');
        });
        
        document.getElementById('btn-close-profile').addEventListener('click', () => {
            profileModal.classList.add('hidden');
        });
        
        document.getElementById('btn-save-profile').addEventListener('click', () => {
            if (!player.profile) player.profile = {};
            
            player.profile.name = document.getElementById('prof-name').value;
            player.name = player.profile.name; // player.nameにも反映
            player.profile.gender = document.getElementById('prof-gender').value;
            player.profile.age = document.getElementById('prof-age').value;
            player.profile.important = document.getElementById('prof-important').value;
            player.profile.dislike = document.getElementById('prof-dislike').value;
            player.profile.appearance = document.getElementById('prof-appearance').value;
            player.profile.memo = document.getElementById('prof-memo').value;
            for (let i = 1; i <= 10; i++) {
                player.profile['q' + i] = document.getElementById('prof-q' + i).value;
            }
            
            alert('キャラクター設定を保存しました。\\n※デッキを保存（またはバトル開始）するまで永続化されません。');
            profileModal.classList.add('hidden');
        });
    }
"""

js = js.replace("els.btnCloseSave.addEventListener('click', () => els.saveModal.classList.add('hidden'));", "els.btnCloseSave.addEventListener('click', () => els.saveModal.classList.add('hidden'));\n" + events_str)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(js)

