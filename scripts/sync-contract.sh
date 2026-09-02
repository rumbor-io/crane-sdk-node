#!/bin/bash
# Vendors an updated copy of the Rumbor Crane Engine OpenAPI contract into
# this repo. This repo is public; rumbor-io/rumbor-crane-engine (the
# contract's canonical source) is private, so this script cannot fetch it
# directly - a maintainer with access to rumbor-crane-engine runs this
# manually, passing the path to a local checkout of that repo.
#
# Usage:
#   ./scripts/sync-contract.sh /path/to/local/rumbor-crane-engine/checkout
#
# After running, review the diff to `openapi/crane-engine.yaml`, run
# `npm run generate` to regenerate `src/generated/schema.d.ts`, run the
# test suite, and commit both the contract update and the regenerated
# types together as one reviewed change before cutting the next SDK
# release that depends on it.
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /path/to/local/rumbor-crane-engine/checkout" >&2
  exit 1
fi

SOURCE_REPO="$1"
SOURCE_CONTRACT="$SOURCE_REPO/openapi/crane-engine.yaml"

if [ ! -f "$SOURCE_CONTRACT" ]; then
  echo "error: $SOURCE_CONTRACT not found - is this a checkout of rumbor-io/rumbor-crane-engine?" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
DEST_CONTRACT="$REPO_ROOT/openapi/crane-engine.yaml"

cp "$SOURCE_CONTRACT" "$DEST_CONTRACT"
echo "Vendored contract updated: $DEST_CONTRACT"
echo "Next steps: npm run generate && npm test, then review and commit the diff."
