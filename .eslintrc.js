module.exports = {
    root: true,
    extends: [
        "react-app",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json"
    },
    plugins: [
        "@typescript-eslint"
    ],
    rules: {
        "@typescript-eslint/array-type": "warn",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/explicit-function-return-type": [
            "warn",
            {
                "allowExpressions": true
            }
        ],
        "@typescript-eslint/explicit-member-accessibility": "warn",
        "@typescript-eslint/member-ordering": "error",
        "@typescript-eslint/method-signature-style": "error",
        "@typescript-eslint/naming-convention": [
            "warn",
            {
                "selector": "default",
                "format": ["camelCase"]
            },
            {
                "selector": "enumMember",
                "format": ["camelCase", "UPPER_CASE"]
            },
            {
                "selector": "variable",
                "modifiers": ["const"],
                "format": ["camelCase", "UPPER_CASE"]
            },
            {
                "selector": "variable",
                "types": ["string", "number", "boolean"],
                "modifiers": ["const", "exported"],
                "format": ["camelCase", "UPPER_CASE"]
            },
            {
                "selector": "variable",
                "modifiers": ["const", "exported"],
                "format": ["PascalCase"]
            },
            {
                "selector": "variable",
                "types": ["function"],
                "modifiers": ["const"],
                "format": ["camelCase", "PascalCase"]
            },
            {
                "selector": "parameter",
                "format": ["camelCase"],
                "leadingUnderscore": "allow"
            },
            {
                "selector": "classProperty",
                "format": ["PascalCase"],
                "prefix": ["m_"]
            },
            {
                "selector": "typeLike",
                "format": ["PascalCase"]
            },
            {
                "selector": "objectLiteralProperty",
                "types": ["string", "number", "boolean"],
                "format": ["camelCase", "UPPER_CASE"]
            }
        ],
        "@typescript-eslint/no-base-to-string": "error",
        "@typescript-eslint/no-confusing-void-expression": "error",
        "@typescript-eslint/no-duplicate-enum-values": "error",
        "@typescript-eslint/no-duplicate-type-constituents": "error",
        "@typescript-eslint/no-dynamic-delete": "error",
        "@typescript-eslint/no-explicit-any": [
            "error",
            {
                "ignoreRestArgs": true
            }
        ],
        "@typescript-eslint/no-extraneous-class": "error",
        "@typescript-eslint/no-invalid-void-type": "error",
        "@typescript-eslint/no-meaningless-void-operator": "error",
        "@typescript-eslint/no-misused-promises": [
            "error",
            {
                "checksVoidReturn": false
            }
        ],
        "@typescript-eslint/no-mixed-enums": "error",
        "@typescript-eslint/no-redundant-type-constituents": "error",
        "@typescript-eslint/no-require-imports": "error",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
        "@typescript-eslint/no-unnecessary-condition": "warn",
        "@typescript-eslint/no-unnecessary-qualifier": "warn",
        "@typescript-eslint/no-unnecessary-type-arguments": "warn",
        "@typescript-eslint/no-unsafe-declaration-merging": "error",
        "@typescript-eslint/no-unsafe-enum-comparison": "error",
        "@typescript-eslint/no-useless-empty-export": "error",
        "@typescript-eslint/non-nullable-type-assertion-style": "error",
        "@typescript-eslint/parameter-properties": "error",
        "@typescript-eslint/prefer-enum-initializers": "warn",
        "@typescript-eslint/prefer-for-of": "warn",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-includes": "warn",
        "@typescript-eslint/prefer-literal-enum-member": "error",
        "@typescript-eslint/prefer-nullish-coalescing": "warn",
        "@typescript-eslint/prefer-optional-chain": "warn",
        "@typescript-eslint/prefer-readonly": "warn",
        "@typescript-eslint/prefer-reduce-type-parameter": "warn",
        "@typescript-eslint/prefer-regexp-exec": "warn",
        "@typescript-eslint/prefer-string-starts-ends-with": "warn",
        "@typescript-eslint/prefer-ts-expect-error": "error",
        "@typescript-eslint/promise-function-async": "error",
        "@typescript-eslint/require-array-sort-compare": "error",
        "@typescript-eslint/sort-type-constituents": "error",
        "@typescript-eslint/strict-boolean-expressions": "error",
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "@typescript-eslint/unified-signatures": "error",
        "@typescript-eslint/unbound-method": [
            "error",
            {
                "ignoreStatic": true
            }
        ],
        "default-param-last": "off",
        "@typescript-eslint/default-param-last": "error",
        "dot-notation": "off",
        "@typescript-eslint/dot-notation": "warn",
        "init-declarations": "off",
        "@typescript-eslint/init-declarations": "error",
        "no-array-constructor": "off",
        "@typescript-eslint/no-array-constructor": "error",
        "no-dupe-class-members": "off",
        "@typescript-eslint/no-dupe-class-members": "error",
        "no-invalid-this": "off",
        "@typescript-eslint/no-invalid-this": "error",
        "no-loop-func": "off",
        "@typescript-eslint/no-loop-func": "error",
        "no-magic-numbers": "off",
        "@typescript-eslint/no-magic-numbers": [
            "warn",
            {
                "ignoreEnums": true
            }
        ],
        "no-redeclare": "off",
        "@typescript-eslint/no-redeclare": "error",
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": "error",
        "no-throw-literal": "off",
        "@typescript-eslint/no-throw-literal": "error",
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": "error",
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": "error",
        "no-useless-constructor": "off",
        "@typescript-eslint/no-useless-constructor": "error"
    }
};