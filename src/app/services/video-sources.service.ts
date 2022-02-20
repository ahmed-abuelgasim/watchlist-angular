import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { db } from '../../db/db';

export interface NewVideoSource {
  image?: string,
  name: string,
};

export interface VideoSource extends NewVideoSource {
  id?: number,
  active: boolean,
};


export const initialVideoSources: VideoSource[] = [
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
    this.init();
  }


  async addCustomSource(videoSource: NewVideoSource): Promise<number> {
    const id = await db.videoSources.add({...videoSource, active: true});
    await this.emitNewValuesToObservables();
    return id;
  }


  async changeSourceActiveState(id: number, newActiveState: boolean): Promise<number> {
    const updated = await (newActiveState ?
      db.videoSources.update(id, {active: true}) :
      db.videoSources.update(id, {active: false})
    );
    await this.emitNewValuesToObservables();
    // const updateSuccessful = (updated == 1)
    return updated;
  }


  async emitNewValuesToObservables() {
    const updatedSources = await db.videoSources.orderBy('name').toArray();
    this._sourcesBehaviourSubject.next(updatedSources);

    const updatedActiveSources = updatedSources.filter(source => source.active == true);
    this._activeSourcesBehaviourSubject.next(updatedActiveSources);
  }


  async init() {
    await this.emitNewValuesToObservables();
  }


  async removeCustomSource(id: number): Promise<void> {
    await db.videoSources.delete(id);
    await this.emitNewValuesToObservables();
  }
}
