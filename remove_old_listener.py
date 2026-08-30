import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 正規表現で `if (els.btnTriggerPassive) { els.btnTriggerPassive.addEventListener... }` のブロック全体を削除する
# 非常に長いブロックなので、開始行と終了行を特定して削除する
lines = content.split('\n')
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "if (els.btnTriggerPassive) {" in line and "els.btnTriggerPassive.addEventListener" in lines[i+1]:
        start_idx = i
        break

if start_idx != -1:
    # 閉じカッコを探す
    brace_count = 0
    for i in range(start_idx, len(lines)):
        if "{" in lines[i]:
            brace_count += lines[i].count("{")
        if "}" in lines[i]:
            brace_count -= lines[i].count("}")
            
        if brace_count == 0 and i > start_idx:
            end_idx = i
            break

if start_idx != -1 and end_idx != -1:
    del lines[start_idx:end_idx+1]
    
with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print("Removed old listener block.")
