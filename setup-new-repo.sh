#!/bin/bash

# Script to set up new private repository sq3/blog
# Make sure you've created the repository on GitHub first!

echo "Setting up new repository sq3/blog..."

# Check if repository exists
echo "Checking current remote..."
git remote -v

# Remove old remote
echo ""
echo "Removing old remote..."
git remote remove origin

# Add new remote
echo ""
echo "Adding new remote: https://github.com/sq3/blog.git"
git remote add origin https://github.com/sq3/blog.git

# Verify remote
echo ""
echo "New remote configuration:"
git remote -v

# Ask user if they want to push
echo ""
read -p "Do you want to push to the new repository now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Pushing to new repository..."
    git push -u origin blog-feature
    
    echo ""
    read -p "Do you want to rename the branch to 'main'? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        git branch -M main
        git push -u origin main
        git push origin --delete blog-feature
        echo "Branch renamed to 'main' and pushed successfully!"
    fi
else
    echo "You can push later with: git push -u origin blog-feature"
fi

echo ""
echo "Setup complete!"

