"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.writeJson = exports.ensureDir = void 0;var _fs = require("fs");
var _promises = require("fs/promises");

const writeJson = (path, data, spaces = 0) =>
(0, _promises.writeFile)(path, JSON.stringify(data, undefined, spaces), 'utf-8');exports.writeJson = writeJson;

const ensureDir = async (path) => {
  if (!(0, _fs.existsSync)(path)) await (0, _promises.mkdir)(path, { recursive: true });
};exports.ensureDir = ensureDir; /* v7-f6376643c5d7029b */