/*
 * Copyright (c) 2020 Martin Donath <martin.donath@squidfunk.com>
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

import { IFrameWorker } from "worker"

import { chance } from "_/helpers"

/* ----------------------------------------------------------------------------
 * Tests
 * ------------------------------------------------------------------------- */

/* Functions related to the worker */
describe("worker", () => {

  /* IFrameWorker */
  describe("IFrameWorker", () => {

    /* Test: should initialize worker */
    it("should initialize worker", () => {
      const worker = new IFrameWorker("base/workers/message.js")
      expect(worker.iframe.parentNode)
        .toBe(document.body)
    })

    /* Test: should terminate worker */
    it("should terminate worker", () => {
      const worker = new IFrameWorker("base/workers/message.js")
      worker.terminate()
      expect(worker.iframe.parentNode)
        .toBeNull()
      worker.postMessage("aaa")
    })

    /* Test: should delegate event handling */
    it("should delegate event handling", () => {
      const worker = new IFrameWorker(chance.url())
      for (const method of [
        "addEventListener",          /* Add an event listener */
        "removeEventListener",       /* Remove an event listener */
        "dispatchEvent"              /* Dispatch an event */
      ] as const) {
        expect(worker[method])
          .toEqual(jasmine.any(Function))
      }
    })

    /* Test: should handle worker messages with listener */
    it("should handle worker messages with listener", done => {
      const worker = new IFrameWorker("base/workers/message.js")
      worker.postMessage("ping")
      worker.addEventListener("message", message => {
        expect(message.data).toEqual("pong")
        done()
      })
    })

    /* Test: should handle worker messages with handler */
    it("should handle worker messages with handler", done => {
      const worker = new IFrameWorker("base/workers/message.js")
      worker.postMessage("ping")
      worker.onmessage = message => {
        expect(message.data).toEqual("pong")
        done()
      }
    })

    /* Test: should handle worker errors with listener */
    it("should handle worker errors with listener", done => {
      const worker = new IFrameWorker("base/workers/error.js")
      worker.postMessage(chance.string())
      worker.addEventListener("error", ({ error }) => {
        expect(error.message).toEqual("Error in worker")
        done()
      })
    })

    /* Test: should handle worker errors with handler */
    it("should handle worker errors with handler", done => {
      const worker = new IFrameWorker("base/workers/error.js")
      worker.postMessage(chance.string())
      worker.onerror = ({ error }) => {
        expect(error.message).toEqual("Error in worker")
        done()
      }
    })

    /* Test: should handle worker imports */
    it("should handle worker imports", done => {
      const worker = new IFrameWorker("base/workers/scripts.js")
      worker.postMessage(chance.string())
      worker.addEventListener("message", message => {
        expect(message.data).toEqual("foobar")
        done()
      })
    })

    /* Test: should throw on worker options */
    it("should throw on worker options", () => {
      expect(() => {
        new IFrameWorker(chance.url(), {})
      })
        .toThrowError("Options are not supported for iframe workers")
    })
  })
})
