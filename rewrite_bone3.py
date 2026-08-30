import re
import json

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for card in cards:
    if card['name'] == '骸鎧の暴君':
        card['effect'] = "召喚・攻5 / 防3<br>**【特殊効果】**防御を選択した時、さらに防＋5。この効果はコスト4以上のカードが出た場合無効。<br>巨大な獣の骸の隙間から青白い炎を吹きだす悪魔。"

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=4)

print("cards.json updated.")
