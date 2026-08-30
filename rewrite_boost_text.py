import re
import json

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'r', encoding='utf-8') as f:
    cards = json.load(f)

for card in cards:
    if card['name'] == '『ブーステッド』':
        card['effect'] = "コスト：6 / 強度：2<br>**【メビウス専用】**任意の能力値＋2。【メビウス専用】の表記のあるカードを使用することができる。通常のコスト3以下のアクション・リアクションカードのみ使用できる。<br>メビウスインダストリの工作員。限定的ながらマナフラグメンツが使用できる。"

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=4)

print("cards.json updated.")
