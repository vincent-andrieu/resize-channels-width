import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import banner from "rollup-plugin-banner2";

export default {
    input: "src/main.ts", // The entry point of your application
    output: {
        file: "build/resize-channels-width.plugin.js", // The output bundled file
        format: "commonjs" // The output format ('module', 'commonjs', 'iife', 'umd', 'amd', 'system')
    },
    external: [],
    plugins: [
        resolve(), // Allows Rollup to resolve modules
        commonjs(), // Converts CommonJS modules to ES6
        typescript({
            tsconfig: "tsconfig.json"
        }),
        banner(() => [
            "/**",
            " * @name ResizeChannelsWidth",
            " * @author gassastsina",
            " * @description Resize the sidebar with the mouse or double click on the right border",
            " * @version 1.0.0",
            " * @authorId 292388871381975040",
            " * @source https://github.com/vincent-andrieu/resize-channels-width",
            " * @updateUrl https://raw.githubusercontent.com/vincent-andrieu/resize-channels-width/refs/heads/main/build/resize-channels-width.plugin.js",
            " */"
        ].join("\n") + '\n')
    ]
};
