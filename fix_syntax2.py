with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "function handleSummonVoided" in line:
        # Search forward for function updateUI()
        for j in range(i, i+30):
            if "function updateUI()" in lines[j]:
                # We want to remove everything between the end of handleSummonVoided and updateUI()
                # handleSummonVoided ends at the '}' before updateUI
                # Let's just find "    }\n}\n"
                
                # We know the garbage is:
                #                 updateUI();
                #             }, 50);
                #         }
                #     }
                # }
                # Let's literally delete from i+19 to j-1
                print("Found updateUI at", j)
                if j - i > 25: # It's roughly 25 lines
                    del lines[i+19:j]
                break
        break

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
