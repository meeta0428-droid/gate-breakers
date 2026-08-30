import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'r', encoding='utf-8') as f:
    content = f.read()

old_effect = """"name": "『威嚇の咆哮』",
        "category": "NPC・精神・アクション",
        "cost": 1,
        "strength": 1,
        "effect": "任意の手札を1枚選び、コストがこのカードの強度以下の場合は捨札に移動する。""""

new_effect = """"name": "『威嚇の咆哮』",
        "category": "NPC・精神・アクション",
        "cost": 1,
        "strength": 1,
        "effect": "任意の手札を1枚選び、コストが３以下の場合は捨札に移動する。""""

content = content.replace(old_effect, new_effect)

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
