import Dexie, { Table } from 'dexie';
import { VideoSource } from '../app/services/video-sources.service';

const initialVideoSources: VideoSource[] = [
  {
    active: false,
    name: 'Disney plus',
  },
  {
    active: false,
    name: 'Apple TV+',
  },
  {
    active: false,
    name: 'Netflix',
  },
  {
    active: false,
    name: 'Amazon prime',
  },
];

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
