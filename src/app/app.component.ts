import { Component } from '@angular/core';
import { StreamingServicesService } from './services/streaming-services.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  userStreamingServices$ = this.streamingServicesService.userStreamingServices$;

  constructor(public streamingServicesService: StreamingServicesService) {}

  addService() {
    this.streamingServicesService.updateUserStreamingServices(['netflix']);
  }
}
