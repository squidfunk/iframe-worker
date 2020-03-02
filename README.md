# iframe-worker

A tiny WebWorker polyfill for the `file://` protocol

_Think [pseudo-worker][1] but using an `iframe` instead of `XMLHTTPRequest`.
This polyfill should be mostly spec-compliant and even supports `importScripts`.
It should pretty much be a drop-in replacement, at least for modern browsers._

## Installation

``` sh
npm install iframe-worker
```

## Usage

You can either use `iframe-worker` programmatically:

``` js
import { IFrameWorker } from "iframe-worker"
```

... or use the polyfill which automatically mounts on `file://` locations:

``` js
import "iframe-worker/polyfill"
```

... or use [unpkg.com](https://unpkg.com) __(recommended)__:

``` html
<script src="https://unpkg.com/iframe-worker/polyfill"></script>
```

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
