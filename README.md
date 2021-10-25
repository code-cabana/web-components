# @codecabana/web-components &middot; [![npm version](https://img.shields.io/npm/v/@codecabana/web-components?color=bright-green)](https://www.npmjs.com/package/@codecabana/web-components) [![unpkg](https://img.shields.io/badge/unpkg-browse-blue)](https://unpkg.com/browse/@codecabana/web-components@latest/) ![npm license](https://img.shields.io/npm/l/@codecabana/web-components)

Web components designed to infiltrate no-code platforms via script tags

## Usage

```html
<script
  type="module"
  src="https://unpkg.com/@codecabana/web-components@<VERSION>/dist/es/<COMPONENT>.js"
></script>
<!-- OR -->
<script src="https://unpkg.com/@codecabana/web-components@<VERSION>/dist/umd/<COMPONENT>.js"></script>
<!-- OR -->
<script
  defer
  src="https://unpkg.com/@codecabana/web-components@<VERSION>/dist/iife/<COMPONENT>.js"
></script>
```

## Features

- :fire: 0 dependencies
- :package: Small (< 10kB per component)
- :wheelchair: Accessible

## Tech

- Atomico (functional web component framework)
- Babel (transpiler)
- Rollup (bundler)
- BrowserSync (dev server)

## ToDo

- Add `npm install` support in addition to unpkg script tag reference
