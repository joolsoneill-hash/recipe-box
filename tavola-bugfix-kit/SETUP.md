# Setting up "report a bug, Claude fixes it"

Do this once, ideally on a computer (about 20 minutes). Nothing here changes how the app works until the last step.

## 1. Put the source files in the repo (GitHub, repo `recipe-box`)
Add these files to the root of the repo (Add file > Upload files, or Create new file and paste):
- `index.template.html`, `build.py`, `version.txt`, `CHANGELOG.txt`, `CLAUDE.md`
- `index.html` (replace the existing one)
Add these in folders (use Create new file and type the path in the name box):
- `logo/mark.svg`
- `tools/check.js`
- `.github/workflows/claude-fix.yml`

## 2. Allow the automation (repo Settings)
- Actions > General > Workflow permissions: choose **Read and write permissions** and tick **Allow GitHub Actions to create and approve pull requests**.
- Secrets and variables > Actions > New repository secret: name `ANTHROPIC_API_KEY`, value = an API key from console.anthropic.com (this is pay-as-you-go and separate from your Claude plan; set a monthly limit there).
- Pages: make sure it publishes from the branch you already use (main, root).

## 3. Make a GitHub token for the relay
GitHub > Settings > Developer settings > Fine-grained tokens > Generate:
- Repository access: only `recipe-box`. Permission: **Issues: Read and write** (nothing else).
Copy the token.

## 4. Create the relay (free Cloudflare account)
- Cloudflare dashboard > Workers & Pages > Create > Worker. Paste in `relay/worker.js`. Deploy.
- Worker > Settings > Variables and Secrets, add:
  - `ALLOWED_ORIGIN` = `https://joolsoneill-hash.github.io`
  - `ALLOWED_EMAILS` = your Gmail and your wife's Gmail, comma separated
  - `FIREBASE_API_KEY` = `AIzaSyAAVlcygCcJXlK0LkfIh3oiEMc6sZhEVFo`
  - `GITHUB_REPO` = `joolsoneill-hash/recipe-box`
  - `GITHUB_TOKEN` = the token from step 3 (type: Secret)
- Copy the worker's address (like `https://tavola-relay.yourname.workers.dev`).

## 5. Switch it on
Send me the worker address. I put it in the app, and the Report button then also sends to GitHub.

## How it behaves
- **Report a bug**: the fix is made and pushed to the live site automatically. The issue is closed with the new version number. Reload the app to get it.
- **Request a feature**: Claude builds it on a branch and opens a pull request. Nothing goes live until you tap Merge.
- Only your two Google accounts can send reports, and the workflow only acts on issues opened by your own GitHub account.
- If Claude can't make a safe fix, the issue stays open with a note saying so.
- Every change is a normal commit, so any fix can be undone from GitHub (open the commit > Revert).
