# Contributing

This repo uses **trunk-based development**. `develop` is the trunk and the
GitHub default branch; there is no `main` and no long-lived release branches.

## Workflow

1. Branch off `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b <type>/<short-description>
   ```
   Prefix branches with `feat/`, `fix/`, `chore/`, `docs/`, etc., matching the
   commit type below.
2. Keep the branch short-lived (hours to a couple of days, not weeks). Rebase
   on `develop` instead of merging it in, to keep history linear.
3. Open a PR into `develop` as soon as the change is coherent, even in draft.
   Small, frequent PRs are the point of trunk-based development — avoid
   stacking unrelated changes.
4. PRs must:
   - Pass CI (`build` check: `npm run typecheck` + `npm test`).
   - Get at least 1 approval.
   - Have no unresolved review threads.
   These are enforced by branch protection on `develop` (no direct pushes,
   no force-push, no bypass — including for admins).
5. Merge with **squash merge only** (the only method enabled on this repo).
   The squash commit title/body defaults to the PR title/body, so write PR
   titles as a valid Conventional Commit (see below) — that becomes the
   permanent history entry.
6. The source branch is deleted automatically on merge.

## Commit / PR title convention

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`. Add
`!` after the type/scope (e.g. `feat!:`) or a `BREAKING CHANGE:` footer for
breaking changes — this repo has shipped both (`d971e19`).

## Releases

Releases are fully automated by [release-please](https://github.com/googleapis/release-please-action),
driven off Conventional Commit PR titles — there is no manual tagging step.

1. Every PR merged into `develop` is parsed for its Conventional Commit type.
   `release-please` keeps a standing "chore: release develop" PR up to date,
   accumulating a version bump (per [SemVer](https://semver.org/), derived
   from `feat`/`fix`/`!`) and a generated `CHANGELOG.md` entry.
2. When that release PR is merged (by anyone with merge rights, whenever the
   accumulated changes are ready to ship), `release-please` tags the merge
   commit (`vX.Y.Z`), creates a GitHub Release, and dispatches
   `.github/workflows/release.yml` to publish to npm via trusted publishing
   (OIDC). A version containing a hyphen is published under the `next`
   dist-tag instead of `latest`.
3. `release.yml` is idempotent — re-running it for an already-published
   version is a no-op — so it can also be triggered manually
   (`workflow_dispatch`) against any existing tag if needed.
4. Configuration lives in `release-please-config.json` (release type, tag
   format, changelog sections) and `.release-please-manifest.json` (current
   version). Both are only touched by `release-please` itself; don't hand-edit
   the manifest except to correct a bootstrap mismatch.

There are no `release/*` branches and no hotfix branches: fixes land on
`develop` via PR like everything else, then ride the next release PR.

## Local checks before opening a PR

```bash
npm install
npm run typecheck
npm test
```

These are the same commands CI runs; matching them locally avoids failed
`build` checks blocking the PR.
