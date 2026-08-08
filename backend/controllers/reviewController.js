// Add Review
const addReview = async (req, res) => {
    try {
        const {
            userId,
            parkingId,
            rating,
            comment
        } = req.body;

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            data: {
                userId,
                parkingId,
                rating,
                comment
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Reviews
const getAllReviews = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            data: []
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Review By ID
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        res.status(200).json({
            success: true,
            message: "Review details fetched successfully",
            reviewId: id
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Review
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: {
                reviewId: id,
                rating,
                comment
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            reviewId: id
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addReview,
    getAllReviews,
    getReviewById,
    updateReview,
    deleteReview
};