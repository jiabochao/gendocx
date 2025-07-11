# gendocx

业务无关性。

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

Build for local development:

```bash
bun build --compile --minify --sourcemap ./index.ts --outfile gendocx
```

To build for Linux x64:

```bash
bun build --compile --minify --sourcemap --target=bun-linux-x64 ./index.ts --outfile gendocx
```

To build for Linux ARM64:

```bash
bun build --compile --minify --sourcemap --target=bun-linux-arm64 ./index.ts --outfile gendocx
```

To build for Windows x64:

```bash
bun build --compile --minify --sourcemap --target=bun-windows-x64 ./index.ts --outfile gendocx
```

To build for macOS arm64:

```bash
bun build --compile --minify --sourcemap --target=bun-darwin-arm64 ./index.ts --outfile gendocx
```

This project was created using `bun init` in bun v1.1.10. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


./phantomjs batch_rasterize.js /Users/bochao/Work/projects/gendocx/temp png