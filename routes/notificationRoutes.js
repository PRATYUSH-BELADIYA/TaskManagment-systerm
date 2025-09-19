const express = require('express');
const router = express.Router();
const { getNotifications, deleteNotification } = require('../controllers/notificationController');
const { authenticateToken ,requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/getNotificationdata',requireAdmin,getNotifications);
router.delete('/deleteNotification/:id',requireAdmin,deleteNotification);

module.exports = router;