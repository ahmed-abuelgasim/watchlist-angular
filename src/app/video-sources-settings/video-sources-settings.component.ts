import { Component, OnInit } from '@angular/core';
import { VideoSourcesService } from '../services/video-sources.service';


const ERROR_MSGS = {
  EXISTING: 'Video source already exists',
  ADD: 'There was an error adding the video source. Please try again.',
  DELETE: 'There was an error deleteing the video source. Please try again.',
};

@Component({
  selector: 'app-video-sources-settings',
  templateUrl: './video-sources-settings.component.html',
  styleUrls: ['./video-sources-settings.component.scss'],
})
export class VideoSourcesSettingsComponent implements OnInit {
  constructor(public videoSourcesService: VideoSourcesService) { }

  ngOnInit(): void {
  }

  checkboxChanged(event: Event) {
    const checkBoxEl = event.target as HTMLInputElement;
    const videoSourceId = parseInt(checkBoxEl.id, 10);
    const newActiveState = checkBoxEl.checked;
    this.videoSourcesService.changeSourceActiveState(videoSourceId, newActiveState);
  }

  id: number = 0;


  async addSource() {
    try {
      this.id = await this.videoSourcesService.addCustomSource({name: 'Kodi'});
    } catch (error) {
      const toastMessage = (error as Error).name == VideoSourcesService.sourceExistsErrorType ?
        ERROR_MSGS.EXISTING :
        ERROR_MSGS.ADD;
      alert(toastMessage);
    }
  }

  async deleteSource() {
    try {
      await this.videoSourcesService.removeCustomSource(this.id);
    } catch (error) {
      alert(ERROR_MSGS.DELETE);
    }
  }
}
