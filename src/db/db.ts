import Dexie, { Table } from 'dexie';

export interface UserStreamingServiceId {
  id?: number,
  streamingServiceId: string,
}

export class AppDB extends Dexie {
  userStreamingServiceIds!: Table<UserStreamingServiceId, number>;

  constructor() {
    super('watchlist');

    this.version(1).stores({
      userStreamingServiceIds: '++, &streamingServiceId',
    });
    this.on('populate', () => this.populate()); //
  }

  // Run when database is created on client
  async populate() {
    await db.userStreamingServiceIds.bulkAdd([
      {
        streamingServiceId: 'disney-plus',
      },
      {
        streamingServiceId: 'apple-tv',
      },
    ]);
  }
}

export const db = new AppDB();
