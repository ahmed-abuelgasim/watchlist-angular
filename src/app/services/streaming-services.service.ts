import { Injectable } from '@angular/core';
import { liveQuery } from 'dexie';
import { db } from '../../db/db';
import { Subject } from 'rxjs';

export interface StreamingService {
  id: string,
  name: string,
}

@Injectable({
  providedIn: 'root'
})
export class StreamingServicesService {
  readonly allStreamingServices: StreamingService[] = [
    {
      id: 'apple-tv',
      name: 'Apple TV+',
    },
    {
      id: 'disney-plus',
      name: 'Disney plus',
    },
    {
      id: 'netflix',
      name: 'Netflix',
    },
  ];

  readonly dbUserStreamingServiceIds$ = liveQuery(() => db.userStreamingServiceIds.toArray());
  readonly userStreamingServiceIds$ = new Subject<string[]>();
  readonly userStreamingServices$ = new Subject<StreamingService[]>();

  constructor() {
    this.dbUserStreamingServiceIds$.subscribe(
      dbUserStreamingServiceIds => {
        const userStreamingServiceIds = dbUserStreamingServiceIds
          .map(dbUserStreamingServiceId => dbUserStreamingServiceId.streamingServiceId);
        // console.log(userStreamingServiceIds);

        const userStreamingServices = this.allStreamingServices.filter(
          (streamingService) => userStreamingServiceIds.includes(streamingService.id)
        );
        // console.log(userStreamingServices);

        this.userStreamingServices$.next(userStreamingServices);
        this.userStreamingServiceIds$.next(userStreamingServiceIds);

      }
    );
  }

  async updateUserStreamingServices(streamingServiceIds: string[]) {
    const bulkAddValue = streamingServiceIds.map(
      id => {return {streamingServiceId: id}}
    );
    await db.userStreamingServiceIds.clear();
    await db.userStreamingServiceIds.bulkAdd(bulkAddValue);
  }
}
