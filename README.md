# spech

[![Build Status](https://travis-ci.org/megahertz/spech.svg?branch=master)](https://travis-ci.org/megahertz/spech)
[![NPM version](https://badge.fury.io/js/spech.svg)](https://badge.fury.io/js/spech)

Check your text for grammar and spelling error using multiple providers.

 - Zero config
 - Multiple libraries/services support

## Usage

`npx spech`

By default, it finds `**/*.md` files and checks it using en-US language.

Use `-l` flag to specify another language:

`npx spech -l ru`

## Providers

### Hunspell

Hunspell is the most popular open-source spell checker which supports a great
variety of languages. The checker uses WebAssembly binding for hunspell
[hunspell-asm](https://github.com/kwonoj/hunspell-asm).

### GrammarBot

Free grammar checking API. With an API key, you can receive 250 requests/day
(~7500/mo) at no cost. Without an API key, requests are limited to 100 per
day per IP address (~3000/mo). The API supports only English (en-US and en-GB).

If you need more that 100 request per day,
[register](https://www.grammarbot.io/signup) a new key and pass it to
GrammarBot config: 

```
{
  name: 'grammarBot',
  apiKey: 'YOUKEY,
}
```

### Yandex Speller

Free and very fast spell checker API for en, ru and uk languages. It provides
free 10k requests/day or 10m characters/day.

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
You can place words/phrases which is marked as error to your dictionary file.
Just create a file with .dic extension to the project root:

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
