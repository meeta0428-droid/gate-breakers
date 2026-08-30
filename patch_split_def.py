with open('app_v6.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
in_summon_loop = False
for line in lines:
    if 'let summonDef = 0;' in line:
        out.append(line)
        out.append('        let summonStanceDef = 0;\n')
        out.append('        let summonAuraDef = 0;\n')
        out.append('        const isMulti = els.chkMultiAttack && els.chkMultiAttack.checked;\n')
        continue
    
    if 'summonDef += defVal;' in line:
        line = line.replace('summonDef += defVal;', 'summonStanceDef += defVal; s._tempDefVal = defVal;')
        out.append(line)
        continue

    if 'summonDef += 2;' in line:
        line = line.replace('summonDef += 2;', 'summonAuraDef += 2;')
        out.append(line)
        continue

    if 'summonDef += 1;' in line:
        line = line.replace('summonDef += 1;', 'summonAuraDef += 1;')
        out.append(line)
        continue
        
    if "summonLog += passiveDefLog;" in line:
        out.append("        if (isMulti) { summonDef = summonAuraDef; } else { summonDef = summonStanceDef + summonAuraDef; }\n")
        out.append(line)
        continue
        
    out.append(line)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.writelines(out)
