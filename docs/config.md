# Configuring spech

spech tries to read configuration from these sources:

1. `spech.config.json` *(lowest priority)*

    Example:
    
    ```
    {
      "providers": [{ "name": "hunspell" }]
    }
    ```

2. `spech.config.js`

    Example:
    
    ```js
    module.exports = {
      providers: [{ name: 'hunspell' }],
    };
    ```

3. `spech` section of `package.json`

    Example:
    
    ```
    {
      ...
      "spech": {
        "providers": [{ "name": "hunspell" }]
      },
      ...
    }
    ```

4. `SPECH_${OPTION}` Environment variables Keys transformed to camelCase

    Example:
    
    ```
    $ env SPECH_SHOW_PROVIDER=1 spech
    ```
    
    it will be similar to the following config:
    
    ```
    {
      showProvider: true,
    }
    ```

5. Command line arguments *(highest priority)*

    ```
    $ spech --show-provider
    ```

You can run `spech --show-config` to view resulted configuration.

If you need to know which documents are processed, run `spech --show-documents`

## General options

#### `documents` {string | string[]}

Default: `['**/*.md', '!**/node_modules/**']`

Glob pattern for finding documents

To set the mask from CLI, pass it as arguments, for example:

`spech README.md 'docs/*.md'`

#### `dictionaries` {string | string[]}

Default: `['*.dic', '!**/node_modules/**']`

Load dictionary file using glob mask

#### `path` {string}

Default: `process.cwd()`

Working directory. All glob mask are relative to this path.

#### `providers` {object[]}

Default:
```
[
  { name: 'hunspell' },
  { name: 'grammarBot' },
]
```

Which providers to use. You can pass additional providers options in the object.

## Appearance options

#### `colors` {boolean}

Default: `process.stdout.isTTY`

Turn on colors in output

#### `log` {0-3}

Default: `0`

Output verbosity level

#### `ignoreCase` {boolean}

Default: `true`

Ignore incorrect usage checking of letter case

#### `showDuplicates` {boolean}

Default: `true` for log > 1

Sometimes several providers return the correction for the same text fragment.
If this option is false, then only first correction will be reported.

#### `showProvider` {boolean}

Default: `true` for log > 0

Show provider name in outputs

#### `showRule` {boolean}

Default: `true` for log > 1

Show rule name for correction in outputs. Currently, only grammarBot returns
corrections marked by some rule.

## Misc options

#### `detectCi` {boolean}

Default: `true`

Prevent running `spech` in parallel tasks of CI server. It can speedup CI
build.

#### `timeout` {boolean}

Default: `10000`

Timeout for HTTP client used by some providers.
