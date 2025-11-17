import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';

// JWT密钥配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 开发环境警告
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  警告：未设置JWT_SECRET环境变量，正在使用默认值');
  console.warn('⚠️  生产环境请务必在.env文件中配置强密钥！');
  console.warn('⚠️  生成密钥命令: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export function registerUser(username: string, email: string, password: string): Promise<User> {
  return new Promise(async (resolve, reject) => {
    try {
      // 检查用户名是否已存在
      const existingUser = db.findUserByUsernameOrEmail(username);
      if (existingUser) {
        reject(new Error('用户名或邮箱已存在'));
        return;
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建新用户
      const newUser = db.createUser(username, email, hashedPassword);

      resolve({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        created_at: newUser.created_at
      });
    } catch (error: any) {
      reject(error);
    }
  });
}

export function loginUser(username: string, password: string): Promise<{ user: User; token: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      const user = db.findUserByUsernameOrEmail(username);
      
      if (!user) {
        reject(new Error('用户名或密码错误'));
        return;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        reject(new Error('用户名或密码错误'));
        return;
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      resolve({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        },
        token
      });
    } catch (error: any) {
      reject(error);
    }
  });
}

export function verifyToken(token: string): { userId: number; username: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.userId, username: decoded.username };
  } catch (error) {
    throw new Error('无效的令牌');
  }
}

export function getUserById(userId: number): User | null {
  const user = db.findUserById(userId);
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at
  };
}