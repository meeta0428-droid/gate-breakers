import re

effect = "受けるダメージを3点軽減する。6点までのダメージを受ける場合、ダメージを無効化する。イニシアチブ-3。手札上限-1。◆ジョブカード"
match_minus = re.search(r'手札上限\s*[\-ー\-－]\s*([0-9０-９]+)', effect)
print("Match:", match_minus.groups() if match_minus else None)
