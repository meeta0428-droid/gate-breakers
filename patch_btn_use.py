import re

with open('app_v6.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of btnUseCard listener
old_code = """    els.btnUseCard.addEventListener('click', () => {
        if (selectedCardIndex !== null) {"""

new_code = """    els.btnUseCard.addEventListener('click', () => {
        try {
        if (selectedCardIndex !== null) {"""

content = content.replace(old_code, new_code)

# Find the end of btnUseCard listener
old_code_end = """            els.modal.classList.add('hidden');
            updateUI();
        }
    });"""

new_code_end = """            els.modal.classList.add('hidden');
            updateUI();
        }
        } catch (e) {
            alert("btnUseCard Error: " + e.message + "\\n" + e.stack);
            console.error(e);
        }
    });"""

content = content.replace(old_code_end, new_code_end)

with open('app_v6.js', 'w', encoding='utf-8') as f:
    f.write(content)
