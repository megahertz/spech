'use strict';

const { EventEmitter } = require('events');
const querystring = require('querystring');
const HttpTask = require('./HttpTask');

/**
 * Allow to execute multiple http requests using:
 * - concurrent connections
 * - queue
 * - retries on failure
 */
class HttpClient extends EventEmitter {
  /**
   *
   * @param {(url: string) => Response} requestFunction
   * @param {object} [options]
   * @param {number} [options.connectionLimit]
   * @param {number} [options.timeout]
   * @param {number} [options.retryCount]
   */
  constructor(requestFunction, options = {}) {
    super();

    this.requestFunction = requestFunction;

    this.options = options;

    this.connectionLimit = options.connectionLimit || 10;
    this.timeout = options.timeout || 10000;
    this.retryCount = options.retryCount || 5;

    this.queue = [];
    this.activeTasks = [];

    this.cache = {};

    this.finishedCount = 0;
  }

  /**
   * @param {string} url
   * @return {Promise<object>}
   */
  getJson(url) {
    return this.addTask(url, () => {
      return this.requestFunction(url, this.options).asJson();
    });
  }

  /**
   * @param {string} url
   * @return {Promise<Buffer>}
   */
  getBuffer(url) {
    return this.addTask(url, () => {
      return this.requestFunction(url, this.options).asBuffer();
    });
  }

  postJson(url, data) {
    const body = JSON.stringify(data);

    const options = {
      body: JSON.stringify(data),
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      method: 'post',
      ...this.options,
    };

    return this.addTask(url, () => {
      return this.requestFunction(url, options).asJson();
    });
  }

  postUrlEncoded(url, data) {
    const body = querystring.stringify(data);
    const options = {
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      },
      method: 'post',
      ...this.options,
    };

    return this.addTask(url, () => {
      return this.requestFunction(url, options).asJson();
    });
  }

  /**
   *
   * @param {string} url
   * @param {(response: Response) => Promise<T>} transformer
   * @return {Promise<T>}
   * @template T
   */
  getUsingTransformer(url, transformer) {
    return this.addTask(url, () => {
      return transformer(this.requestFunction(url, { timeout: this.timeout }));
    });
  }

  /**
   * @param {string} url
   * @param {()=> any} fetchFunction
   * @return {Promise<any>}
   * @private
   */
  addTask(url, fetchFunction) {
    const promise = new Promise((resolve, reject) => {
      this.queue.push(new HttpTask(
        fetchFunction,
        url,
        resolve,
        reject
      ));

      this.next();
    });

    this.emitQueue();

    return promise;
  }

  /**
   * @private
   */
  emitQueue() {
    this.emit('progress', {
      finishedCount: this.finishedCount,
      queuedCount: this.queue.length + this.activeTasks.length,
    });
  }

  /**
   * @param {HttpTask} task
   * @private
   */
  finishTask(task) {
    this.emit('finish', task);
    this.finishedCount += 1;
    this.activeTasks = this.activeTasks.filter(t => t !== task);
    this.emitQueue();
    this.next();
  }

  /**
   * @private
   */
  next() {
    if (this.activeTasks.length >= this.connectionLimit) {
      return;
    }

    const task = this.queue.shift();
    if (!task) {
      return;
    }

    this.activeTasks.push(task);
    this.runTask(task);
  }

  /**
   * @param {HttpTask} task
   * @private
   */
  runTask(task) {
    if (task.retries >= this.retryCount) {
      task.setRejected();
      this.finishTask(task);
      return;
    }

    this.emit(task.retries > 0 ? 'retry' : 'start', task);

    task.start()
      .then((response) => {
        task.setResolved(response);
        this.finishTask(task);
      })
      .catch((e) => {
        task.addError(e);
        this.emit('error', task);
        this.runTask(task);
      });
  }
}

module.exports = HttpClient;
