import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# setupEvents() 内の `if (els.btnTriggerPassive) { els.btnTriggerPassive.addEventListener... }` を全てごっそり書き換える
old_listener_start = "    if (els.btnTriggerPassive) {\n        els.btnTriggerPassive.addEventListener('click', () => {"

# このブロックの終わりを見つけるのは正規表現では難しいので、
# まず openCardModal 関数内にある btnTriggerPassive への処理を、クリック時に直接実行する onclick 属性（インライン）に変えるか、
# あるいは openCardModal の中で btnTriggerPassive.onclick = () => { ... } と直接上書きしてしまうのが最も確実。
