import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { VideoSource, NewVideoSource } from '../utils/video-source-utils';
import { db } from '../../db/db';


@Injectable({
  providedIn: 'root'
})
export class VideoSourcesService {
  static sourceExistsErrorType = 'ConstraintError';

  private _activeSourcesBehaviourSubject = new BehaviorSubject<VideoSource[]>([]);
  readonly activeSources$ = this._activeSourcesBehaviourSubject.asObservable();

  private _sourcesBehaviourSubject = new BehaviorSubject<VideoSource[]>([]);
  readonly sources$ = this._sourcesBehaviourSubject.asObservable();


  constructor() {
    this._init();
  }


  async addCustomSource(videoSource: NewVideoSource): Promise<number> {
    const sources = await db.videoSources.toArray();
    const id = await db.videoSources.add({...videoSource, active: true, order: sources.length});
    await this._emitLatestValuesToObservables();
    return id;
  }


  async changeSourceActiveState(sourcesToUpdate: {id: number, newActiveState: boolean}[]): Promise<void> {
    const sources = await db.videoSources.toArray();

    const updatedSources = sourcesToUpdate.map((sourceToUpdate) => {
      const sourceMatch = sources.find(source => source.id == sourceToUpdate.id);
      return {...sourceMatch, active: sourceToUpdate.newActiveState} as VideoSource;
    });

    await db.videoSources.bulkPut(updatedSources);
    await this._emitLatestValuesToObservables();
  }


  private async _emitLatestValuesToObservables() {
    const updatedSources = await db.videoSources.toArray();
    this._sourcesBehaviourSubject.next(updatedSources);
    const updatedActiveSources = updatedSources.filter(source => source.active == true);
    this._activeSourcesBehaviourSubject.next(updatedActiveSources);
  }


  private async _init() {
    await this._emitLatestValuesToObservables();
  }


  async removeCustomSource(id: number): Promise<void> {
    await db.videoSources.delete(id);

    // Reorder sources
    const updatedSources = await db.videoSources.orderBy('order').toArray();
    const reorderedSources = updatedSources.map((source, i) => {return {...source, order: i}});
    await db.videoSources.bulkPut(reorderedSources);
    await this._emitLatestValuesToObservables();
  }
}
