const express = require('express');
const router = express.Router();
const passport = require("passport");
const { generateToken } = require("../utils/jwt");

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

router.post('/forgot_password', forgotPassword);  
router.post('/reset_password', resetPassword);
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback",passport.authenticate("github", { failureRedirect: "/" }),
  async (req, res) => {const user = req.user;

  const token = generateToken({userId: user.id,email: user.email,role: user.role,});

    res.json({
      success: true,
      message: "GitHub login successful",
      data: {
        token,
        user,
      },
    });
  }
);

// Protected routes (authentication required)
router.use(authenticateToken);

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Admin only routes
router.get('/', requireAdmin, getAllUsers);
router.get('/:id', requireAdmin, getUserById);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);
router.patch('/:id/toggle-status', requireAdmin, toggleUserStatus);

module.exports = router;
