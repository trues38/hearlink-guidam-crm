import os
import re

files = [
    'frontend/app/page.tsx',
    'frontend/app/customers/page.tsx',
    'frontend/app/conformity/page.tsx'
]

def process_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Restore specific text gradients
    content = content.replace(
        'from-white via-indigo-200 to-slate-400 mb-2 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]',
        'from-slate-800 via-indigo-600 to-slate-600 dark:from-white dark:via-indigo-200 dark:to-slate-400 mb-2 dark:drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]'
    )
    content = content.replace(
        'from-blue-400 to-cyan-200',
        'from-blue-800 to-cyan-600 dark:from-blue-400 dark:to-cyan-200'
    )

    # 2. General Glassmorphism container backgrounds for Light Mode
    # bg-white/5 dark:bg-white/[0.03] -> bg-white/60 dark:bg-white/[0.03]
    content = content.replace('bg-white/5 dark:bg-white/[0.03]', 'bg-white/60 dark:bg-white/[0.03]')
    content = content.replace('bg-white/[0.03]', 'bg-white/60 dark:bg-white/[0.03]')
    
    # Normal bg-white/5 (that don't have dark: already) -> bg-white/60 dark:bg-white/5
    content = re.sub(r'(?<!dark:)bg-white/5\b', r'bg-white/60 dark:bg-white/5', content)

    # 3. Borders
    # border-white/10 -> border-white/60 dark:border-white/10
    content = re.sub(r'(?<!dark:)border-white/10\b', r'border-white/60 dark:border-white/10', content)
    content = re.sub(r'(?<!dark:)border-white/20\b', r'border-white/80 dark:border-white/20', content)

    # 4. Text Contrast
    content = re.sub(r'(?<!dark:)text-white\b', r'text-slate-800 dark:text-white', content)
    content = re.sub(r'(?<!dark:)text-slate-300\b', r'text-slate-600 dark:text-slate-300', content)

    # 5. Fix hover states
    content = re.sub(r'(?<!dark:)hover:bg-white/10\b', r'hover:bg-white dark:hover:bg-white/10', content)
    content = re.sub(r'(?<!dark:)hover:bg-white/5\b', r'hover:bg-white dark:hover:bg-white/5', content)
    content = re.sub(r'(?<!dark:)hover:text-white\b', r'hover:text-slate-900 dark:hover:text-white', content)

    with open(filepath, 'w') as f:
        f.write(content)

for f in files:
    process_file(f)
print("Light mode glassmorphism patches executed")
