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

export enum AddFailureEnum {
  Failed = 'FAILED',
  SourceExists = 'EXISTS',
}

export enum RemoveEnum {
  Succeeded,
  Failed,
}

export enum ActiveEnum {
  Activated,
  Deactivated,
  Failed,
  OtherError,
}

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
  private _sourcesBehaviourSubject = new BehaviorSubject<VideoSource[]>([]);
  readonly sources$ = this._sourcesBehaviourSubject.asObservable();

  private _activeSourcesBehaviourSubject = new BehaviorSubject<VideoSource[]>([]);
  readonly activeSources$ = this._activeSourcesBehaviourSubject.asObservable();


  constructor() {}


  async addCustomSource(videoSource: NewVideoSource): Promise<number | string> {
    try {
      const id = await db.videoSources.add({...videoSource, active: true});
      await this.emitNewValuesToObservables();
      return id;
    } catch (error) {
      return error instanceof Error && error.name === 'ConstraintError' ?
        AddFailureEnum.SourceExists :
        AddFailureEnum.Failed;
    }
  }


  async changeSourceActiveState(id: number, newActiveState: boolean): Promise<number> {
    try {
      const updated = await (newActiveState ?
        db.videoSources.update(id, {active: true}) :
        db.videoSources.update(id, {active: false})
      );
      await this.emitNewValuesToObservables();
      return updated ?
        (newActiveState ? ActiveEnum.Activated : ActiveEnum.Deactivated) :
        ActiveEnum.Failed;
    } catch (error) {
      return ActiveEnum.OtherError;
    }
  }


  async emitNewValuesToObservables() {
    const updatedSources = await db.videoSources.orderBy('name').toArray();
    this._sourcesBehaviourSubject.next(updatedSources);

    const updatedActiveSources = updatedSources.filter(source => source.active == true);
    this._activeSourcesBehaviourSubject.next(updatedActiveSources);
  }


  async removeCustomSource(id: number): Promise<number> {
    try {
      await db.videoSources.delete(id);
      await this.emitNewValuesToObservables();
      return RemoveEnum.Succeeded;
    } catch (error) {
      return RemoveEnum.Failed;
    }
  }
}
