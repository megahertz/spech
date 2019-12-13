'use strict';

const fs = require('fs');
const glob = require('glob');
const path = require('path');

class FileFinder {
  /**
   * @param {string} rootDir
   * @param {string[]} includeMask
   * @param {string[]} excludeMask
   */
  constructor(rootDir, includeMask, excludeMask = []) {
    this.rootDir = rootDir;

    const masks = this.normalizeMasks(includeMask, excludeMask);

    this.includeMask = masks.include;
    this.excludeMask = masks.exclude;

    this.defaultIncludeMask = '**/*';
  }

  find() {
    return this.includeMask
      .reduce((res, mask) => {
        return res.concat(
          this.findFilesByMask(this.rootDir, mask)
        );
      }, []);
  }

  /**
   * @param {string} rootDir
   * @param {string} mask
   * @private
   */
  findFilesByMask(rootDir, mask = this.defaultIncludeMask) {
    return glob
      .sync(mask, {
        cwd: rootDir,
        ignore: this.excludeMask,
      })
      .map(file => path.resolve(rootDir, file))
      .reduce((result, file) => {
        try {
          if (fs.statSync(file).isDirectory()) {
            return result.concat(this.findFilesByMask(file));
          }

          return result.concat([file]);
        } catch (e) {
          return result;
        }
      }, []);
  }

  /**
   * @param {string[]} includeMask
   * @param {string[]} excludeMask
   * @return {{ include: string[], exclude: string[] }}
   * @private
   */
  normalizeMasks(includeMask, excludeMask) {
    return includeMask.reduce((res, mask) => {
      if (mask.substr(0, 1) === '!') {
        res.exclude.push(mask.substr(1));
      } else {
        res.include.push(mask);
      }

      return res;
    }, { include: [], exclude: excludeMask });
  }
}

module.exports = FileFinder;
