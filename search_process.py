
import os

target_file = r'c:\Users\Mansur Regulo\Downloads\koda\src\pages\AdminDashboard.tsx'

with open(target_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if 'process' in line:
            print(f"Found 'process' at line {i+1}: {line.strip()}")
