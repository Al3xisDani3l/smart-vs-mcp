# Release Process

## Prerequisites

- GitHub repository: `Al3xisDani3l/smart-vs-mcp`
- npm package: `@al3xisdani3l/smart-vs-mcp`
- GitHub secret `NPM_TOKEN` with publish access to the npm package

## Manual Release

Use GitHub Actions -> `Release` -> `Run workflow`.

Inputs:

- `version`: `patch`, `minor`, `major`, `prerelease`, or an exact semver version.
- `dry_run`: validates without committing, tagging, publishing, or creating a GitHub Release.

The workflow:

1. runs `npm ci`
2. bumps `package.json` and `package-lock.json`
3. syncs plugin manifest versions
4. updates `CHANGELOG.md` and `RELEASE_NOTES.md`
5. runs `npm run verify`
6. commits release files
7. creates tag `vX.Y.Z`
8. publishes to npm with provenance
9. creates a GitHub Release using `RELEASE_NOTES.md`

## Local Dry Run

```powershell
npm ci
npm run sync:version
npm run changelog
npm run verify
npm pack --dry-run
```
