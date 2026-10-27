#!/usr/bin/env bash
# Rebase the composer-waveform patch onto the bb release that is installed,
# rebuild the plugin, reload it, and push the branch to the fork.
#
#   fork/rebuild.sh            rebase onto desktop-v$(bb --version)
#   fork/rebuild.sh 0.48.0     rebase onto desktop-v0.48.0
#   NO_PUSH=1 fork/rebuild.sh  skip the push
set -euo pipefail

cd "$(dirname "$0")/.."

branch=composer-waveform
plugin_id=composer-waveform
version=${1:-$(bb --version)}
target=desktop-v$version

if [[ $(git branch --show-current) != "$branch" ]]; then
  echo "error: check out $branch first" >&2
  exit 1
fi
if [[ -n $(git status --porcelain --untracked-files=no) ]]; then
  echo "error: working tree has uncommitted changes" >&2
  exit 1
fi

git fetch --quiet upstream "refs/tags/$target:refs/tags/$target"
base=$(git describe --tags --match 'desktop-v*' --abbrev=0 HEAD)

if [[ $base == "$target" ]]; then
  echo "already based on $target"
else
  echo "rebasing $branch from $base onto $target"
  if ! git rebase --onto "$target" "$base" "$branch"; then
    git rebase --abort
    echo "error: rebase onto $target conflicted; resolve it by hand:" >&2
    echo "  git rebase --onto $target $base $branch" >&2
    exit 1
  fi
fi

pnpm_version=$(node -p 'require("./package.json").packageManager.split("@")[1]')
npx -y "pnpm@$pnpm_version" install --frozen-lockfile --ignore-scripts \
  --filter "bb-plugin-$plugin_id..."
bb plugin build plugins/composer
bb plugin reload "$plugin_id"

if [[ -z ${NO_PUSH:-} ]]; then
  git push --force-with-lease origin "$branch"
fi
echo "composer-waveform rebuilt on $target"
