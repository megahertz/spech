# speck

Check your text for grammar and spelling error using multiple providers.

- Zero config
- Multiple libraries/services support

## Usage

`npx speck`

By default, it finds `**/*.md` files and checks it using en-US language.

Use `-l` flag to specify another language:

`npx speck -l ru`

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
free 10k requests/day or 10m chars/day.

## Configuring

You can store configuration in two places:
 - speck.config.js
 - "speck" section of the package.json

speck.config.js

```js
module.exports = {
  languages: ['en-us'],
  providers: [
    { name: 'hunspell' },
    { name: 'grammarBot', apiKey: 'YOUR_API_KEY' },
  ],
};
```

### Dictionaries
You can place words/phrases which is marked as error to you dictionary file.
Just create a file with .dic extension to the project root:

mydictionary.dic
```
# Simple word
browserify
# Regexp
/Component.tsx?/
```

More detailed description will be ready soon.
