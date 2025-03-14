#!/usr/bin/env python3

"""
This script:

- enters the frontend directory
- reads the frontend/lib/localization.ts file as it were a JSON file
- scans all the tsx files for the following pattern:
    _('some string')
- extracts the strings
- put the new strings in the localization.ts file
- save the new localization.ts file
"""

import glob
import html
import os
import re
import sys
import json

# check if we are in the main directory
if not os.path.exists('frontend'):
    print('Please run this script from the main directory')
    sys.exit(1)

# The directory where the frontend is located
FRONTEND_DIR = os.path.join(os.getcwd(), 'frontend')

# ENCODING='cp1252'
ENCODING='utf-8'

# Read the localization.ts file
fin = open ( os.path.join ( "frontend", "src", "lib", "localization.ts" ), "r", encoding=ENCODING )
# removes the 'const translations = ' part
translations = fin.read().replace('const translations = ', '')
# removes the 'export default translations;' part
translations = translations.replace('export default translations;', '')
# removes the extra ';' at the end of the file
pos = translations.rfind(';')
translations = translations[:pos]
# converts the string to a dictionary
translations = eval(translations)


# ====================
# Scan the tsx files
# ====================

# The base directory where to start a recursive search
# Skipps the node_modules directory

BASE_DIR = os.path.join(FRONTEND_DIR)

# The pattern to search for
PATTERN = re.compile(r"_\(\s*([\"'])([^\"']+)\1\s*\)")

changes = 0

def mk_key ( phrase ):
    phrase = phrase.lower().replace(' ', '_')
    # remove all tags <...> and &...; from the string
    phrase = re.sub('<[^<]+?>', '', phrase)
    phrase = html.unescape(phrase)
    phrase = re.sub('[^A-Za-z0-9_]+', '', phrase)
    return phrase

def scan_file ( filename ):
    global changes

    if ( filename.find ( 'node_modules' ) != -1 ):
        return

    print ( "=== ", filename )

    # Open the file
    data = open(filename, "r").read()
    # Find all the matches
    matches = PATTERN.findall(data)
    # Loop through the matches
    for match in matches:
        phrase = match[1]
        # make phrase a key in the dictionary by: making it lowercase, replacing spaces with underscores and removing not A-Z, a-z, 0-9 and _ characters
        phrase = mk_key ( phrase )

        # Check if the match is already in the dictionary
        if phrase not in translations:
            changes += 1
            # Add the match to the dictionary
            translations[phrase] = {}
            print('Added: ', phrase)

for filename in glob.iglob(BASE_DIR + '/**/*.svelte', recursive=True):
    scan_file(filename)

for filename in glob.iglob(BASE_DIR + '/**/*.ts', recursive=True):
    scan_file(filename)

# Save the new localization.ts file
if changes > 0:
    print('Total changes: ', changes)
    fout = open ( os.path.join ( "frontend", "src", "lib", "localization.ts" ), "w", encoding=ENCODING )
    fout.write('const translations = ' + json.dumps(translations, indent=4) + ';\n')
    fout.write('export default translations;\n')
    fout.close()
else:
    print('No changes to localization.ts')
