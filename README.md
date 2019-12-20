# spech

[![Build Status](https://travis-ci.org/megahertz/spech.svg?branch=master)](https://travis-ci.org/megahertz/spech)
[![NPM version](https://badge.fury.io/js/spech.svg)](https://badge.fury.io/js/spech)

Check your text for grammar and spelling mistakes using multiple providers

 - Zero config
 - Multiple libraries/services support

## Usage

### Files checking

`npx spech`

By default, it finds `**/*.md` files and checks it using en-US language.

Use `-l` flag to specify another language:

`spech -l ru`

To specify file mask directly, pass it as an argument:

`spech README.md 'docs/*.md'`

### String checking

You can check a string value using STDIN or --input argument

`cat README.md | spech`

`spech --input 'Check the text'`

## Providers

### Hunspell

Hunspell is the most popular open-source spell checker which supports a great
variety of languages.

[Read more](docs/providers/hunspell.md).

### GrammarBot

Free grammar checking API. With an API key, you can receive 250 requests/day
(~7500/mo) at no cost. Without an API key, requests are limited to 100 per
day per IP address (~3000/mo). The API supports only English (en-US and en-GB).

[Read more](docs/providers/grammarBot.md).

### Yandex Speller

Free and very fast spell checker API for en, ru and uk languages. It provides
free 10k requests/day or 10m characters/day.

[Read more](docs/providers/yandex.md).

## [Configuring](docs/config.md)

You can store configuration in two places:

 - spech.config.js
 - "spech" section of the package.json

spech.config.js

```js
module.exports = {
  languages: ['en-us'],
  providers: [
    { name: 'hunspell' },
    { name: 'grammarBot', apiKey: 'YOUR_API_KEY' },
  ],
};
```

[More details](docs/config.md).

### Dictionaries
You can place words/phrases which are marked as a mistake into your dictionary
file. Just create a file with .dic extension in your project root:

mydictionary.dic
```
# Simple word
browserify
# Regexp
/Component.tsx?/
```

[More details](docs/config.md#dictionaries-string--string).

## API Usage

The most useful parts of the library are available through facade class
[SpellChecker](src/SpellChecker.js).

Here is a simple example how it can be used:

```js
const { Config, SpellChecker } = require('spech');

async function getMistakes() {
  const config = new Config({ ignoreCase: false });
  const checker = new SpellChecker(config);

  await checker.addDocumentsByMask(process.cwd(), 'docs/*.md');
  checker.addDictionaryPhrase('exceptionphrase');
  checker.addProviderByConfig({ name: 'hunspell' });

  const noMistakes = await checker.checkDocuments();
  if (noMistakes) {
    return [];
  }
  
  const corrections = checker.documents.map(doc => doc.corrections).flat();
  return corrections.map(correction => correction.fragment);
}
```
