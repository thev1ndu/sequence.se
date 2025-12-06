# Setup Instructions for New Private Repository

## Step 1: Create the Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `blog`
3. Owner: Select `sq3` (or create the organization if needed)
4. Description: "Blog built with Next.js and MDX"
5. **Visibility: Private** ✓
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 2: Update Remote and Push

After creating the repository, run these commands:

```bash
# Remove old remote
git remote remove origin

# Add new remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/sq3/blog.git

# Push to new repository
git push -u origin blog-feature

# If you want to rename the branch to main
git branch -M main
git push -u origin main
```

## Alternative: Using SSH

If you prefer SSH:

```bash
git remote add origin git@github.com:sq3/blog.git
```

