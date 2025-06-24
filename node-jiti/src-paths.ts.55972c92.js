"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.vpRoot = exports.utilRoot = exports.utilPackage = exports.themeRoot = exports.themePackage = exports.projRoot = exports.projPackage = exports.pkgRoot = exports.localeRoot = exports.localePackage = exports.hookRoot = exports.hookPackage = exports.epRoot = exports.epPackage = exports.epOutput = exports.docsDirName = exports.docRoot = exports.docPackage = exports.directiveRoot = exports.directivePackage = exports.compRoot = exports.compPackage = exports.buildRoot = exports.buildOutput = void 0;var _path = require("path");

const projRoot = exports.projRoot = (0, _path.resolve)(__dirname, '..', '..', '..');
const pkgRoot = exports.pkgRoot = (0, _path.resolve)(projRoot, 'packages');
const compRoot = exports.compRoot = (0, _path.resolve)(pkgRoot, 'components');
const themeRoot = exports.themeRoot = (0, _path.resolve)(pkgRoot, 'theme-chalk');
const hookRoot = exports.hookRoot = (0, _path.resolve)(pkgRoot, 'hooks');
const localeRoot = exports.localeRoot = (0, _path.resolve)(pkgRoot, 'locale');
const directiveRoot = exports.directiveRoot = (0, _path.resolve)(pkgRoot, 'directives');
const epRoot = exports.epRoot = (0, _path.resolve)(pkgRoot, 'element-plus');
const utilRoot = exports.utilRoot = (0, _path.resolve)(pkgRoot, 'utils');
const buildRoot = exports.buildRoot = (0, _path.resolve)(projRoot, 'internal', 'build');

// Docs
const docsDirName = exports.docsDirName = 'docs';
const docRoot = exports.docRoot = (0, _path.resolve)(projRoot, docsDirName);
const vpRoot = exports.vpRoot = (0, _path.resolve)(docRoot, '.vitepress');

/** `/dist` */
const buildOutput = exports.buildOutput = (0, _path.resolve)(projRoot, 'dist');
/** `/dist/element-plus` */
const epOutput = exports.epOutput = (0, _path.resolve)(buildOutput, 'element-plus');

const projPackage = exports.projPackage = (0, _path.resolve)(projRoot, 'package.json');
const compPackage = exports.compPackage = (0, _path.resolve)(compRoot, 'package.json');
const themePackage = exports.themePackage = (0, _path.resolve)(themeRoot, 'package.json');
const hookPackage = exports.hookPackage = (0, _path.resolve)(hookRoot, 'package.json');
const localePackage = exports.localePackage = (0, _path.resolve)(localeRoot, 'package.json');
const directivePackage = exports.directivePackage = (0, _path.resolve)(directiveRoot, 'package.json');
const epPackage = exports.epPackage = (0, _path.resolve)(epRoot, 'package.json');
const utilPackage = exports.utilPackage = (0, _path.resolve)(utilRoot, 'package.json');
const docPackage = exports.docPackage = (0, _path.resolve)(docRoot, 'package.json'); /* v7-63d903a4aff68e10 */