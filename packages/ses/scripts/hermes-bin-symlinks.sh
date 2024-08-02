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

# Path from 'packages/ses'
cd ../../node_modules/.bin

if [[ "$OS" == linux* || "$OS" == Darwin* ]]; then
    ln -s ../hermes-engine-cli/$OS_DIR/hbcdump hbcdump
    ln -s ../hermes-engine-cli/$OS_DIR/hdb hdb
    ln -s ../hermes-engine-cli/$OS_DIR/hermes hermes
    ln -s ../hermes-engine-cli/$OS_DIR/hermesc hermesc
elif [[ "$OS" == CYGWIN* || "$OS" == MINGW* || "$OS" == MSYS* ]]; then
    mklink -s ../hermes-engine-cli/$OS_DIR/hbcdump.exe hbcdump
    mklink -s ../hermes-engine-cli/$OS_DIR/hdb.exe hdb
    mklink -s ../hermes-engine-cli/$OS_DIR/hermes.exe hermes
    mklink -s ../hermes-engine-cli/$OS_DIR/hermesc.exe hermesc
fi
