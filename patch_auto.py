with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Patch Automaton Turret
insert_turret = """
                    if (s.card.name === '泥瘴の悪鬼') {
                        extraInfo = '<br><span style="color:#ff5252; font-weight:bold;">※任意の対象全ての回収ポイントを-1する！</span>';
                    }
                    if (s.card.name === 'オートマトンタレット') {
                        extraInfo = '<br><span style="color:#ffcc00; font-weight:bold;">※このユニットの攻撃とは別に、任意の対象1体にダメージ1点を与える。</span>';
                    }
"""

content = content.replace(
"""                    if (s.card.name === '泥瘴の悪鬼') {
                        extraInfo = '<br><span style="color:#ff5252; font-weight:bold;">※任意の対象全ての回収ポイントを-1する！</span>';
                    }""",
insert_turret.strip('\n')
)


# Patch Sentry Drone
insert_drone = """
            if (s.card.name === '菌糸の獣骸') {
                summonDef += 1;
                summonLog += `・【菌糸の獣骸】常時効果 (軽減 1)<br>`;
            }
            
            if (s.card.name === 'セントリードローン') {
                summonDef += 1;
                summonLog += `・【セントリードローン】常時効果 (軽減 1)<br>`;
            }
"""

content = content.replace(
"""            if (s.card.name === '菌糸の獣骸') {
                summonDef += 1;
                summonLog += `・【菌糸の獣骸】常時効果 (軽減 1)<br>`;
            }""",
insert_drone.strip('\n')
)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
