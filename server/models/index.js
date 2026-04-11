/**
 * Legacy Mongoose Models
 * 
 * ⚠️  These models are NOT actively used in the current implementation.
 * 
 * The application has been migrated from MongoDB to MariaDB.
 * Data operations now use the DataProvider service which works with MariaDB tables,
 * falling back to local db.json as needed.
 * 
 * These model files are kept for reference only.
 * For current database operations, see: server/services/dataProvider.js
 */

module.exports = {
    User: require('./User'),
    Transaction: require('./Transaction'),
    Trade: require('./Trade'),
    Verification: require('./Verification'),
    Plan: require('./Plan'),
    Ticket: require('./Ticket'),
    Message: require('./Message'),
    AdminLog: require('./AdminLog'),
};