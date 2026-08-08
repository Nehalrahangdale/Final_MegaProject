const getUsers = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users: [],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getUserById = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user: {
                id: req.params.id,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getUsers,
    getUserById,
};