'use strict';

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    factory(exports);
  } else {
    factory(root);
  }
})(this, function (exports) {
  function MTurk(namespace) {
    this._namespace = (typeof namespace === 'string' ? namespace : '');
    this.assignmentId = null;
    this.hitId = null;
    this.submitTarget = null;
    this.workerId = null;
    this.isDebug = false;
    this._local = {};

    this._load();
  }

  MTurk.prototype._load = function () {
    var urlParams = new URLSearchParams(window.location.search);
    this.assignmentId = urlParams.get('assignmentId');
    this.hitId = urlParams.get('hitId');
    this.submitTarget = urlParams.get('turkSubmitTo');
    this.workerId = urlParams.get('workerId');
    this.isDebug = urlParams.get('debug') === 'debug';
    this.config = urlParams.get('config');
    this.group = urlParams.get('group', '');

    this._namespace += urlParams.get('namespace', '');

    try {
      var item = localStorage.getItem(this._namespace + ':local');
      if (item === null || item.length === 0) {
        throw new Error('No record exists');
      }
      this._local = JSON.parse(item);
    } catch (e) {
      console.log('[Warn] Using blank local store!')
      this._local = {};
    }
  }

  MTurk.prototype.loadConfig = function (prefix) {
    return fetch(prefix + this.config).then(function (resp) {
      return resp.json();
    });
  }

  MTurk.prototype.getSubmitUrl = function () {
    if (this.submitTarget === null) {
      return '/mturk/externalSubmit';
    } else {
      return this.submitTarget + '/mturk/externalSubmit';
    }
  }

  MTurk.prototype.getState = function () {
    if (this.assignmentId === null || typeof this.assignmentId !== 'string') {
      return 'unloaded';
    } else if (this.assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE') {
      return 'preview';
    } else {
      return 'ready';
    }
  }

  MTurk.prototype.persistenceAvailable = function () {
    try {
      localStorage.setItem(this._namespace + ':test', 'test');
      localStorage.removeItem(this._namespace + ':test');
      return true;
    } catch (e) {
      return false;
    }
  }

  MTurk.prototype.saveLocal = function (key, value) {
    this._local[key] = value;
    try {
      localStorage.setItem(this._namespace + ':local',
        JSON.stringify(this._local));
    } catch (e) { }
  }

  MTurk.prototype.getLocal = function (key, defaultValue, forceRefresh) {
    if (forceRefresh && this.persistenceAvailable()) {
      try {
        this._local = JSON.parse(
          localStorage.getItem(this._namespace + ':local'));
      } catch (e) {}
    }
    return (key in this._local) ? this._local[key] : defaultValue;
  }

  MTurk.prototype.resetLocal = function () {
    this._local = {};
    try {
      localStorage.setItem(
        this._namespace + ':local', JSON.stringify(this._local));
    } catch (e) { }
  }

  exports.MTurk = MTurk;
});
