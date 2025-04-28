import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma';

type User = {
  id: string;
  email: string;
  name?: string;
  password?: string;
  role: UserRole;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
};
type UserRole = 'PROPERTY_OWNER' | 'VALUATOR' | 'ADMIN';

// Types
export interface AuthResult {
  success: boolean;
  message?: string;
  user?: Omit<User, 'password'>;
  token?: string;
}

export interface RegisterParams {
  email: string;
  password?: string;
  name?: string;
  role?: UserRole;
  walletAddress?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface Web3LoginParams {
  walletAddress: string;
  signedMessage?: string;
}

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly SALT_ROUNDS: number;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'mapchain-hedera-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
    this.SALT_ROUNDS = 10;
  }

  /**
   * Register a new user
   */
  async register(params: RegisterParams): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: params.email },
            params.walletAddress ? { walletAddress: params.walletAddress } : undefined
          ].filter(Boolean) as any
        }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User with this email or wallet address already exists'
        };
      }

      // Hash password if provided
      let hashedPassword = null;
      if (params.password) {
        hashedPassword = await bcrypt.hash(params.password, this.SALT_ROUNDS);
      }

      // Create new user
      const user = await prisma.user.create({
        data: {
          email: params.email,
          password: hashedPassword,
          name: params.name,
          role: params.role || 'PROPERTY_OWNER',
          walletAddress: params.walletAddress
        }
      });

      // Generate JWT token
      const token = this.generateToken(user);

      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword,
        token
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Failed to register user'
      };
    }
  }

  /**
   * Login with email and password
   */
  async login(params: LoginParams): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: params.email }
      });

      if (!user || !user.password) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(params.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Create session
      await this.createSession(user.id, token);

      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword,
        token
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Failed to login'
      };
    }
  }

  /**
   * Login with Web3 wallet
   */
  async loginWithWallet(params: Web3LoginParams): Promise<AuthResult> {
    try {
      // Find user by wallet address
      let user = await prisma.user.findUnique({
        where: { walletAddress: params.walletAddress }
      });

      // If user doesn't exist, create a new one
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: `${params.walletAddress.substring(0, 8)}@wallet.mapchain.io`,
            walletAddress: params.walletAddress,
            role: 'PROPERTY_OWNER'
          }
        });
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Create session
      await this.createSession(user.id, token);

      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword,
        token
      };
    } catch (error: any) {
      console.error('Web3 login error:', error);
      return {
        success: false,
        message: error.message || 'Failed to login with wallet'
      };
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<AuthResult> {
    try {
      // Verify token
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
    } catch (error: any) {
      console.error('Token verification error:', error);
      return {
        success: false,
        message: error.message || 'Invalid token'
      };
    }
  }

  /**
   * Create session
   */
  private async createSession(userId: string, token: string): Promise<void> {
    // Calculate expiration date
    const expiresIn = this.JWT_EXPIRES_IN;
    let expiresInMs = 7 * 24 * 60 * 60 * 1000; // Default to 7 days
    
    if (expiresIn.endsWith('d')) {
      expiresInMs = parseInt(expiresIn.slice(0, -1)) * 24 * 60 * 60 * 1000;
    } else if (expiresIn.endsWith('h')) {
      expiresInMs = parseInt(expiresIn.slice(0, -1)) * 60 * 60 * 1000;
    } else if (expiresIn.endsWith('m')) {
      expiresInMs = parseInt(expiresIn.slice(0, -1)) * 60 * 1000;
    } else if (expiresIn.endsWith('s')) {
      expiresInMs = parseInt(expiresIn.slice(0, -1)) * 1000;
    }

    const expires = new Date(Date.now() + expiresInMs);

    // Create session
    await prisma.session.create({
      data: {
        userId,
        expires,
        sessionToken: token,
        accessToken: token
      }
    });
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload = { userId: user.id, email: user.email, role: user.role };
    const options: SignOptions = { expiresIn: parseInt(this.JWT_EXPIRES_IN) || '7d' };
    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return null;
      }

      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
}

export default new AuthService();
