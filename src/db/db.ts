import Dexie, { Table } from 'dexie';
import { VideoSource, initialVideoSources } from '../app/services/video-sources.service';

export class AppDB extends Dexie {
  videoSources!: Table<VideoSource, number>;

  constructor() {
    super('watchlist');

    this.version(1).stores({
      videoSources: '++id, &name',
    });

    this.on('populate', () => db.videoSources.bulkAdd(initialVideoSources));
  }
}

export const db = new AppDB();
