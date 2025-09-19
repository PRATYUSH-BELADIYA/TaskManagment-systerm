const { promisePool } = require('../config/database');

class notify {

  static async getNotifications() {
    try {
      const [rows] = await promisePool.execute(
        'SELECT * FROM notifications'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async createNotification(notificationData) {
    const { user_id, message, type } = notificationData;
    try {
      const [result] = await promisePool.execute(
        'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
        [user_id, message, type]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async deleteNotification(userId){
    const [result] = await promisePool.execute(
      'DELETE FROM notifications WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

}

module.exports = notify;