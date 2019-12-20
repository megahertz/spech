# Hunspell provider

Hunspell is the most popular open-source spell checker which supports a great
variety of languages. The checker uses WebAssembly binding for hunspell
[hunspell-asm](https://github.com/kwonoj/hunspell-asm).

 - Works offline
 - A lot of languages support
 - Multilingual document support
 
 - No grammar checking

[Hunspell homepage](https://hunspell.github.io/)

## Languages

'bg-bg', 'ca-es', 'cs-cz', 'da-dk', 'de-at', 'de-ch', 'de-de', 'el-gr',
'en-au', 'en-ca', 'en-gb', 'en-us', 'es-es', 'et-ee', 'fa-ir', 'fo-fo',
'fr-fr', 'he-il', 'hr-hr', 'hu-hu', 'it-it', 'ko', 'lt-lt', 'lv-lv',
'nb-no', 'nl-nl', 'pl-pl', 'pt-br', 'pt-pt', 'ro-ro', 'ru-ru', 'sk-sk',
'sl-si', 'sr-latn', 'sr', 'sv-se', 'ta-in', 'tg-tg', 'tr', 'uk-ua',
'vi'

'en-us' language is built-in. All other languages are downloaded from 
unpkg.com by demand. 

If you would like to permanently add some dictionary for your project, run:

`npm install --save-dev hunspell-dict-${LANGUAGE}`

## Options

#### `camelCaseBehavior` { 'ignore' | 'split' | 'check' }

Default: `'ignore'`

Determines how to process camel case word like `applicationConfig`

- **ignore**: Do not check such a word.
- **split**: Split into parts (application config) and check separately.
- **check**: Pass `applicationConfig` directly to Hunspell.

#### `useCache` {boolean}

Default: `!process.env.CI`

If there is no dictionary for specified language available locally the provider
downloads it. If this option is set to true, the downloaded dictionary is saved
to cache. 
