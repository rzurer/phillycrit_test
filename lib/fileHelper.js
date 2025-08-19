exports.initialize = function (fs, lineReader) {
  'use strict';
  const writeFile = function (fileName, obj) {
      fs.writeFile(fileName, JSON.stringify(obj, null, 4), function (err) {
        if (err) {
          console.error('An error occurred when saving the file ' + fileName);
        }
      });
    },
    writeTextFile = function (fileName, text, callback) {
      fs.writeFile(fileName, text, function (err) {
        if (err) {
          console.error('An error occurred when saving the file ' + fileName);
          if (callback) {
            callback({ success: false, message: 'The file was not saved. Details = ' + err });
            return;
          }
        }
        if (callback) {
          callback({ success: true, message: 'The file was saved to ' + fileName });
        }
      });
    },
    removeFile = function (currentPath) {
      fs.unlink(currentPath, function (err) {
        if (err) {
          console.error(err);
        }
      });
    },
    deleteFilesInFolderSync = function (directory) {
      var currentPath, removeFileSync;
      removeFileSync = function (file, index) {
        currentPath = directory + '/' + file;
        fs.unlinkSync(currentPath);
      };
      if (fs.existsSync(directory)) {
        fs.readdirSync(directory).forEach(removeFileSync);
      }
    },
    renameFile = function (oldPath, newPath, next) {
      fs.rename(oldPath, newPath, function (err) {
        if (err) {
          console.error('An error occurred when saving the file ' + oldPath);
        }
        next();
      });
    },
    processAuditLog = function (callback, next) {
      lineReader.eachLine('audit.log', (line, last) => {
        callback(line);
        if (last) {
          next();
        };
      });
    };
  return {
    writeFile: writeFile,
    writeTextFile: writeTextFile,
    removeFile: removeFile,
    deleteFilesInFolderSync: deleteFilesInFolderSync,
    renameFile: renameFile,
    processAuditLog: processAuditLog
  };
};