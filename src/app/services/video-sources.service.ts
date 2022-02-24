import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { VideoSource, NewVideoSource, sortByOrder } from '../utils/video-source-utils';
import { db } from '../../db/db';


@Injectable({
  providedIn: 'root'
})
export class VideoSourcesService {
  static sourceExistsErrorType = 'ConstraintError';

  private _activeSourcesBehaviourSubject = new BehaviorSubject<VideoSource[]>([]);
  readonly activeSources$ = this._activeSourcesBehaviourSubject.asObservable();
  private _initialised: Promise<void>;
  private _sourcesBehaviourSubject = new BehaviorSubject<VideoSource[]>([]);
  readonly sources$ = this._sourcesBehaviourSubject.asObservable();



  constructor() {
    this._initialised = new Promise(async (resolve) => {
      await this._emitLatestValuesToObservables();
      resolve();
    });
  }


  // Adds a new video source with an order of 0 so that it appears at the top of custom ordered lists
  async addCustomSource(videoSource: NewVideoSource): Promise<number> {
    // Reorder existing sources by adding incrementing order values by 1
    await this._initialised;
    const reorderedSources = this._sourcesBehaviourSubject
      .getValue()
      .sort(sortByOrder)
      .map((source, i) => {return {...source, order: i + 1 }})
      .reverse();
    await db.videoSources.bulkPut(reorderedSources);

    // Add new value with order of 0
    const id = await db.videoSources.add({...videoSource, active: true, order: 0});

    // Emit updated sources to observables
    await this._emitLatestValuesToObservables();
    return id;
  }


  async changeSourceActiveState(sourcesToUpdate: {id: number, newActiveState: boolean}[]): Promise<void> {
    await this._initialised;
    const updatedSources = sourcesToUpdate.map((sourceToUpdate): VideoSource => {
      const sourceMatch = this._sourcesBehaviourSubject
        .getValue()
        .find(source => source.id == sourceToUpdate.id);
      return {...sourceMatch!, active: sourceToUpdate.newActiveState};
    });

    await db.videoSources.bulkPut(updatedSources);

    // Emit updated sources to observables
    await this._emitLatestValuesToObservables();
  }


  private async _emitLatestValuesToObservables() {
    const updatedSources = await db.videoSources.toArray();
    const updatedActiveSources = updatedSources.filter(source => source.active == true);
    this._sourcesBehaviourSubject.next(updatedSources);
    this._activeSourcesBehaviourSubject.next(updatedActiveSources);
  }


  async removeCustomSources(ids: number[]): Promise<void> {
    // Delete sources
    await Promise.all([
      this._initialised,
      db.videoSources.bulkDelete(ids)
    ]);

    // Reorder remaining sources
    const reorderedSources = this._sourcesBehaviourSubject
      .getValue()
      .filter(source => !ids.includes(source.id!))
      .sort(sortByOrder)
      .map((source, i) => {return {...source, order: i}});
    await db.videoSources.bulkPut(reorderedSources);

    // Emit updated sources to observables
    await this._emitLatestValuesToObservables();
  }
}
