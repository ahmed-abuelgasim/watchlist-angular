import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoSourcesSettingsComponent } from './video-sources-settings.component';


describe('VideoSourcesSettingsComponent', () => {
  let component: VideoSourcesSettingsComponent;
  let fixture: ComponentFixture<VideoSourcesSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoSourcesSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoSourcesSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
