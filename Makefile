# Copyright (c) 2020 Martin Donath <martin.donath@squidfunk.com>

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to
# deal in the Software without restriction, including without limitation the
# rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
# sell copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
# IN THE SOFTWARE.

# -----------------------------------------------------------------------------

all: clean lint build test

# -----------------------------------------------------------------------------
# Targets
# -----------------------------------------------------------------------------

# Distribution files: CommonJS
dist/cjs: src
	npx tsc -i --outDir $@ -m commonjs

# Distribution files: ESM
dist/esm: src
	npx tsc -i --outDir $@ -m es2015

# Distribution files: polyfill
polyfill: src
	npx webpack --mode production

# -----------------------------------------------------------------------------
# Rules
# -----------------------------------------------------------------------------

# Build distribution files
build: dist/cjs dist/esm polyfill

# Clean distribution files
clean:
	rm -rf coverage dist polyfill

# Lint source files
lint:
	npx tslint -p tsconfig.json "src/**/*.ts"
	npx tslint -p tests/tsconfig.json "tests/**/*.ts"

# Execute tests
test:
	@ TS_NODE_PROJECT=tests/tsconfig.json TS_NODE_FILES=1 SUITE=${SUITE} \
		npx karma start tests/karma.conf.ts --single-run

# Execute tests in watch mode
watch:
	@ TS_NODE_PROJECT=tests/tsconfig.json TS_NODE_FILES=1 SUITE=${SUITE} \
		npx karma start tests/karma.conf.ts

# -----------------------------------------------------------------------------

# Special targets
.PHONY: .FORCE build clean lint test watch
.FORCE:
