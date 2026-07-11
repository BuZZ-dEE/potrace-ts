import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    {
        ignores: ["dist/**"],
    },
    {
        files: ["src/**/*.{js,ts,vue}"],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
            parser: tsParser,
            globals: {
                ArrayBuffer: "readonly",
                ImageData: "readonly",
                Uint8Array: "readonly",
                Uint16Array: "readonly",
                Uint32Array: "readonly",
                describe: "readonly",
                expect: "readonly",
                it: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-this-alias": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "no-empty": "off",
            "no-undef": "off",
            "no-unused-vars": "off",
        },
    },
];
