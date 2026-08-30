import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """"name": "アイアン・タイガー",
        "category": "NPC・召喚",
        "cost": 4,
        "strength": 2,
        "effect": "召喚・攻5 / 3<br>**【特殊効果】**自身への攻撃を代わりに受け止める（カバーリング）ことができ、受けるダメージを常に2点軽減する。<br>鋼鉄の牙とフリップサイドの超合金繊維の剛毛を持つ大虎。""""

new_logic = """"name": "アイアン・タイガー",
        "category": "NPC・召喚",
        "cost": 4,
        "strength": 2,
        "effect": "召喚・攻5 / 3<br>**【特殊効果】**受けるダメージを2点軽減する。<br>鋼鉄の牙とフリップサイドの超合金繊維の剛毛を持つ大虎。""""

content = content.replace(old_logic, new_logic)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
