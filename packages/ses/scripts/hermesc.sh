#!/bin/bash

OS="$(uname -s)"

case "$OS" in
    Linux*)
        OS_DIR="linux64-bin"
        ;;
    Darwin*)
        OS_DIR="osx-bin"
        ;;
    CYGWIN*|MINGW*|MSYS*)
        OS_DIR="win64-bin"
        ;;
    *)
        echo "Unsupported OS: $OS"
        exit 1
        ;;
esac

# Path relative to 'packages/ses'
HERMESC="../../node_modules/hermes-engine-cli/$OS_DIR/hermesc"

$HERMESC -emit-binary -out test/hermes-smoke.hbc test/hermes-smoke.js
