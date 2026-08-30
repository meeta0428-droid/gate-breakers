import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_attr = """                    <select id="filter-attr" style="padding:3px; border-radius:3px; background:#333; color:#fff; border:1px solid #555;">
                        <option value="all">全属性</option>
                        <option value="肉体">肉体のみ</option>
                        <option value="知性">知性のみ</option>
                        <option value="精神">精神のみ</option>
                        <option value="全て">全てのみ</option>
                    </select>"""

new_attr = """                    <select id="filter-attr" style="padding:3px; border-radius:3px; background:#333; color:#fff; border:1px solid #555;">
                        <option value="all">全属性</option>
                        <option value="肉体">肉体のみ</option>
                        <option value="知性">知性のみ</option>
                        <option value="精神">精神のみ</option>
                        <option value="全て">全てのみ</option>
                        <option value="NPC">NPCのみ</option>
                    </select>"""

content = content.replace(old_attr, new_attr)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
