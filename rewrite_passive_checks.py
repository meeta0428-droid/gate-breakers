import re

with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# p.name === 'xxx' または p.effect.includes('xxx') などの some/filter に !p.isDisabled を追加
replacements = [
    (r"player\.deck\.passives\.some\(p => p\.name === '忍者'\)", r"player.deck.passives.some(p => p.name === '忍者' && !p.isDisabled)"),
    (r"player\.deck\.passives\.some\(p => p\.name === 'サイオマンサー'\)", r"player.deck.passives.some(p => p.name === 'サイオマンサー' && !p.isDisabled)"),
    (r"player\.deck\.passives\.filter\(c => c\.name === '獣操棍'\)", r"player.deck.passives.filter(c => c.name === '獣操棍' && !c.isDisabled)"),
    (r"player\.deck\.passives\.some\(p => p\.name === 'ガトリングガン'\)", r"player.deck.passives.some(p => p.name === 'ガトリングガン' && !p.isDisabled)"),
    (r"player\.deck\.passives\.some\(p => p\.name === 'ハルバード'\)", r"player.deck.passives.some(p => p.name === 'ハルバード' && !p.isDisabled)"),
    (r"player\.deck\.passives\.some\(p => p\.effect\.includes\('能力値にダメージを受けていても、回収ポイントが下がらない'\)\)", r"player.deck.passives.some(p => p.effect.includes('能力値にダメージを受けていても、回収ポイントが下がらない') && !p.isDisabled)"),
    (r"player\.deck\.passives\.some\(p => p\.name === '武術家' \|\| p\.effect\.includes\('回収タイミングで肉体カテゴリーのコスト3以下'\)\)", r"player.deck.passives.some(p => (p.name === '武術家' || p.effect.includes('回収タイミングで肉体カテゴリーのコスト3以下')) && !p.isDisabled)"),
    (r"player\.deck\.passives\.some\(p => p\.name === '戦術解析士'\)", r"player.deck.passives.some(p => p.name === '戦術解析士' && !p.isDisabled)"),
    (r"player\.deck\.passives\.some\(p => p\.name === 'サイコメトリー'\)", r"player.deck.passives.some(p => p.name === 'サイコメトリー' && !p.isDisabled)"),
    (r"player\.deck\.passives\.some\(p => p\.name === '魔弾銃士'\)", r"player.deck.passives.some(p => p.name === '魔弾銃士' && !p.isDisabled)"),
    (r"player\.deck\.passives\.some\(p => p\.name === '闘禅一致'\)", r"player.deck.passives.some(p => p.name === '闘禅一致' && !p.isDisabled)"),
    (r"player\.deck\.passives\.reduce\(\(sum, p\) => sum \+ \(p\.strength \|\| 0\), 0\)", r"player.deck.passives.reduce((sum, p) => sum + (p.isDisabled ? 0 : (p.strength || 0)), 0)")
]

for old, new in replacements:
    content = re.sub(old, new, content)

# 3. 発動可能なパッシブ判定（ボタン非表示化）
old_trigger_chk = """            // 発動可能なパッシブ効果の判定
            if (els.btnTriggerPassive) {"""
new_trigger_chk = """            // 発動可能なパッシブ効果の判定
            if (els.btnTriggerPassive) {
                if (isPassive && card.isDisabled) {
                    els.btnTriggerPassive.classList.add('hidden');
                    return;
                }"""
content = content.replace(old_trigger_chk, new_trigger_chk)


with open('/Users/kawaitaichi/ゲートブレイカーズ！/web/app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete (3/3).")
