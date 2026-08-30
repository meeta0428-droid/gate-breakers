let called = false;
const result = "1".replace(/[０-９]/g, s => {
    called = true;
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
});
print("Called:", called);
print("Result:", result);
