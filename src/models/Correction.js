'use strict';

class Correction {
  constructor({
    position,
    length,
    message,
    suggestions,
    fragment,
    provider,
    rule,
    startLine = { number: -1, position: -1 },
    endLine = { number: -1, position: -1 },
  }) {
    this.position = position;
    this.length = length;
    this.message = message;
    this.suggestions = suggestions;
    this.fragment = fragment;
    this.provider = provider;
    this.rule = rule;

    this.startLine = startLine;
    this.endLine = endLine;
  }

  get id() {
    return `${this.position}-${this.length}`;
  }
}

module.exports = Correction;
