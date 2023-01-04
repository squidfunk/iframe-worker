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

/* ----------------------------------------------------------------------------
 * Class
 * ------------------------------------------------------------------------- */

/**
 * A tiny and mostly spec-compliant `WebWorker` shim
 *
 * This `WebWorker` shim is implemented on top of an `IFrameElement` to allow
 * workers in contexts when `XMLHTTPRequest` is not available, or blocked by the
 * browser, e.g. when using the `file://` protocol. This shim can't provide
 * asynchronous workers, as iframes are synchronous by nature.
 */
export class IFrameWorker implements Worker {

  public addEventListener: Worker["addEventListener"]
  public removeEventListener: Worker["removeEventListener"]
  public dispatchEvent: Worker["dispatchEvent"]

  public onerror: Worker["onerror"] = null
  public onmessage: Worker["onmessage"] = null
  public onmessageerror: Worker["onmessageerror"] = null

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
   */
  public constructor(protected url: string) {
    const target = new EventTarget()

    /* Delegate event handling to internal target */
    this.addEventListener    = target.addEventListener.bind(target)
    this.removeEventListener = target.removeEventListener.bind(target)
    this.dispatchEvent       = target.dispatchEvent.bind(target)

    /* Create iframe to host the worker script */
    const iframe = document.createElement("iframe")
    iframe.width = iframe.height = iframe.frameBorder = "0"
    
    /* Tells browsers to treat iframe as if from another origin */
    iframe.setAttribute('sandbox','allow-scripts');
    
    

    /* Initialize runtime and worker script */
    /* Encode the iframe page into a data URI */
    const dataUri = "data:text/html;base64," + 
    btoa(
      "<html>" +
        "<body>" +
      /* Attempt to change the origin of the iframe using a parent domain suffix */
          "<script>" +
          `try{
            let domain_split = document.domain.split('.');

            if(domain_split.length>1){
              document.domain = domain_split[domain_split.length-2] + '.' + domain_split[domain_split.length-1];
            }
           }catch(e){
            console.log(e);
           }` +
          "</script>" +
          "<script>" +
            `postMessage=${postMessage};` +
            `importScripts=${importScripts};` +
            "addEventListener(\"error\",ev=>{" +
              "parent.dispatchEvent(new ErrorEvent(\"error\",{" +
                `filename:"${url}",` +
                "error:ev.error" +
              "}))" +
            "})" +
          "</script>" +
          `<script src="${url}?${+Date.now()}"></script>` +
        "</body>" +
      "</html>"
    );
    
    iframe.src=dataUri;
  
    document.body.appendChild(this.iframe = iframe);
    
    /* Register internal listeners and track iframe state */
    window.onmessage = this.m
    window.onerror = this.e as OnErrorEventHandler
    this.r = new Promise((resolve, reject) => {
      this.w.onload = resolve
      this.w.onerror = reject
    })
  }

  /**
   * Immediately terminate the worker
   */
  public terminate(): void {
    document.body.removeChild(this.iframe)

    /* Unregister internal listeners */
    window.onmessage = window.onerror = null
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
      ev.stopImmediatePropagation()
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
    if (filename === this.url.toString()) {
      const ev = new ErrorEvent("error", {
        message, filename, lineno, colno, error
      })
      this.dispatchEvent(ev)
      if (this.onerror)
        this.onerror(ev)
    }
  }
}
