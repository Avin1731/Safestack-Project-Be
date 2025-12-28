const mongoose = require('mongoose');

const SiteStatSchema = new mongoose.Schema({
  identifier: { type: String, default: 'global_counter' }, // Penanda unik
  visits: { type: Number, default: 0 }
});

module.exports = mongoose.model('SiteStat', SiteStatSchema);