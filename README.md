[![Github Action][action-image]][action-link]
[![Codecov][codecov-image]][codecov-link]
[![Gitter][gitter-image]][gitter-link]
[![Bundlephobia][bundle-image]][bundle-link]
[![npm][npm-image]][npm-link]

  [action-image]: https://github.com/squidfunk/iframe-worker/workflows/ci/badge.svg?branch=master
  [action-link]: https://github.com/squidfunk/iframe-worker/actions
  [codecov-image]: https://img.shields.io/codecov/c/github/squidfunk/iframe-worker/master.svg
  [codecov-link]: https://codecov.io/gh/squidfunk/iframe-worker
  [gitter-image]: https://badges.gitter.im/squidfunk/iframe-worker.svg
  [gitter-link]: https://gitter.im/squidfunk/iframe-worker
  [bundle-image]: https://badgen.net/bundlephobia/minzip/iframe-worker
  [bundle-link]: https://bundlephobia.com/result?p=iframe-worker
  [npm-image]: https://img.shields.io/npm/v/iframe-worker.svg
  [npm-link]: https://npmjs.com/package/iframe-worker

# iframe-worker

A tiny WebWorker polyfill for the `file://` protocol

_Think [pseudo-worker][1] but using an `iframe` instead of `XMLHTTPRequest`.
This polyfill should be mostly spec-compliant and supports `importScripts`.
It should pretty much be a drop-in replacement, at least for modern browsers
which include a constructable `EventTarget` and `Promise`._

## Installation

``` sh
npm install iframe-worker
```

## Usage

You can either use the polyfill from [unpkg.com](https://unpkg.com)
__(recommended)__:

``` html
<script src="https://unpkg.com/iframe-worker/polyfill"></script>
```

... or include the polyfill in your Webpack build:

``` js
import "iframe-worker/polyfill"
```

... or use `iframe-worker` programmatically:

``` js
import { IFrameWorker } from "iframe-worker"
```

The polyfill will automatically mount if the document is served via `file://`.

## Caveats

In Worker scripts, `importScripts` is a synchronous operation which will wait
for the script to be loaded and executed. While it's not possible to implement
this behavior as part of an `iframe`, the `importScripts` function that is
provided as part of this polyfill returns a `Promise` which can be awaited on.
Since awaiting a non-Promise is a no-op, using `await` on `importScripts` will
work in polyfilled and non-polyfilled environments.

## Motivation

The main reason this polyfill exists is that some users of [Material for
MkDocs][2] need to distribute their documentation as static HTML files and
bundle it with their product. Users would browser the documentation locally,
using the `file://` protocol, which broke the search functionality of the
documentation, as search is implemented as part of a web worker. This polyfill
in combination with the [localsearch][3] plugin allows to use search on
the `file://` protocol.

## License

**MIT License**

Copyright (c) 2020 Martin Donath

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.

  [1]: https://github.com/nolanlawson/pseudo-worker
  [2]: https://github.com/squidfunk/mkdocs-material
  [3]: https://github.com/wilhelmer/mkdocs-localsearch
