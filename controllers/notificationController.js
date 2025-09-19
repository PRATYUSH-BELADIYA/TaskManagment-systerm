const notify = require('../models/notification');

const getNotifications = async (req, res) =>{
    try {
        const userId = req.user.id;
        const notifications = await notify.getNotifications();
        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deleteNotification = async (req,res) => {
    try {
        const userId = req.params.id;
        const deleted = await notify.deleteNotification(userId);
        const Notifications = await notify.createNotification({
            user_id:req.user.id,
            message:`${req.user.id} : Delete All Notificationrecord of ${userId}`,
            type:'Delete Records'
        });
        res.json({
            success: true,
            data: "Deleted Successfully"
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { 
    getNotifications,
    deleteNotification
};