import Dexie, { Table } from 'dexie';
import { sortByName, initialVideoSources, VideoSource } from '../app/utils/video-source-utils';

export const dbName = 'watchlist';

export class AppDB extends Dexie {
  videoSources!: Table<VideoSource, number>;

  constructor() {
    super(dbName);

    const sortedVideoSources: VideoSource[] = initialVideoSources
      .sort(sortByName)
      .map((source, i) => {return {...source, order: i}});

    this.version(1).stores({
      videoSources: '++id, &name',
    });

    this.on('populate', () => db.videoSources.bulkAdd(sortedVideoSources));
  }
}

export const db = new AppDB();
