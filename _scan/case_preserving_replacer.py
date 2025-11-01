#!/usr/bin/env python3
"""
Case-preserving global text replacements with detailed tracking.
Replaces 'neuvisia' -> 'nerbixa' and 'zinvero' -> 'nerbixa' while preserving original case.
"""

import re
import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Any

def detect_case_style(text: str) -> str:
    """Detect the case style of the original text."""
    if text.islower():
        return "lowercase"
    elif text.isupper():
        return "uppercase"
    elif text.istitle():
        return "title"
    elif text[0].isupper() and text[1:].islower():
        return "capitalize"
    else:
        return "mixed"

def apply_case_style(text: str, style: str) -> str:
    """Apply the detected case style to the replacement text."""
    if style == "lowercase":
        return text.lower()
    elif style == "uppercase":
        return text.upper()
    elif style == "title":
        return text.title()
    elif style == "capitalize":
        return text.capitalize()
    else:
        return text  # Keep original for mixed case

def is_binary_file(file_path: Path) -> bool:
    """Check if a file is binary by reading a small chunk."""
    try:
        with open(file_path, 'rb') as f:
            chunk = f.read(8192)
            return b'\x00' in chunk
    except:
        return True

def process_file(file_path: Path, replacements: Dict[str, str]) -> List[Dict[str, Any]]:
    """Process a single file and return list of changes made."""
    changes = []
    
    if is_binary_file(file_path):
        return changes
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}")
        return changes
    
    original_content = content
    
    # Process each replacement mapping
    for old_token, new_token in replacements.items():
        # Create case-insensitive regex pattern
        pattern = re.compile(re.escape(old_token), re.IGNORECASE)
        
        def replace_match(match):
            original_text = match.group(0)
            case_style = detect_case_style(original_text)
            replacement = apply_case_style(new_token, case_style)
            
            # Track this change
            changes.append({
                "file": str(file_path),
                "line": content[:match.start()].count('\n') + 1,
                "column": match.start() - content.rfind('\n', 0, match.start()),
                "old_text": original_text,
                "new_text": replacement,
                "case_style": case_style,
                "token_mapping": f"{old_token} -> {new_token}"
            })
            
            return replacement
        
        content = pattern.sub(replace_match, content)
    
    # Write back if changed
    if content != original_content:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception as e:
            print(f"Error: Could not write {file_path}: {e}")
    
    return changes

def main():
    # Define replacement mappings
    replacements = {
        "neuvisia": "nerbixa",
        "zinvero": "nerbixa"
    }
    
    # Read target files list
    target_files_path = Path("_scan/target_files.txt")
    if not target_files_path.exists():
        print("Error: target_files.txt not found")
        sys.exit(1)
    
    with open(target_files_path, 'r') as f:
        file_paths = [Path(line.strip()) for line in f if line.strip()]
    
    all_changes = []
    files_modified = 0
    
    print(f"Processing {len(file_paths)} files...")
    
    for file_path in file_paths:
        if not file_path.exists():
            continue
            
        changes = process_file(file_path, replacements)
        if changes:
            all_changes.extend(changes)
            files_modified += 1
            print(f"Modified: {file_path} ({len(changes)} changes)")
    
    # Generate report
    report = {
        "timestamp": str(Path().resolve()),
        "replacements": replacements,
        "summary": {
            "files_processed": len(file_paths),
            "files_modified": files_modified,
            "total_changes": len(all_changes)
        },
        "changes": all_changes
    }
    
    # Save detailed JSON report
    with open("_scan/replacement_report.json", 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n=== REPLACEMENT SUMMARY ===")
    print(f"Files processed: {len(file_paths)}")
    print(f"Files modified: {files_modified}")
    print(f"Total changes: {len(all_changes)}")
    print(f"Report saved: _scan/replacement_report.json")
    
    # Print change summary by token
    token_counts = {}
    for change in all_changes:
        mapping = change["token_mapping"]
        token_counts[mapping] = token_counts.get(mapping, 0) + 1
    
    print(f"\nChanges by token:")
    for mapping, count in token_counts.items():
        print(f"  {mapping}: {count} replacements")

if __name__ == "__main__":
    main()
