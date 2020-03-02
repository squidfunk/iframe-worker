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

import {
  Config as KarmaConfig,
  ConfigOptions as KarmaConfigOptions,
  CustomLauncher
} from "karma"
import * as path from "path"
import { generate } from "project-name-generator"
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin"
import {
  Configuration as WebpackConfig,
  RuleSetRule as WebpackRuleSetRule
} from "webpack"

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Webpack configuration
 *
 * @param config - Configuration
 *
 * @return Webpack configuration
 */
export function webpack(
  config: KarmaConfig & KarmaConfigOptions
): Partial<WebpackConfig> {
  delete process.env.TS_NODE_PROJECT
  return {
    mode: "development",

    /* Loaders */
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /\/node_modules\//
        },
        ...(config.singleRun
          ? [
              ({
                test: /\.ts$/,
                use: "istanbul-instrumenter-loader?+esModules",
                include: path.resolve(__dirname, "../../src"),
                exclude: path.resolve(__dirname, "../../src/worker/runtime"),
                enforce: "post"
              }) as WebpackRuleSetRule
            ]
          : []
        )
      ]
    },

    /* Module resolver */
    resolve: {
      extensions: [".ts", ".js", ".json"],
      plugins: [
        new TsconfigPathsPlugin()
      ],
      alias: {
        _: path.resolve(__dirname, "..")
      }
    },

    /* Source maps */
    devtool: "source-map"
  }
}

/**
 * SauceLabs configuration
 *
 * @see http://bit.ly/2pl96u1 - SauceLabs platform configurator
 *
 * @param config - Configuration
 * @param browsers - Browser configuration
 *
 * @return SauceLabs configuration
 */
export function saucelabs(
  config: KarmaConfig & KarmaConfigOptions,
  browsers: Record<string, CustomLauncher>
): Partial<KarmaConfigOptions> {
  return {

    /* Define browsers to run tests on */
    browsers: Object.keys(browsers),
    customLaunchers: browsers,

    /* Configure SauceLabs integration */
    concurrency: 5,
    sauceLabs: {
      build: process.env.GITHUB_RUN_ID,
      testName: process.env.CI
        ? `${process.env.GITHUB_RUN_ID}`
        : `~ #${generate().dashed}`,
      recordVideo: false,
      recordScreenshots: false
    },

    /* Set reporters */
    reporters: config.singleRun
      ? ["summary", "coverage-istanbul", "saucelabs"]
      : ["spec", "clear-screen"],
    specReporter: {
      suppressErrorSummary: true,
      suppressPassed: !config.singleRun
    },
    coverageIstanbulReporter: {
      reports: ["lcovonly"]
    }
  }
}
