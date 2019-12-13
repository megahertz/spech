'use strict';

const httpReq = require('http');
const httpsReq = require('https');
const querystring = require('querystring');
const { URL } = require('url');
const { PassThrough } = require('stream');

module.exports = {
  request
};

/**
 * Fetch URI
 * @param {string} url
 * @param {module:http.RequestOptions} [options={}]
 * @return {Response}
 */
function request(url, options) {
  logRequest(url, options);
  const response = new Response(createHttpStream(url, options));
  logResponse(url, options, response);

  return response;
}

class Response {
  constructor(stream) {
    /** @type {module:stream.internal.Readable} */
    this.stream = stream;

    const chunks = [];
    this.resultPromise = new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    })
  }

  /**
   * @return {Promise<Buffer>}
   */
  async asBuffer() {
    return this.resultPromise;
  }

  /**
   * @return {Promise<string>}
   */
  async asString() {
    const buffer = await this.asBuffer();
    return buffer.toString('utf8');
  }

  /**
   * @return {Promise<object>}
   */
  async asJson() {
    const content = await this.asString();
    return JSON.parse(content);
  }

  /**
   * @param {module:stream.internal.Writable} stream
   * @return {module:stream.internal.Writable}
   */
  pipe(stream) {
    return this.stream.pipe(stream);
  }

  /**
   * Implements thenable object
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   * @return {Promise<string>}
   */
  then(onFulfilled, onRejected = undefined) {
    return this.asString().then(onFulfilled, onRejected);
  }
}

/**
 * Create readable stream for remote url
 * @param {string} uri
 * @param {module:http.RequestOptions} [options={}]
 * @return {module:stream.internal.Readable}
 */
function createHttpStream(uri, options = {}) {
  const stream = new PassThrough();
  const http = uri.startsWith('https') ? httpsReq : httpReq;
  let responseInstance;

  options.method = options.method || 'get';

  const request = http.request(makeRequestOptions(uri, options), (res) => {
    const { statusCode } = res;
    responseInstance = res;

    if (res.headers.location) {
      createHttpStream(new URL(res.headers.location, uri).href)
        .pipe(stream);
      return;
    }

    if (statusCode !== 200) {
      error(new Error(`GET ${uri} returns status code ${statusCode}`));
      return;
    }

    res.pipe(stream);
  });

  request
    .on('error', error)
    .on('timeout', () => {
      error(new Error(`Timeout error when requesting ${uri}`));
    });

  if (options.body) {
    request.write(options.body);
  }

  request.end();

  return stream;

  function error(e) {
    stream.emit('error', e);
    request.abort();
    responseInstance && responseInstance.resume();
  }
}

function logRequest(uri, options, showBody = true) {
  const { body = '', debugFn, headers = {} } = options || {};
  const { 'Content-Type': contentType } = headers;

  if (!debugFn) {
    return;
  }

  debugFn(options.method.toUpperCase(), uri);

  if (showBody && body) {
    let formattedBody;
    if (contentType === 'application/json') {
      formattedBody = JSON.parse(body);
    } else if (contentType === 'application/x-www-form-urlencoded') {
      formattedBody = querystring.parse(body);
    } else {

    }

    debugFn('Request body:', formattedBody);
  }
}

function logResponse(uri, options, response) {
  const { debugFn } = options || {};
  if (!debugFn) {
    return;
  }

  response.asJson().then((json) => {
    logRequest(uri, options, false);
    debugFn('Response body:', json);
  });
}

/**
 * Merge URL and request options for Node < 10.9.0
 * @param {string} urlString
 * @param {module:http.RequestOptions} options
 * @return {{path: string, protocol: string, hostname: string, port: (number)}}
 */
function makeRequestOptions(urlString, options) {
  const url = new URL(urlString);
  return {
    ...options,
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port === '' ? Number(url.port) : undefined,
    path: `${url.pathname || ''}${url.search || ''}`,
  }
}
