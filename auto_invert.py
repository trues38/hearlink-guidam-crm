import os, re

# Mapping light color base string to its dark mode tail logic.
# Notice the values do NOT include 'dark:' prefix yet, we will prepend it dynamically!
MAPPINGS = {
    # Slates (bg)
    "bg-slate-50": "bg-slate-900",
    "bg-slate-100": "bg-slate-800",
    "bg-slate-200": "bg-slate-700",
    "bg-gray-50": "bg-slate-900",
    "bg-gray-100": "bg-slate-800",
    "bg-gray-200": "bg-slate-700",
    
    # Colored backgrounds
    "bg-blue-50": "bg-blue-900/30",
    "bg-blue-100": "bg-blue-900/50",
    "bg-blue-200": "bg-blue-800/50",
    "bg-indigo-50": "bg-indigo-900/30",
    "bg-indigo-100": "bg-indigo-900/50",
    "bg-indigo-200": "bg-indigo-800/50",
    "bg-emerald-50": "bg-emerald-900/30",
    "bg-emerald-100": "bg-emerald-900/50",
    "bg-green-50": "bg-emerald-900/30",
    "bg-green-100": "bg-emerald-900/50",
    "bg-amber-50": "bg-amber-900/30",
    "bg-amber-100": "bg-amber-900/50",
    
    # Texts
    "text-slate-900": "text-slate-100",
    "text-slate-800": "text-slate-200",
    "text-slate-700": "text-slate-300",
    "text-slate-600": "text-slate-400",
    "text-slate-500": "text-slate-400",
    "text-gray-900": "text-slate-100",
    "text-gray-800": "text-slate-200",
    "text-gray-700": "text-slate-300",
    "text-gray-600": "text-slate-400",
    "text-gray-500": "text-slate-400",
    
    "text-blue-900": "text-blue-200",
    "text-blue-800": "text-blue-300",
    "text-blue-700": "text-blue-400",
    "text-blue-600": "text-blue-400",
    "text-indigo-900": "text-indigo-200",
    "text-indigo-800": "text-indigo-300",
    "text-indigo-700": "text-indigo-400",
    "text-indigo-600": "text-indigo-400",
    "text-emerald-900": "text-emerald-200",
    "text-emerald-800": "text-emerald-300",
    "text-emerald-700": "text-emerald-400",
    "text-emerald-600": "text-emerald-400",
    "text-green-900": "text-emerald-200",
    "text-green-800": "text-emerald-300",
    "text-green-700": "text-emerald-400",
    "text-green-600": "text-emerald-400",
    "text-red-900": "text-red-200",
    "text-red-800": "text-red-300",
    "text-red-700": "text-red-400",
    "text-amber-900": "text-amber-200",
    "text-amber-800": "text-amber-300",
    "text-amber-700": "text-amber-400",
    
    # Borders
    "border-slate-100": "border-slate-800",
    "border-slate-200": "border-slate-700",
    "border-slate-300": "border-slate-600",
    "border-gray-100": "border-slate-800",
    "border-gray-200": "border-slate-700",
    "border-blue-100": "border-blue-900/50",
    "border-blue-200": "border-blue-800/50",
    "border-indigo-100": "border-indigo-900/50",
    "border-emerald-100": "border-emerald-900/50",
    "border-purple-100": "border-purple-900/50",
    "border-red-100": "border-red-900/50",
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Modifiers that we want to mirror
    # e.g., hover:bg-slate-50 -> hover:bg-slate-50 dark:hover:bg-slate-900
    modifiers = r'(?:hover:|focus:|active:|group-hover:|group-focus:|peer-hover/row:|group-hover/row:|group-hover/item:|peer-checked:)?'
    
    for light_class, dark_tail in MAPPINGS.items():
        # Match pattern: 
        # \b(modifier)(light_class)([\s\"\'/])(?!(?:.*?)dark:\1(?:bg|text|border)-)
        # It's a bit complex to regex negatively lookahead arbitrary text for a specific dark base in all forms.
        # So we'll use a safer approach:
        # We replace any instance of `modifier+light_class` with `modifier+light_class dark:modifier+dark_tail`
        # BUT ONLY IF `dark:modifier+` doesn't already exist right after it.
        
        # Regex captures:
        # Group 1: The prefix/modifier
        # Group 2: The light class
        # Group 3: The trailing boundary character (space, quote, slash)
        # Lookahead: (?!.*dark:\1(?:bg|text|border)) 
        
        # It's safer to just do a negative lookahead for "dark:" immediately following.
        pattern = r'\b(' + modifiers + r')(' + light_class + r')([\s\"\'/])(?!(?:.*?)dark:\1)'
        
        def repl(match):
            prefix = match.group(1)
            light = match.group(2)
            boundary = match.group(3)
            return f"{prefix}{light} dark:{prefix}{dark_tail}{boundary}"
        
        content = re.sub(pattern, repl, content)
        
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated", filepath)

for root, _, files in os.walk('frontend/app'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

