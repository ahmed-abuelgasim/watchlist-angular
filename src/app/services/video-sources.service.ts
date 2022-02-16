import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { db } from '../../db/db';

export interface VideoSource {
  id?: number,
  active: boolean,
  image?: string,
  name: string,
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


@Injectable({
  providedIn: 'root'
})
export class VideoSourcesService {
  private _sourcesBehaviourSubject = new BehaviorSubject<VideoSource[]>([]);
  readonly sources$ = this._sourcesBehaviourSubject.asObservable();

  constructor() {}

  async addCustomSource(videoSource: VideoSource): Promise<number | string> {
    try {
      const id = await db.videoSources.add(videoSource);
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
