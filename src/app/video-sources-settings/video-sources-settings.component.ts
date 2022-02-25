import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VideoSourcesService } from '../services/video-sources.service';
import { NewVideoSource } from '../utils/video-source-utils';


@Component({
  selector: 'app-video-sources-settings',
  templateUrl: './video-sources-settings.component.html',
  styleUrls: ['./video-sources-settings.component.scss'],
})
// export class VideoSourcesSettingsComponent implements OnInit, OnDestroy {
export class VideoSourcesSettingsComponent {
  static ERROR_MSGS = {
    ADD: 'There was an error adding the video source. Please try again.',
    DELETE: 'There was an error deleting the video source. Please try again.',
    EXISTING: 'Video source with same name already exists',
    ACTIVE_UPDATE: 'There was an error updating the video source. Please try again.',
  };

  formData: FormGroup;
  imageDataUrl = '';
  imageFileName = '';
  private reader: FileReader;
  toastMsg = '';
  editMode = false;


  constructor(
    private fb: FormBuilder,
    public videoSourcesService: VideoSourcesService
  ) {
    this.formData = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.maxLength(30),
      ]]
    });

    // File reader needed to convert image to blob
    this.reader = new FileReader();
    this.reader.addEventListener('load', () => {
      this.imageDataUrl = this.reader.result as string;
    });
  }


  get formNameInput() {
    return this.formData.get('name');
  }


  imageSelected(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    const files = inputEl.files;
    if (!files || !files[0]) return;
    const file = files[0];
    console.log(file);
    this.imageFileName = file.name;
    this.reader.readAsDataURL(file);
  }


  addSource(data: any) {
    const newVideoSource: NewVideoSource = {
      name: data.name,
      image: this.imageDataUrl,
    }

    this.videoSourcesService.addCustomSource(newVideoSource)
      .catch(error => {
        const toastMsg = (error as Error).name == VideoSourcesService.sourceExistsErrorType ?
          VideoSourcesSettingsComponent.ERROR_MSGS.EXISTING :
          VideoSourcesSettingsComponent.ERROR_MSGS.ADD;
        this.dealWithError(error, toastMsg);
      });

    this.imageFileName = '';
    this.imageDataUrl = '';
    this.formData.reset();
  }


  checkboxChanged(event: Event): void {
    const checkBoxEl = event.target as HTMLInputElement;
    if (checkBoxEl) {
      const id = parseInt(checkBoxEl.getAttribute('source-id')!, 10);
      this.videoSourcesService.changeSourceActiveState(id, checkBoxEl.checked)
        .catch(error => this.dealWithError(error, VideoSourcesSettingsComponent.ERROR_MSGS.ACTIVE_UPDATE));
    }
  }


  dealWithError(error: Error, toastMsg: string): void {
    this.toastMsg = toastMsg;
    alert(this.toastMsg);
    console.error(error);
  }


  deleteSource(event: MouseEvent): void {
    const buttonEl = event.target as HTMLButtonElement;
    const id = parseInt(buttonEl.getAttribute('source-id')!, 10);
    this.videoSourcesService.deleteCustomSource(id)
      .catch(error => this.dealWithError(error, VideoSourcesSettingsComponent.ERROR_MSGS.DELETE));
  }


  // ngOnInit() {
  //   this.subscription = this.videoSourcesService.activeSources$
  //     .subscribe(sources => {
  //       this.sourceIds = sources.map(source => source.id!)
  //     });
  // }


  // ngOnDestroy() {
  //   this.subscription.unsubscribe();
  // }
}
