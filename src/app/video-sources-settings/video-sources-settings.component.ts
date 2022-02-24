import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { VideoSourcesService } from '../services/video-sources.service';
import { VideoSource } from '../utils/video-source-utils';


@Component({
  selector: 'app-video-sources-settings',
  templateUrl: './video-sources-settings.component.html',
  styleUrls: ['./video-sources-settings.component.scss'],
})
export class VideoSourcesSettingsComponent implements OnInit, OnDestroy {
  static ERROR_MSGS = {
    // ADD: 'There was an error adding the video source. Please try again.',
    // DELETE: 'There was an error deleteing the video source. Please try again.',
    // EXISTING: 'Video source already exists',
    UPDATE_FAILED: 'There was an error updating. Please try again.',
  };

  subscription!: Subscription;
  newActiveStates: {[k: string]: {id: number, newActiveState: boolean}} = {};
  submittingActiveSources = false;
  toastMsg = '';
  sources: VideoSource[] = [];


  constructor(public videoSourcesService: VideoSourcesService) { }


  get showSourcesSaveBtn(): boolean {
    return this.submittingActiveSources || Object.keys(this.newActiveStates).length > 0;
  }


  ngOnInit() {
    this.subscription = this.videoSourcesService.sources$
      .subscribe((sources) => {
        this.sources = sources;
      });
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  checkboxChanged(event: Event) {
    const checkBoxEl = event.target as HTMLInputElement;
    const videoSourceId = checkBoxEl.id;
    const newActiveState = checkBoxEl.checked;
    if (videoSourceId in this.newActiveStates) {
      delete this.newActiveStates[videoSourceId];
    } else {
      this.newActiveStates[videoSourceId] = {id: parseInt(videoSourceId, 10), newActiveState};
    }
    console.log(this.newActiveStates);
  }

  // async updateActiveSources(event: SubmitEvent) {
  //   event.preventDefault();
  //   this.submittingActiveSources = true;

  //   const updatedSources = Object.values(this.newActiveStates);
  //   await this.videoSourcesService.changeSourceActiveState(updatedSources)
  //     .catch((error) => {
  //       console.error(error);
  //       this.toastMsg = VideoSourcesSettingsComponent.ERROR_MSGS.UPDATE_FAILED;
  //       alert(this.toastMsg);
  //     }).finally(() => {
  //       this.newActiveStates = {};
  //       this.submittingActiveSources = false;
  //     });
  // }


  // id: number = 0;

  // async addSource(source: NewVideoSource = {name: 'Kodi'}) {
  //   try {
  //     this.id = await this.videoSourcesService.addCustomSource(source);
  //   } catch (error) {
  //     // const toastMessage = (error as Error).name == VideoSourcesService.sourceExistsErrorType ?
  //     //   VideoSourcesSettingsComponent.ERROR_MSGS.EXISTING :
  //     //   VideoSourcesSettingsComponent.ERROR_MSGS.ADD;
  //     // alert(toastMessage);
  //   }
  // }

  // async deleteSource() {
  //   try {
  //     await this.videoSourcesService.removeCustomSource(this.id);
  //   } catch (error) {
  //     alert(VideoSourcesSettingsComponent.ERROR_MSGS.DELETE);
  //   }
  // }
}