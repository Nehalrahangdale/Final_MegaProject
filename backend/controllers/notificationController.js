// Create Notification
const createNotification = async (req, res) => {
    try {
        const {
            userId,
            title,
            message
        } = req.body;

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            data: {
                userId,
                title,
                message,
                isRead: false
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Notifications
const getAllNotifications = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            data: []
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Notification By ID
const getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;

        res.status(200).json({
            success: true,
            message: "Notification fetched successfully",
            notificationId: id
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark Notification as Read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notificationId: id
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
            notificationId: id
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createNotification,
    getAllNotifications,
    getNotificationById,
    markAsRead,
    deleteNotification
};