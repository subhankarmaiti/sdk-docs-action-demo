# sdk-docs-action-demo

A small TypeScript SDK that exists to demonstrate
[sdk-docs-hub](https://github.com/subhankarmaiti/sdk-docs-hub), a GitHub Action for
hosting versioned SDK documentation on GitHub Pages.

**Documentation:** https://subhankarmaiti.github.io/sdk-docs-action-demo/

The dropdown in the page toolbar switches versions. The root serves the newest
stable release; every published version stays addressable at `/vX.Y.Z/`.

## What this demonstrates

- **The newest stable is mirrored at the root**, so the documentation URL is stable
  and does not need updating in a README each release.
- **Two major lines are kept.** Releasing `2.0.0` prunes `1.x` down to its latest.
- **Prereleases are published but do not take the root.** After `3.0.0-beta.1` the
  root still serves the newest stable; the beta is reachable from the dropdown.
- **Old versions learn about new ones.** The dropdown on `v1.1.0`'s pages lists
  releases published after it, because every version reads one shared manifest at
  the site root rather than a copy baked in at build time.

## Releasing

The `.version` file is the source of truth. Bump it on a `release/*` branch and
merge; `release.yml` tags the release and then calls `publish-docs.yml`.

```bash
git checkout -b release/1.1.0
echo 1.1.0 > .version
npm version 1.1.0 --no-git-tag-version
git commit -am 'Release 1.1.0' && git push -u origin release/1.1.0
gh pr create --fill && gh pr merge --squash
```

## The docs configuration

TypeDoc emits relative links, so one build serves both the version directory and
the root mirror — `root-strategy: auto` works that out from the docs command not
mentioning `{{base_path}}`.

Note there is deliberately **no** TypeDoc versions plugin. The action owns
versioning; a plugin that also owns it produces `v1.0.0/v1.0.0/` nesting.

See [`.github/workflows/publish-docs.yml`](.github/workflows/publish-docs.yml).

## Local development

```bash
npm ci
npm run typecheck
npm run docs        # writes ./docs — serve it, do not open with file://
npx serve docs
```

## License

MIT
