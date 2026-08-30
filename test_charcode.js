const result = "1".replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
print(result);
