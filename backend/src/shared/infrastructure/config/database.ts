import mongoose from 'mongoose';

export class Database {
  private static instance: Database;

  private constructor() { }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {

    try {
      const url = process.env.MONGODB_URI ?? '';
      await mongoose.connect(url);
      console.log('Database connected successfully');
    } catch (error) {
      console.log('Database connection failed:', error);
    }
  }
}

export const connectDatabase = async (): Promise<void> => {
  const db = Database.getInstance();
  await db.connect();
};
