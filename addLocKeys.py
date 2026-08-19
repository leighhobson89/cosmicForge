#!/usr/bin/env python3
"""
Add localization keys to all 5 language sections in localization.json
Usage: python addLocKeys.py key1 "en_value" "es_value" "de_value" "it_value" "fr_value" [key2 ...]
"""

import json
import sys
import re
from pathlib import Path


def add_keys_to_localization(json_path, keys_data):
    """
    Add keys to all language sections in localization.json
    
    keys_data: dict of {key: [en, es, de, it, fr]}
    """
    with open(json_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse as JSON to verify structure
    data = json.loads(content)
    
    languages = ['en', 'es', 'pt', 'de', 'it', 'fr']
    
    # Add keys to each language section
    for lang in languages:
        if lang not in data:
            print(f"Warning: Language '{lang}' not found in localization.json")
            continue
        
        for key, values in keys_data.items():
            lang_index = languages.index(lang)
            data[lang][key] = values[lang_index]
    
    # Write back with proper formatting
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully added {len(keys_data)} key(s) to all 5 languages")
    for key in keys_data:
        print(f"  - {key}")


def main():
    if len(sys.argv) < 7:
        print("Usage: python addLocKeys.py key1 \"en_value\" \"es_value\" \"de_value\" \"it_value\" \"fr_value\" [key2 ...]")
        print("\nExample:")
        print('python addLocKeys.py newButtonLabel "New Label" "Nueva Etiqueta" "Neues Etikett" "Nuova Etichetta" "Nouvelle Étiquette"')
        sys.exit(1)
    
    # Find localization.json
    script_dir = Path(__file__).parent
    json_path = script_dir / 'localization.json'
    
    if not json_path.exists():
        print(f"Error: localization.json not found at {json_path}")
        sys.exit(1)
    
    # Parse arguments
    args = sys.argv[1:]
    keys_data = {}
    
    i = 0
    while i < len(args):
        if i + 6 > len(args):
            print(f"Error: Incomplete arguments for key '{args[i]}'")
            sys.exit(1)
        
        key = args[i]
        en_val = args[i + 1]
        es_val = args[i + 2]
        de_val = args[i + 3]
        it_val = args[i + 4]
        fr_val = args[i + 5]
        
        keys_data[key] = [en_val, es_val, de_val, it_val, fr_val]
        i += 6
    
    add_keys_to_localization(json_path, keys_data)


if __name__ == '__main__':
    main()
