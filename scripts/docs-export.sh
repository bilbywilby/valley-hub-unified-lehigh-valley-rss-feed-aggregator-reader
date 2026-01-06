#!/bin/bash
# Valley Hub Documentation Export Utility
# Usage: ./scripts/docs-export.sh [version_tag]
TAG=${1:-"latest"}
DOCS_DIR="docs"
OUTPUT_FILE="valley-hub-docs-$TAG.zip"
if [ ! -d "$DOCS_DIR" ]; then
  echo "Error: $DOCS_DIR directory not found."
  exit 1
fi
echo "Packaging documentation version: $TAG..."
# Ensure zip is available
if ! command -v zip &> /dev/null; then
    echo "Error: zip command not found. Please install zip."
    exit 1
fi
zip -r "$OUTPUT_FILE" "$DOCS_DIR"
echo "Documentation packaged successfully: $OUTPUT_FILE"
echo "Ready for GitHub Release upload."