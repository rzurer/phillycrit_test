exports.initialize = function (fs, path, glob, browserify) {
  'use strict';
  const bundleSourceFiles = function () {
    const clientFilesPattern = './client/*.js',
      bundleFilePath = '../public/javascripts/bundle.js';
    glob.sync(clientFilesPattern).forEach(f => browserify.add(f));
    browserify.bundle().pipe(fs.createWriteStream(path.join(__dirname, bundleFilePath)));
  };
  return {
    bundleSourceFiles: bundleSourceFiles
  };
};