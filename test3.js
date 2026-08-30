let baseSize = 3;
const matchMinus = "手札上限-1".match(/手札上限\s*[\-ー\-－]\s*([0-9０-９]+)/);
baseSize -= parseInt(matchMinus[1].replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)));
print(baseSize);
