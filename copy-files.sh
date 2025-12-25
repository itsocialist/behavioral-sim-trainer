#!/bin/bash
# Copy all project files from Claude's workspace to local directory

SOURCE="/home/claude/workspace/behavioral-sim-trainer"
DEST="/Users/briandawson/workspace/behavioral-sim-trainer"

echo "Copying project files..."

for file in "$SOURCE"/*.md; do
    filename=$(basename "$file")
    if [ "$filename" != "README.md" ]; then  # Skip README, already copied
        echo "Copying $filename..."
        cp "$file" "$DEST/$filename"
    fi
done

echo "✅ All files copied to $DEST"
ls -lh "$DEST"
