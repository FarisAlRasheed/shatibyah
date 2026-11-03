#!/usr/bin/env python3
"""Print the built text for the keys of one stacked image (for comparing with the image).
Usage: python3 tools/extract/list_stack.py <build.json> <keysfile> <imageNumber> [perImage=10]"""
import json, sys
b = json.load(open(sys.argv[1])); keys = open(sys.argv[2]).read().split(); i = int(sys.argv[3]); per = int(sys.argv[4]) if len(sys.argv) > 4 else 10
for k in keys[(i - 1) * per:i * per]:
    r = b[k]
    hint = ','.join(sorted(set(f.split(':')[0] for f in r['hard']))[:3] + r['real'][:3])
    print(f"{k}\t{r['text']}\t[{hint}]")
