#!/bin/bash

# Navigate to project root (adjust if needed)
cd ~/Documents/OBL-handbook || exit

# Initialise Git repo
git init

# Set up remote (replace with your actual GitHub repo URL)
git remote add origin https://github.com/flobobot/OBL-handbook.git

# Stage everything
git add .

# First commit
git commit -m "Initial commit: Monorepo structure with backup & patch engine"

# Set branch to main
git branch -M main

# Push to GitHub
git push -u origin main

echo "✅ Git repo initialized and pushed to GitHub. Replace the remote URL with your actual repo URL if needed."
