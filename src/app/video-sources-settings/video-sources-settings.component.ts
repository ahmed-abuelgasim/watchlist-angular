import { Component, OnInit } from '@angular/core';
import { VideoSourcesService } from '../services/video-sources.service';


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
}
