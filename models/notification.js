const { promisePool } = require('../config/database');

class notify {
    static async createNotification(notificationData) {
    const { user_id,message , type } = notificationData;
    try {
      const [result] = await promisePool.execute(
        'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
        [user_id, message , type]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = notify;