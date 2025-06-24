"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.errorAndExit = errorAndExit;var _process = _interopRequireDefault(require("process"));
var _consola = _interopRequireDefault(require("consola"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}

function errorAndExit(err) {
  _consola.default.error(err);
  _process.default.exit(1);
} /* v7-bb67cdb2cdd58f22 */