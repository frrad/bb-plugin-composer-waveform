#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
node fork/vendor-ui.mjs
npm --prefix plugins/composer install --ignore-scripts
bb plugin build plugins/composer
echo 'Built plugins/composer; commit and merge changes, then run bb plugin update composer-waveform --yes'
