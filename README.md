<img src="_docs/ext-type-gen.png" alt="Ext Type-Gen">

# TS Definitions Generator for TypeScript-Defold

[![CI](https://github.com/thinknathan/tsd-ext-type-gen/actions/workflows/ci.yml/badge.svg)](https://github.com/thinknathan/tsd-ext-type-gen/actions/workflows/ci.yml) ![GitHub License](https://img.shields.io/github/license/thinknathan/tsd-ext-type-gen) <a href="https://discord.gg/eukcq5m"><img alt="Chat with us!" src="https://img.shields.io/discord/766898804896038942.svg?colorB=7581dc&logo=discord&logoColor=white"></a>

TypeScript definitions generator that parses script APIs from Defold extensions. Made for use with [TypeScript + Defold](https://ts-defold.dev/).

This tool searches through dependencies in your Defold project file, then attempts to find `script_api` files, and parse them to create TypeScript definitions.

## Installation

```bash
yarn add tsd-ext-type-gen -D
# or
npm install tsd-ext-type-gen --save-dev
```

## Usage

`npx xtgen`

- `-p` path to your `game.project` (default `./app/game.project`)
- `-o` path to an output folder (default `./@types`)

## Background

Started as a fork of @thejustinwalsh's [type-gen](https://github.com/ts-defold/type-gen), now with significant rewrites.

<p align="center" class="h4">
  TypeScript :heart: Defold
</p>
