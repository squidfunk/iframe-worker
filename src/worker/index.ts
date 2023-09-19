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

import { importScripts, postMessage } from "./runtime"

type IFrameWorkerOptions = WorkerOptions & {
  src?: string
  credentials?: ReferrerPolicy
}

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

/**
 * A tiny and mostly spec-compliant `WebWorker` shim
 *
 * This `WebWorker` shim is implemented on top of an `IFrameElement` to allow
 * workers in contexts when `XMLHTTPRequest` is not available, or blocked by the
 * browser, e.g. when using the `file://` protocol. This shim can provide
 * asynchronous workers, if the options.src property is defined, it's origin is
 * different than that of the parent window's origin, or if
 * the Origin-Agent-Cluster header is used by the underlying HTTP server,
 * otherwise the script is executed synchronously.
 */
export class IFrameWorker extends EventTarget implements Worker {

  declare public addEventListener: Worker["addEventListener"]
  declare public removeEventListener: Worker["removeEventListener"]
  declare public dispatchEvent: Worker["dispatchEvent"]

  declare public onerror: Worker["onerror"]
  declare public onmessage: Worker["onmessage"]
  declare public onmessageerror: Worker["onmessageerror"]

  /**
   * The `iframe` we'll use to simulate a worker
   */
  public iframe: HTMLIFrameElement

  /**
   * A promise indicating whether the `iframe` was initialized
   */
  protected r: Promise<unknown>

  /**
   * Create a new worker from the given URL
   *
   * @param url - Worker script URL
   * @param options - Worker script options
   * @param options.src - IFrame src url
   */
  public constructor(protected url: string, { credentials, type, src }: IFrameWorkerOptions = {}) {
    super()

    /* Create iframe to host the worker script */
    const iframe = document.createElement("iframe")
    if (credentials) iframe.referrerPolicy = credentials
    if (src) iframe.src = src
    iframe.hidden = true
    document.body.appendChild(this.iframe = iframe)

    const module = type === "module" ? " type=module" : ""

    /* Initialize runtime and worker script */
    this.w.document.open()
    this.w.document.write(
      "<html>" +
        "<body>" +
          "<script>" +
            `postMessage=${postMessage};` +
            `importScripts=${importScripts};` +
            "addEventListener(\"error\",({error})=>{" +
              "parent.dispatchEvent(new ErrorEvent(\"error\",{" +
                `filename:"${url}",` +
                "error" +
              "}))" +
            "})" +
          "</script>" +
          `<script${module} src=${url}?${+Date.now()}></script>` +
        "</body>" +
      "</html>"
    )
    this.w.document.close()

    /* Register internal listeners and track iframe state */
    onmessage = this.m
    onerror = this.e as OnErrorEventHandler
    this.r = new Promise((resolve, reject) => {
      this.w.onload = resolve
      this.w.onerror = reject
    })
  }

  /**
   * Immediately terminate the worker
   */
  public terminate(): void {
    this.iframe.remove()
    onmessage = onerror = null
  }

  /**
   * Send a message to the worker
   *
   * @param data - Message data
   */
  public postMessage(data: unknown): void {
    void this.r
      .catch()
      .then(() => {
        this.w.dispatchEvent(
          new MessageEvent("message", { data })
        )
      })
  }

  /**
   * Helper to retrieve the content window of the `iframe`
   *
   * If the window doesn't exist, e.g. when the `iframe` has been removed by
   * terminating the worker, an error is thrown.
   *
   * @returns Window
   */
  protected get w(): Window {
    return this.iframe.contentWindow!
  }

  /**
   * Internal listener that proxies message events
   *
   * @param ev - Message event
   */
  protected m = (ev: MessageEvent): void => {
    if (ev.source === this.w) {
      // ev.stopImmediatePropagation() // doesn't seem necessary
      this.dispatchEvent(new MessageEvent("message", { data: ev.data }))
      if (this.onmessage)
        this.onmessage(ev)
    }
  }

  /**
   * Internal listener that proxies error events
   *
   * @param message - Error message
   * @param filename - Source filename
   * @param lineno - Source line number
   * @param colno - Source column number
   * @param error - Error object
   */
  protected e = (
    message?: string, filename?: string,
    lineno?: number, colno?: number,
    error?: Error
  ): void => {
    /* istanbul ignore else: will terminate jasmine */
    if (filename === `${this.url}`) {
      const ev = new ErrorEvent("error", {
        message, filename, lineno, colno, error
      })
      this.dispatchEvent(ev)
      if (this.onerror)
        this.onerror(ev)
    }
  }
}
