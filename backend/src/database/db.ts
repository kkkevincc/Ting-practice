import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '../../data');
const usersPath = path.join(dbPath, 'users.json');
const sessionsPath = path.join(dbPath, 'sessions.json');
const practiceRecordsPath = path.join(dbPath, 'practice_records.json');
const statisticsPath = path.join(dbPath, 'statistics.json');

// 确保数据目录存在
fs.ensureDirSync(dbPath);

// 初始化数据文件
if (!fs.existsSync(usersPath)) {
  fs.writeJsonSync(usersPath, []);
}
if (!fs.existsSync(sessionsPath)) {
  fs.writeJsonSync(sessionsPath, []);
}
if (!fs.existsSync(practiceRecordsPath)) {
  fs.writeJsonSync(practiceRecordsPath, []);
}
if (!fs.existsSync(statisticsPath)) {
  fs.writeJsonSync(statisticsPath, []);
}

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: string;
}

interface Session {
  id: string;
  user_id: number;
  audio_url: string;
  questions: string;
  transcript: string | null;
  keywords: string | null;
  status: string;
  created_at: string;
}

interface PracticeRecord {
  id: number;
  session_id: string;
  user_id: number;
  clicked_words: string;
  total_words: number;
  accuracy: number;
  time_spent: number;
  created_at: string;
}

interface Statistics {
  id: number;
  user_id: number;
  total_sessions: number;
  total_practices: number;
  average_accuracy: number;
  total_time_spent: number;
  updated_at: string;
}

class Database {
  private getUsers(): User[] {
    return fs.readJsonSync(usersPath);
  }

  private saveUsers(users: User[]) {
    fs.writeJsonSync(usersPath, users, { spaces: 2 });
  }

  private getSessions(): Session[] {
    return fs.readJsonSync(sessionsPath);
  }

  private saveSessions(sessions: Session[]) {
    fs.writeJsonSync(sessionsPath, sessions, { spaces: 2 });
  }

  private getPracticeRecords(): PracticeRecord[] {
    return fs.readJsonSync(practiceRecordsPath);
  }

  private savePracticeRecords(records: PracticeRecord[]) {
    fs.writeJsonSync(practiceRecordsPath, records, { spaces: 2 });
  }

  private getStatistics(): Statistics[] {
    return fs.readJsonSync(statisticsPath);
  }

  private saveStatistics(stats: Statistics[]) {
    fs.writeJsonSync(statisticsPath, stats, { spaces: 2 });
  }

  // User operations
  findUserByUsernameOrEmail(usernameOrEmail: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.username === usernameOrEmail || u.email === usernameOrEmail) || null;
  }

  findUserById(id: number): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  createUser(username: string, email: string, password: string): User {
    const users = this.getUsers();
    const newUser: User = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      username,
      email,
      password,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    this.saveUsers(users);
    
    // 创建统计记录
    const stats = this.getStatistics();
    stats.push({
      id: stats.length > 0 ? Math.max(...stats.map(s => s.id)) + 1 : 1,
      user_id: newUser.id,
      total_sessions: 0,
      total_practices: 0,
      average_accuracy: 0,
      total_time_spent: 0,
      updated_at: new Date().toISOString()
    });
    this.saveStatistics(stats);
    
    return newUser;
  }

  // Session operations
  createSession(session: Omit<Session, 'id' | 'created_at'>): Session {
    const sessions = this.getSessions();
    const newSession: Session = {
      ...session,
      id: Date.now().toString() + '-' + Math.round(Math.random() * 1E9),
      created_at: new Date().toISOString()
    };
    sessions.push(newSession);
    this.saveSessions(sessions);
    return newSession;
  }

  findSessionById(id: string): Session | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === id) || null;
  }

  findSessionsByUserId(userId: number): Session[] {
    const sessions = this.getSessions();
    return sessions.filter(s => s.user_id === userId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  updateSession(id: string, updates: Partial<Session>): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      this.saveSessions(sessions);
    }
  }

  // Practice record operations
  createPracticeRecord(record: Omit<PracticeRecord, 'id' | 'created_at'>): PracticeRecord {
    const records = this.getPracticeRecords();
    const newRecord: PracticeRecord = {
      ...record,
      id: records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1,
      created_at: new Date().toISOString()
    };
    records.push(newRecord);
    this.savePracticeRecords(records);
    return newRecord;
  }

  findPracticeRecordsByUserId(userId: number, limit: number = 50): PracticeRecord[] {
    const records = this.getPracticeRecords();
    return records
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  // Statistics operations
  findStatisticsByUserId(userId: number): Statistics | null {
    const stats = this.getStatistics();
    return stats.find(s => s.user_id === userId) || null;
  }

  updateStatistics(userId: number, updates: Partial<Statistics>): void {
    const stats = this.getStatistics();
    const index = stats.findIndex(s => s.user_id === userId);
    if (index !== -1) {
      stats[index] = { ...stats[index], ...updates, updated_at: new Date().toISOString() };
      this.saveStatistics(stats);
    }
  }
}

const db = new Database();
export default db;