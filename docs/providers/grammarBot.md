# GrammarBot provider

Free grammar checking API. With an API key, you can receive 250 requests/day
(~7500/mo) at no cost. Without an API key, requests are limited to 100 per
day per IP address (~3000/mo). The API supports only English (en-US and en-GB).

If you need more that 100 request per day,
[register](https://www.grammarbot.io/signup) a new key and pass it to

 - Free API
 - Both grammar and spelling checking
 - Allow to disable some checking rules
 
 - Requires internet connection
 - API calls limit (100/day or 250/day with API key)
 - Only en-US and en-GB are supported
 - No multilingual document support

[GrammarBot homepage](https://www.grammarbot.io)

## Languages

'en-us', 'en-gb'

## Options

#### `apiKey` {string}

Default: `undefined`

With `apiKey` set you are able to perform up to 250 request/day instead of 100.

#### `disabledRules` {string[]}

Default: `undefined`

Disable some mistakes by specifying rule name. To view rules in checking output
run spech with `--show-rule` flag.
