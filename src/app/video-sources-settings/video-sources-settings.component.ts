import { Component } from '@angular/core';
import { VideoSourcesService } from '../services/video-sources.service';


@Component({
  selector: 'app-video-sources-settings',
  templateUrl: './video-sources-settings.component.html',
  styleUrls: ['./video-sources-settings.component.scss'],
})
export class VideoSourcesSettingsComponent {
  static ERROR_MSGS = {
    // ADD: 'There was an error adding the video source. Please try again.',
    // DELETE: 'There was an error deleteing the video source. Please try again.',
    // EXISTING: 'Video source already exists',
    UPDATE_FAILED: 'There was an error updating. Please try again.',
  };

  newActiveStates: {[k: string]: boolean} = {};
  submittingActiveSources = false;


  constructor(public videoSourcesService: VideoSourcesService) { }


  get showSourcesSaveBtn(): boolean {
    return this.submittingActiveSources || Object.keys(this.newActiveStates).length > 0;
  }


  checkboxChanged(event: Event) {
    const checkBoxEl = event.target as HTMLInputElement;
    const videoSourceId = checkBoxEl.id;
    const newActiveState = checkBoxEl.checked;
    if (videoSourceId in this.newActiveStates) {
      delete this.newActiveStates[videoSourceId];
    } else {
      this.newActiveStates[videoSourceId] = newActiveState;
    }
  }

  async updateActiveSources(event: SubmitEvent) {
    event.preventDefault();
    this.submittingActiveSources = true;

    const promises: Promise<void>[] = [];
    for (const [id, newActiveState] of Object.entries(this.newActiveStates)) {
      promises.push(
        this.videoSourcesService.changeSourceActiveState(parseInt(id, 10), newActiveState)
      );
    }
    await Promise.all(promises);

    this.newActiveStates = {};
    this.submittingActiveSources = false;
  }



  // id: number = 0;

  // async addSource(source: NewVideoSource = {name: 'Kodi'}) {
  //   try {
  //     this.id = await this.videoSourcesService.addCustomSource(source);
  //   } catch (error) {
  //     const toastMessage = (error as Error).name == VideoSourcesService.sourceExistsErrorType ?
  //       VideoSourcesSettingsComponent.ERROR_MSGS.EXISTING :
  //       VideoSourcesSettingsComponent.ERROR_MSGS.ADD;
  //     alert(toastMessage);
  //   }
  // }

  // async deleteSource(id: number) {
  //   try {
  //     await this.videoSourcesService.removeCustomSource(id);
  //   } catch (error) {
  //     alert(VideoSourcesSettingsComponent.ERROR_MSGS.DELETE);
  //   }
  // }
}
