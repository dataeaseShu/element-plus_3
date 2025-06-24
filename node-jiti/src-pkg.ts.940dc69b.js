"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.getWorkspacePackages = exports.getWorkspaceNames = exports.getPackageManifest = exports.getPackageDependencies = exports.excludeFiles = void 0;var _findWorkspacePackages = _interopRequireDefault(require("@pnpm/find-workspace-packages"));
var _paths = require("./paths");function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}



const getWorkspacePackages = () => (0, _findWorkspacePackages.default)(_paths.projRoot);exports.getWorkspacePackages = getWorkspacePackages;
const getWorkspaceNames = async (dir = _paths.projRoot) => {
  const pkgs = await (0, _findWorkspacePackages.default)(_paths.projRoot);
  return pkgs.
  filter((pkg) => pkg.dir.startsWith(dir)).
  map((pkg) => pkg.manifest.name).
  filter((name) => !!name);
};exports.getWorkspaceNames = getWorkspaceNames;

const getPackageManifest = (pkgPath) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(pkgPath);
};exports.getPackageManifest = getPackageManifest;

const getPackageDependencies = (
pkgPath) =>
{
  const manifest = getPackageManifest(pkgPath);
  const { dependencies = {}, peerDependencies = {} } = manifest;

  return {
    dependencies: Object.keys(dependencies),
    peerDependencies: Object.keys(peerDependencies)
  };
};exports.getPackageDependencies = getPackageDependencies;

const excludeFiles = (files) => {
  const excludes = ['node_modules', 'test', 'mock', 'gulpfile', 'dist'];
  return files.filter((path) => {
    const position = path.startsWith(_paths.projRoot) ? _paths.projRoot.length : 0;
    return !excludes.some((exclude) => path.includes(exclude, position));
  });
};exports.excludeFiles = excludeFiles; /* v7-0cb452cae2c312c7 */