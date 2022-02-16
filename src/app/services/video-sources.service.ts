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


  constructor() {}


  async addCustomSource(videoSource: NewVideoSource): Promise<number | string> {
    try {
      const id = await db.videoSources.add({...videoSource, active: true});
      const updatedSources = await db.videoSources.orderBy('name').toArray();
      this._sourcesBehaviourSubject.next(updatedSources);
      return id;
    } catch (error) {
      return error instanceof Error && error.name === 'ConstraintError' ?
        AddFailureEnum.SourceExists :
        AddFailureEnum.Failed;
    }
  }


  async removeCustomSource(id: number): Promise<number> {
    try {
      await db.videoSources.delete(id);
      return RemoveEnum.Succeeded;
    } catch (error) {
      return RemoveEnum.Failed;
    }
  }


  async changeSourceActiveState(id: number, newActiveState: boolean): Promise<number> {
    try {
      const updated = await (newActiveState ?
        db.videoSources.update(id, {active: true}) :
        db.videoSources.update(id, {active: false})
      );
      return updated ?
        (newActiveState ? ActiveEnum.Activated : ActiveEnum.Deactivated) :
        ActiveEnum.Failed;
    } catch (error) {
      return ActiveEnum.OtherError;
    }
  }
}
