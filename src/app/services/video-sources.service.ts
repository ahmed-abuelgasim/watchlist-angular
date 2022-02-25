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
      .map((source, i) => ({...source, order: i + 1 }))
    await db.videoSources.bulkPut(reorderedSources);

    // Add new value with order of 0
    const id = await db.videoSources.add({...videoSource, active: true, order: 0});

    // Emit updated sources to observables
    await this._emitLatestValuesToObservables();
    return id;
  }


  async changeSourceActiveState(id: number, newActiveState: boolean): Promise<void> {
    await Promise.all([
      this._initialised,
      db.videoSources.update(id, {active: newActiveState}),
    ])
    .finally(() => this._emitLatestValuesToObservables());
  }


  private async _emitLatestValuesToObservables() {
    const updatedSources = await db.videoSources.toArray();
    const updatedActiveSources = updatedSources.filter(source => source.active == true);
    this._sourcesBehaviourSubject.next(updatedSources);
    this._activeSourcesBehaviourSubject.next(updatedActiveSources);
  }


  async deleteCustomSource(id: number): Promise<void> {
    // Delete source
    const deletePromise = db.videoSources.delete(id);

    // Reorder remaining sources
    await this._initialised
    const reorderedSources = this._sourcesBehaviourSubject
      .getValue()
      .filter(source => source.id != id)
      .sort(sortByOrder)
      .map((source, i) => ({...source, order: i}));
    await deletePromise;
    await db.videoSources.bulkPut(reorderedSources)
      .finally(() => this._emitLatestValuesToObservables());
  }


  async reorderSources(newOrders: {id: number, order: number}[]): Promise<void> {
    const initialisedPromise = this._initialised;
    const newOrdersDict = Object.assign(
      {},
      ...newOrders.map(newOrder => ({[newOrder.id]: newOrder}))
    );

    await initialisedPromise;
    const reorderedSources = this._sourcesBehaviourSubject
      .getValue()
      .map(source => ({...source, order: newOrdersDict[source.id!].order}));
    await db.videoSources.bulkPut(reorderedSources)
      .finally(() => this._emitLatestValuesToObservables());
  }
}
