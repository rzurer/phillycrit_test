exports.initialize = function (crypto, dataStore) {
  'use strict';
  const encrypt = function (text, callback) {
      dataStore.emailStore.getCryptoKey((key) => {
        const iv = crypto.randomBytes(16),
          cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        callback(iv.toString('hex') + ':' + encrypted.toString('hex'));
      });
    },
    decrypt = function (text, callback) {
      dataStore.emailStore.getCryptoKey((key) => {
        const textParts = text.split(':'),
          iv = Buffer.from(textParts.shift(), 'hex'),
          encryptedText = Buffer.from(textParts.join(':'), 'hex'),
          decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        callback(decrypted.toString());
      });
    };
  return {
    encrypt: encrypt,
    decrypt: decrypt
  };
};