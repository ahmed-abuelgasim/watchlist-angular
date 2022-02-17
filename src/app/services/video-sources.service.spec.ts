import { db } from '../../db/db';
import { ActiveEnum, AddFailureEnum, RemoveEnum, VideoSource, NewVideoSource, VideoSourcesService } from './video-sources.service';

describe('VideoSourcesService', () => {
  const newMockSource1: NewVideoSource = {name: 'Mock video source'};
  const mockSource1: VideoSource = {...newMockSource1, active: true};
  const newMockSource2: NewVideoSource = {name: 'Mock video source 2', image: 'fake-image'};
  const mockSource2: VideoSource = {...newMockSource2, active: true};

  let service: VideoSourcesService;
  let randomMockSource: VideoSource;
  let randomNewMockSource: NewVideoSource;

  beforeEach(async () => {
    service = new VideoSourcesService();
    const rand = Math.random();
    randomNewMockSource = rand < 0.5 ? newMockSource1 : newMockSource2;
    randomMockSource = rand < 0.5 ? mockSource1 : mockSource2;
    await db.videoSources.clear();
  });


  it('should add sources to db', async () => {
    const id = await service.addCustomSource(randomNewMockSource);
    expect(id).toBeInstanceOf(Number);
    const mockSourcefromDb = await db.videoSources.get(id as number);
    expect(mockSourcefromDb).toEqual({...randomMockSource, id: id as number});
  });


  it('should remove sources from db', async () => {
    const id = await db.videoSources.add(randomMockSource);
    let response = await service.removeCustomSource(id);
    expect(response).toEqual(RemoveEnum.Succeeded);
    const mockSourcefromDb = await db.videoSources.get(id);
    expect(mockSourcefromDb).toBeUndefined();
  });


  it('should catch error when adding existing video source and respond with correct enum value', async () => {
    await service.addCustomSource(randomNewMockSource);
    const response = await service.addCustomSource(randomNewMockSource);
    expect(response).toEqual(AddFailureEnum.SourceExists);
  });


  it('should emit updated sources on observable when sources added', async () => {
    const mockSource2Id = await service.addCustomSource(newMockSource2) as number;
    const mockSource1Id = await service.addCustomSource(newMockSource1) as number;

    let sourcesFromObs: VideoSource[] | undefined;
    service.sources$.subscribe((sources) => {
      sourcesFromObs = sources;
    });
    expect(sourcesFromObs).toEqual([{...mockSource1, id: mockSource1Id}, {...mockSource2, id: mockSource2Id}]);
  });

  it('should emit updated sources on observable when sources removed', async () => {
    const randomMockSourceId = await service.addCustomSource(randomNewMockSource) as number;
    await service.removeCustomSource(randomMockSourceId);
    let sourcesFromObs: VideoSource[] | undefined;
    service.sources$.subscribe((sources) => {
      sourcesFromObs = sources;
    });
    expect(sourcesFromObs).toEqual([]);
  });


  it('should change active state of sources correctly', async () => {
    const id = await db.videoSources.add(randomMockSource);
    let response = await service.changeSourceActiveState(id, false);
    expect(response).toEqual(ActiveEnum.Deactivated);
    response = await service.changeSourceActiveState(id, false);
    expect(response).toEqual(ActiveEnum.Deactivated);

    // Test all sources observable
    let sourcesFromObs: VideoSource[] | undefined;
    service.sources$.subscribe(sources => sourcesFromObs = sources);
    expect(sourcesFromObs).toEqual([{...randomMockSource, active: false}]);

    // Test active sources observable
    let activeSourcesFromObs: VideoSource[] | undefined;
    service.activeSources$.subscribe(activeSources => activeSourcesFromObs = activeSources);
    expect(activeSourcesFromObs).toEqual([]);

    response = await service.changeSourceActiveState(id, true);
    expect(response).toEqual(ActiveEnum.Activated);
    response = await service.changeSourceActiveState(id, true);
    expect(response).toEqual(ActiveEnum.Activated);

    // Test active sources observable
    let activeSourcesFromObs2ndSubscription: VideoSource[] | undefined;
    service.activeSources$.subscribe(activeSources => activeSourcesFromObs2ndSubscription = activeSources);
    expect(activeSourcesFromObs2ndSubscription).toEqual([randomMockSource]);
  });
});
