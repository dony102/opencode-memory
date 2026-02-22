# Operations and Update Strategy

## Manual update

- Windows: `update.bat auto`
- Bash: `./update.sh --auto`

Both wrappers delegate to `scripts/` implementations.

## Automated update

Workflow file:

`/.github/workflows/auto-update.yml`

Behavior:

1. Runs daily via cron.
2. Fetches upstream `thedotmack/claude-mem`.
3. Compares local and upstream heads.
4. Merges updates when available.
5. Rebuilds project and pushes result.

## Required repository settings

- Actions enabled
- Workflow permissions: read and write
- Branch protection (optional, recommended with allow-list for GitHub Actions)

## Conflict handling

If merge conflict occurs in workflow:

1. Pull latest local branch.
2. Merge upstream manually.
3. Resolve conflicts.
4. Run `npm run build`.
5. Push to origin.

## Privacy governance model

- `visibility=private`: hidden from normal reads; requires `include_private=true`.
- `visibility=internal`: visible to default reads.
- `visibility=shareable`: visible to default reads and preferred for collaboration exports.

Recommended policy:

1. Default to `internal`.
2. Use `private` for sensitive implementation notes or credentials-adjacent context.
3. Use `shareable` for architecture decisions intended for team-wide recall.
