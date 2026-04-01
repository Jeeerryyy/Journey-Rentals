# 🛡️ Branch Protection & Ruleset Configuration

Follow these steps on [GitHub.com](https://github.com) to lock down your `main` branch.

---

## 1. Create the Ruleset
1. Go to your repository on GitHub.
2. Click **Settings** (top tab).
3. In the left sidebar, under **Code and automation**, click **Rules** → **Rulesets**.
4. Click **New ruleset** → **New branch ruleset**.

## 2. Recommended Settings
Apply the following values for a production-grade repository:

| Section | Setting | Recommendation |
| :--- | :--- | :--- |
| **General** | Ruleset Name | `Production Lock` |
| | Enforcement status | **Active** |
| **Target branches** | Add Target | Select **Include default branch** (`main`) |
| **Branch rules** | Restrict deletions | **Checked** (Prevents accidental deletion) |
| | Restrict force pushes | **Checked** (Prevents rewriting history) |
| | Require a pull request before merging | **Checked** |
| | Required approvals | **1** (Even if it's just you, it forces a review mindset) |
| | Dismiss stale pull request approvals | **Checked** |
| | Require status checks to pass | **Checked** |
| | — Search for: | `audit_and_build` (This is the CI check I created) |
| | Require linear history | **Checked** (Keeps git history clean) |
| | Block trust-reducing metadata | **Checked** |

---

## 3. Why are we doing this?
- **No Force Pushes:** Prevents anyone from overwriting the production history.
- **Audit Pass:** The `main` branch will *refuse* any code that contains high-severity security vulnerabilities (via `npm audit`).
- **Build Guarantee:** You can never merge code that "breaks the build."
- **PR Workflow:** Ensures every change is documented through a Pull Request rather than "cowboy coding" directly into `main`.

> [!TIP]
> After you push the `.github/` folder I created, GitHub will recognize the `audit_and_build` check. You can then select it as a **Required Status Check** in the settings above.
