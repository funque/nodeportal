var fs = require("fs"), fsExtra = require('fs.extra'), pathModule = require("path"),
    viewParser = require("../view"),
    sep = pathModule.sep;

function isValidCallback(fn) {
    return fn && _.isFunction(fn);
}

function PathNotExistsError(message) {
    this.name = "PathNotExistsError";
    this.message = message || "Path Not Exists Error";
    // this.localizedMessageKey = "path-not-exists";
}


util.inherits(PathNotExistsError, Error);

exports.PathNotExistsError = PathNotExistsError;

exports.copyDir = function (srcDirPath, destDirPath, fn) {
    fsExtra.copyRecursive(srcDirPath, destDirPath, fn);
};

exports.copyFile = function (srcFilePath, destFilePath, fn) {
    fsExtra.copy(srcFilePath, destFilePath, fn);
};

exports.removeDir = function (dirPath, fn) {
    fsExtra.rmrf(dirPath, fn);
};

exports.removeFile = function (filePath, fn) {
    fs.unlink(filePath, fn)
};

exports.createDir = function (dirPath, fn) {
    fsExtra.mkdirp(dirPath, fn);
};

exports.rename = function (oldPath, newPath, fn) {
    return isValidCallback(fn) ? fs.rename(oldPath, newPath, fn) : fs.rename(oldPath, newPath);
};

exports.readDir = function (dirPath, fn) {
    return isValidCallback(fn) ? fs.readdir(dirPath, fn) : fs.readdirSync(dirPath);
};

var exists = exports.exists = function (path, fn) {
    //for node v8 it'll give deprecation warning
    return isValidCallback(fn) ? fs.exists(path, fn) : fs.existsSync(path);
};

var readFile = exports.readFile = function (filePath, encoding, fn) {
    if (_.isFunction(encoding)) {
        fn = encoding;
        encoding = "utf8";
    }
    var isCallback = isValidCallback(fn);
    var existsErr = new PathNotExistsError();
    if (!exports.exists(filePath)) {
        if (!isCallback) {
            throw existsErr;
        }
        else {
            fn(existsErr);
            return;
        }
    }
    return isCallback ? fs.readFile(filePath, encoding, fn) : fs.readFileSync(filePath, encoding);
};

/**
 * Async helper function to read images.
 * @param filePath{String}
 * @param fn {Function - callback}
 */
exports.readImage = function (filePath, fn) {
    readFile(filePath, "", fn);
};
/**
 * Writes the content to file specified by filePath, if no file exists then new file is created.
 * If content is empty then, empty file is created.
 * @param {String} filePath
 * @param {String} content
 * @param {String} encoding
 * @param {Function} fn
 */
exports.writeFile = function (filePath, content, encoding, fn) {
    if (_.isFunction(encoding)) {
        fn = encoding;
    }
    var isCallback = isValidCallback(fn);
    var existsErr = new PathNotExistsError();
    if (!exports.exists(filePath)) {
        if (!isCallback) {
            throw existsErr;
        }
        else {
            fn(existsErr);
            return;
        }
    }
    return isCallback ? fs.writeFile(filePath, content, encoding, fn) : fs.writeFileSync(filePath, content, encoding);
};

exports.stat = function (path, fn) {
    return isValidCallback(fn) ? fs.stat(path, fn) : fs.statSync(path);
};

/**
 * Blank file will be created if no there is no data
 * @param {String} filePath
 * @param {String} data
 * @param {Function} fn
 */
exports.createFile = function (filePath, data, fn) {
    data = data || "";
    return isValidCallback(fn) ? fs.writeFile(filePath, data, fn) : fs.writeFileSync(filePath, data);
};

/**
 * arguments will be joined as per os to return correct path
 * @return {String} Real path wrt os
 */
exports.realPath = function () {
    return Array.prototype.slice.call(arguments).join(sep);
};

/**
 * Reads and parses jade template and returns html
 * @param {Object} app
 * @param {String} filePath
 * @param {Object} options
 * @return {String} parseHtml
 */
exports.parseJadeTemplate = function (app, filePath, options) {
    return viewParser.parseView(app, filePath, options);
};

exports.existsThenCreateDir = function (dirPath) {
    if (!exists(dirPath)) {
        exports.createDir(dirPath);
    }
};
