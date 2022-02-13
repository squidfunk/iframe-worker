/*
 * Copyright (c) 2020-2022 Martin Donath <martin.donath@squidfunk.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Send a message from the worker to the parent window
 *
 * @param message - Message
 * @param origin - Target origin
 */
export function postMessage(message: any, origin: string) {
  parent.postMessage(message, origin || "*")
}

/**
 * Import one or more scripts into the worker's scope
 *
 * Note that due to JavaScript's event-driven nature `importScripts` cannot be
 * synchronous. For this reason, we diverge from the official spec here and
 * return a `Promise`, which is fulfilled when the scripts have loaded. The
 * caller can `await` the `Promise` to ensure that the scripts have loaded.
 *
 * @param urls - Script URLs to import
 *
 * @returns Promise returning with no result
 */
export function importScripts(...urls: string[]): Promise<void> {
  return urls.reduce((promise, url) => (
    promise.then(() => new Promise(resolve => {
      const script = document.createElement("script")
      script.src = url
      script.addEventListener("load", () => resolve())
      document.body.appendChild(script)
    }))
  ), Promise.resolve())
}
