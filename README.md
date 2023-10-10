[![Github Action][action-image]][action-link]
[![Codecov][codecov-image]][codecov-link]
[![npm][npm-image]][npm-link]

  [action-image]: https://github.com/squidfunk/iframe-worker/workflows/ci/badge.svg?branch=master
  [action-link]: https://github.com/squidfunk/iframe-worker/actions
  [codecov-image]: https://img.shields.io/codecov/c/github/squidfunk/iframe-worker/master.svg
  [codecov-link]: https://codecov.io/gh/squidfunk/iframe-worker
  [npm-image]: https://img.shields.io/npm/v/iframe-worker.svg
  [npm-link]: https://npmjs.com/package/iframe-worker

# iframe-worker

A tiny [WebWorker] shim for `file://` in `690b` – no dependencies.

---

Similar to [pseudo-worker], but using an `iframe` instead of
[`XMLHTTPRequest`][XMLHTTPRequest]. This shim should be mostly
spec-compliant and supports [`importScripts`][importScripts].

## Installation

``` sh
npm install iframe-worker
```

## Usage

You can use the shim from [unpkg.com](https://unpkg.com) __(recommended)__:

``` html
<script src="https://unpkg.com/iframe-worker/shim"></script>
```

... or install and bundle the shim with your application:

``` js
import "iframe-worker/shim"
```

The shim will only mount if the document is served locally via `file://`. You
can also use `IFrameWorker` programmatically to customize the integration:

``` js
import { IFrameWorker } from "iframe-worker"
```

## Caveats

In a WebWorker script, [`importScripts`][importScripts] is a synchronous
operation, as it will block the thread until the script was fully loaded and 
evaluated. This is not supported in an `iframe`. For this reason, the shim for
[`importScripts`][importScripts] included with this library will return a 
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
