import { UserSession, SnipeHistory, Leaderboard } from './types';

/**
 * In-memory database (replace with MongoDB/PostgreSQL in production)
 * This is suitable for small deployments; for scale, use external DB
 */

export class Database {
  private users: Map<number, UserSession> = new Map();
  private snipeHistory: SnipeHistory[] = [];
  private leaderboard: Map<number, Leaderboard> = new Map();

  // Users
  async getUser(telegramId: number): Promise<UserSession | null> {
    return this.users.get(telegramId) || null;
  }

  async setUser(telegramId: number, session: UserSession): Promise<void> {
    this.users.set(telegramId, session);
  }

  async updateUserWallet(telegramId: number, walletPubkey: string): Promise<void> {
    const user = this.users.get(telegramId);
    if (user) {
      user.walletPubkey = walletPubkey;
      this.users.set(telegramId, user);
    }
  }

  async updateUserSubscription(telegramId: number, expiryDate: Date): Promise<void> {
    const user = this.users.get(telegramId);
    if (user) {
      user.subscribedUntil = expiryDate;
      this.users.set(telegramId, user);
    }
  }

  async isSubscribed(telegramId: number): Promise<boolean> {
    const user = this.users.get(telegramId);
    if (!user?.subscribedUntil) return false;
    return new Date() < user.subscribedUntil;
  }

  // Snipe History
  async logSnipe(history: SnipeHistory): Promise<void> {
    this.snipeHistory.push(history);
  }

  async getUserSnipes(telegramId: number): Promise<SnipeHistory[]> {
    return this.snipeHistory.filter((s) => s.userId === telegramId);
  }

  async getAllSnipes(): Promise<SnipeHistory[]> {
    return this.snipeHistory;
  }

  // Leaderboard
  async updateLeaderboard(): Promise<void> {
    const userStats: Map<number, { totalSniped: number; totalProfit: number }> = new Map();

    for (const snipe of this.snipeHistory) {
      if (!userStats.has(snipe.userId)) {
        userStats.set(snipe.userId, { totalSniped: 0, totalProfit: 0 });
      }
      const stats = userStats.get(snipe.userId)!;
      stats.totalSniped += snipe.solAmount;
      stats.totalProfit += snipe.profitPercent || 0;
    }

    // Convert to leaderboard
    const ranked = Array.from(userStats.entries())
      .map((entry, idx) => ({
        userId: entry[0],
        totalSniped: entry[1].totalSniped,
        totalProfit: entry[1].totalProfit,
        rank: idx + 1,
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit);

    this.leaderboard.clear();
    ranked.forEach((lb) => {
      this.leaderboard.set(lb.userId, lb);
    });
  }

  async getLeaderboard(limit: number = 10): Promise<Leaderboard[]> {
    await this.updateLeaderboard();
    return Array.from(this.leaderboard.values()).slice(0, limit);
  }

  async getUserRank(telegramId: number): Promise<number | null> {
    const lb = this.leaderboard.get(telegramId);
    return lb?.rank || null;
  }
}

export const db = new Database();
