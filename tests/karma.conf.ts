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

import {
  Config as KarmaConfig,
  ConfigOptions as KarmaConfigOptions
} from "karma"

import { saucelabs, webpack } from "./config"
import * as browsers from "./config/browsers/unit.json"

/* ----------------------------------------------------------------------------
 * Configuration
 * ------------------------------------------------------------------------- */

export default (config: KarmaConfig & KarmaConfigOptions) => {
  config.set({
    basePath: __dirname,

    /* Frameworks to be used */
    frameworks: ["webpack", "jasmine"],

    /* Include tests */
    files: [
      { pattern: "workers/**/*.js", included: false },
      "suites/**/*.ts"
    ],

    /* Preprocessors */
    preprocessors: {
      "**/*.ts": ["webpack", "sourcemap"]
    },

    /* Webpack configuration */
    webpack: webpack(config),
    webpackMiddleware: {
      stats: {
        colors: true,
        excludeAssets: /.*/
      }
    },

    /* Reporters */
    reporters: config.singleRun
      ? ["spec", "coverage-istanbul"]
      : ["spec", "clear-screen"],

    /* Browsers */
    browsers: ["Chrome"],

    /* Configuration for test reporter */
    specReporter: {
      suppressErrorSummary: true,
      suppressSkipped: !config.singleRun
    },

    /* Configuration for coverage reporter */
    coverageIstanbulReporter: {
      reports: ["html", "text"]
    },

    /* Hack: Don't serve TypeScript files with "video/mp2t" mime type */
    mime: {
      "text/x-typescript": ["ts"]
    },

    /* Client configuration */
    client: {
      jasmine: {
        random: false
      }
    },

    /* Configuration overrides */
    ...(process.env.GITHUB_ACTIONS || process.env.SAUCE
      ? saucelabs(config, browsers)
      : {}
    )
  })
}
