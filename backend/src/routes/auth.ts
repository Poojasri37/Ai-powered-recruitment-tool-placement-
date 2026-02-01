import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

interface AuthRequest extends Request {
  userId?: string;
}

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(new AppError(400, 'Please provide name, email, and password'));
    }

    if (role && !['recruiter', 'candidate'].includes(role)) {
      return next(new AppError(400, 'Invalid role. Choose recruiter or candidate'));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError(400, 'Email already registered'));
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'candidate',
    });
    await user.save();

    const token = generateToken(user._id?.toString() || '');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError(400, 'Please provide email and password'));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError(401, 'Invalid email or password'));
    }

    const token = generateToken(user._id?.toString() || '');

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
});

// Verify token
router.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return next(new AppError(401, 'Unauthorized'));
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
