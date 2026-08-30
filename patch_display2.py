with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# First revert the previous patch
content = content.replace(
"""            if (c.name === 'クロス・ファイア') {
                const cfDmg = player.deck.summons.length * 2;
                detail = `（召喚連携によりダメージ＋${cfDmg}）` + detail;
            } else if (c.name === 'ロックオンアサルト' && player.deck.summons.length > 0) {
                detail = `（基本ダメージ＋4に変更）` + detail;
            } else if (match) {
                detail = `（基本ダメージ＋${match[1]}）` + detail;
            }""",
    "if (match) detail = `（基本ダメージ＋${match[1]}）` + detail;"
)

# Apply comprehensive patch
insert_code = """
            if (c.name === 'クロス・ファイア') {
                const cfDmg = player.deck.summons.length * 2;
                detail = `（召喚連携によりダメージ＋${cfDmg}）` + detail;
            } else if (c.name === 'ロックオンアサルト' && player.deck.summons.length > 0) {
                detail = `（召喚ボーナス適用：ダメージ＋4）` + detail;
            } else if (c.name === '獣の戦意' && player.deck.summons.length > 0) {
                detail = `（召喚ボーナス適用：ダメージ＋4）` + detail;
            } else if (c.name === 'フルスロットルチャージ' && player.initiative > 10) {
                detail = `（イニシアチブボーナス適用：ダメージ＋5）` + detail;
            } else if (c.name === '神速領域') {
                detail = `（イニシアチブ加算によりダメージ＋${player.initiative}）` + detail;
            } else if (match) {
                detail = `（基本ダメージ＋${match[1]}）` + detail;
            }
"""

content = content.replace(
    "if (match) detail = `（基本ダメージ＋${match[1]}）` + detail;",
    insert_code.lstrip('\n')
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
