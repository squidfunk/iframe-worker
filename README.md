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

A tiny [WebWorker] polyfill for the `file://` protocol in less than `900b`

> Like [pseudo-worker] but using an `iframe` instead of
> [`XMLHTTPRequest`][XMLHTTPRequest]. This polyfill should be mostly
> spec-compliant and supports [`importScripts`][importScripts]. It should
> pretty much be a drop-in replacement, at least for modern browsers which
> include a constructable `EventTarget` and `Promise`._

## Installation

``` sh
npm install iframe-worker
```

## Usage

You can use the polyfill from [unpkg.com](https://unpkg.com) __(recommended)__:

``` html
<script src="https://unpkg.com/iframe-worker/polyfill"></script>
```

... or bundle the polyfill with your application:

``` js
import "iframe-worker/polyfill"
```

... or use `IFrameWorker` programmatically:

``` js
import { IFrameWorker } from "iframe-worker"
```

The polyfill will only mount if the document is served via `file://`.

## Caveats

In a WebWorker script, [`importScripts`][importScripts] is a synchronous
operation, as it will block the thread until the script was fully loaded and 
evaluated. This is not supported in an `iframe`. For this reason, the polyfill
for [`importScripts`][importScripts] included with this library will return a 
`Promise`, chaining all passed URLs into a sequence, making it awaitable. 

Since awaiting anything else than a `Promise` will wrap the awaited thing into
a `Promise`, calls to [`importScripts`][importScripts] should practically behave
the same way for all protocols other than `file://`. Thus, if you want to make
sure that your WebWorker works for all protocols, always `await` all calls to 
[`importScripts`][importScripts].

## License

**MIT License**

Copyright (c) 2020-2022 Martin Donath

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

  [WebWorker]: https://www.w3.org/TR/workers/
  [pseudo-worker]: https://github.com/nolanlawson/pseudo-worker
  [XMLHTTPRequest]: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  [importScripts]: https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
