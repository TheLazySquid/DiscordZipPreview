import fs from "fs";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { string } from "rollup-plugin-string";
import babel from "@rollup/plugin-babel";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));

export default {
  input: "src/main.ts",
  meta: {
    name: "ZipPreview",
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    authorId: "619261917352951815",
    website: pkg.repository.url,
    source: `${pkg.repository.url}/blob/main/src/build/ZipPreview.plugin.js`
  },
  plugins: [
    commonjs(),
    typescript({
      jsx: "react",
      compilerOptions: {
        target: "es2022"
      }
    }),
    string({
      include: ["**/*.css", "**/*.svg"]
    }),
    babel({ include: '**/*.tsx', babelHelpers: 'bundled' })
  ]
}