const crypto = require('crypto');

/**
 * Membuat hash unik dari ID User agar anonimitas terjaga
 * @param {string} userId - ID User dari MongoDB
 * @returns {string} - Hash string
 */
const generateAnonHash = (userId) => {
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET) // Gunakan JWT_SECRET sebagai salt
    .update(userId.toString())
    .digest('hex');
};

module.exports = { generateAnonHash };