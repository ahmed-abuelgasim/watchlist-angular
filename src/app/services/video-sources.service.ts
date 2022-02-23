import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { VideoSource, NewVideoSource } from '../utils/video-source-utils';
import { db } from '../../db/db';


@Injectable({
  providedIn: 'root'
})
export class VideoSourcesService {
  static sourceExistsErrorType = 'ConstraintError';

  private _sourcesBehaviourSubject = new BehaviorSubject<VideoSource[]>([]);
  readonly sources$ = this._sourcesBehaviourSubject.asObservable();

  private _activeSourcesBehaviourSubject = new BehaviorSubject<VideoSource[]>([]);
  readonly activeSources$ = this._activeSourcesBehaviourSubject.asObservable();


  constructor() {
    this._init();
  }


  async addCustomSource(videoSource: NewVideoSource): Promise<number> {
    const id = await db.videoSources.add({...videoSource, active: true});
    await this._emitNewValuesToObservables();
    return id;
  }


  async changeSourceActiveState(id: number, newActiveState: boolean): Promise<void> {
    const updated = await db.videoSources.update(id, {active: newActiveState});
    if (updated) {
      await this._emitNewValuesToObservables();
    }
  }


  private async _emitNewValuesToObservables() {
    const updatedSources = await db.videoSources.toArray();
    this._sourcesBehaviourSubject.next(updatedSources);

    const updatedActiveSources = updatedSources.filter(source => source.active == true);
    this._activeSourcesBehaviourSubject.next(updatedActiveSources);
  }


  private async _init() {
    await this._emitNewValuesToObservables();
  }


  async removeCustomSource(id: number): Promise<void> {
    await db.videoSources.delete(id);
    await this._emitNewValuesToObservables();
  }
}
