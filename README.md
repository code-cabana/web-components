# CC &middot; Web Components &middot; [![npm version](https://img.shields.io/npm/v/@codecabana/web-components?color=bright-green)](https://www.npmjs.com/package/@codecabana/web-components) [![unpkg](https://img.shields.io/badge/unpkg-browse-blue)](https://unpkg.com/browse/@codecabana/web-components@latest/) [![Github license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/code-cabana/web-components/blob/master/LICENSE)

Web components designed to infiltrate no-code platforms via script tags

- :fire: 0 dependencies
- :package: Small (< 20kB per component)
- :wheelchair: Accessible

## Usage

### `<script>` tag

For usage via `<script>` tags in no/low-code platforms like Wordpress, Squarespace, Wix, Webflow etc, refer to [codecabana.com.au](https://www.codecabana.com.au)

### ES Module

```bash
npm install @codecabana/web-components
```

## Publishing

Any push to master branch will trigger the publish process via [Github Actions](https://docs.github.com/en/actions)

Version is incremented [semantically](https://semver.org/) using the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) specification

## Tech

- Atomico (functional web component framework)
- Babel (transpiler)
- Rollup (bundler)
- NextJS (demo)

## ToDo

- Add `npm install` support in addition to unpkg script tag reference
- Fix accordion issue when used with react and switching between presets - tries to remove child elements but they have been imperatively modified by the accordion
