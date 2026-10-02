import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const destination = path.resolve("docs/assets/fonts");
await mkdir(destination, { recursive: true });
for (const family of ["archivo", "martian-mono"]) {
  const base = path.resolve("node_modules/@fontsource-variable", family);
  const css = await readFile(path.join(base, "standard.css"), "utf8");
  const blocks = css.match(/\/\*[^]*?\n\}/g).filter(block => /\/\* [^\n]+-(?:latin(?:-ext)?|vietnamese)-standard-normal \*\//.test(block));
  for (const block of blocks) {
    const file = block.match(/\.\/files\/([^)]*)/)[1];
    await copyFile(path.join(base, "files", file), path.join(destination, file));
  }
  await writeFile(path.join(destination, `${family}.css`), blocks.join("\n").replaceAll("./files/", "./"));
  await copyFile(path.join(base, "LICENSE"), path.join(destination, `${family}-LICENSE.txt`));
}
console.log("Archivo and Martian Mono fonts copied locally with their licences.");
