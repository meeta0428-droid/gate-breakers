import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'r', encoding='utf-8') as f:
    content = f.read()

old_akuma = """    {
        "name": "『悪魔』",
        "category": "精神・アクション","""
new_akuma = """    {
        "name": "『悪魔』",
        "category": "精神・パッシブ","""

old_fushi = """    {
        "name": "『不死者』",
        "category": "精神・アクション","""
new_fushi = """    {
        "name": "『不死者』",
        "category": "精神・パッシブ","""

content = content.replace(old_akuma, new_akuma)
content = content.replace(old_fushi, new_fushi)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
