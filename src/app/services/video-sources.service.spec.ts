import { db } from '../../db/db';
import { ActiveEnum, AddFailureEnum, RemoveEnum, VideoSource, VideoSourcesService } from './video-sources.service';

describe('VideoSourcesService', () => {
  let service: VideoSourcesService;
  let randomMockSource: VideoSource;

  const mockSource1: VideoSource = {
    name: 'Mock video source',
    active: false,
  }

  const mockSource2: VideoSource = {
    name: 'Mock video source 2',
    active: false,
  }

  beforeEach(async () => {
    service = new VideoSourcesService();
    randomMockSource = Math.random() < 0.5 ? mockSource1 : mockSource2;
    await db.videoSources.clear();
  });


  it('should add sources to db', async () => {
    const id = await service.addCustomSource(randomMockSource);
    expect(id).toBeInstanceOf(Number);
    const mockSourcefromDb = await db.videoSources.get(id as number);
    expect(mockSourcefromDb).toEqual(randomMockSource);
  });


  it('should remove sources from db', async () => {
    const id = await db.videoSources.add(randomMockSource);
    let response = await service.removeCustomSource(id);
    expect(response).toEqual(RemoveEnum.Succeeded);
    const mockSourcefromDb = await db.videoSources.get(id);
    expect(mockSourcefromDb).toBeUndefined();
  });


  it('should emit updated sources on observable when sources added', async () => {
    await service.addCustomSource(mockSource2);
    await service.addCustomSource(mockSource1);

    let obsReturnedSources: VideoSource[] | undefined;
    service.sources$.subscribe((sources) => {
      obsReturnedSources = sources;
    });
    expect(obsReturnedSources).toEqual([mockSource1, mockSource2]);
  });


  it('should catch error when adding existing video source and respond with correct enum value', async () => {
    await service.addCustomSource(randomMockSource);
    const response = await service.addCustomSource(randomMockSource);
    expect(response).toEqual(AddFailureEnum.SourceExists);
  });


  it('should activate and deactivate sources correctly', async () => {
    const id = await db.videoSources.add(randomMockSource);
    let response = await service.changeSourceActiveState(id, true);
    expect(response).toEqual(ActiveEnum.Activated);
    response = await service.changeSourceActiveState(id, false);
    expect(response).toEqual(ActiveEnum.Deactivated);
  });
});
