#!/bin/bash
# Vendors an updated copy of the Rumbor Memory OpenAPI contract into this
# repo. This repo is public; rumbor-io/rumbor-memory (the contract's
# canonical source) is private, so this script cannot fetch it directly -
# a maintainer with access to rumbor-memory runs this manually, passing
# the path to a local checkout of that repo.
#
# Usage:
#   ./scripts/sync-contract.sh /path/to/local/rumbor-memory/checkout
#
# After running, review the diff to `openapi/rumbor-memory.yaml`, run
# `npm run generate` to regenerate `src/generated/schema.d.ts`, run the
# test suite, and commit both the contract update and the regenerated
# types together as one reviewed change before cutting the next SDK
# release that depends on it.
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /path/to/local/rumbor-memory/checkout" >&2
  exit 1
fi

SOURCE_REPO="$1"
SOURCE_CONTRACT="$SOURCE_REPO/openapi/rumbor-memory.yaml"

if [ ! -f "$SOURCE_CONTRACT" ]; then
  echo "error: $SOURCE_CONTRACT not found - is this a checkout of rumbor-io/rumbor-memory?" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
DEST_CONTRACT="$REPO_ROOT/openapi/rumbor-memory.yaml"

cp "$SOURCE_CONTRACT" "$DEST_CONTRACT"
echo "Vendored contract updated: $DEST_CONTRACT"
echo "Next steps: npm run generate && npm test, then review and commit the diff."
