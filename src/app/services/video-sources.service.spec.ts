import { db } from '../../db/db';
import { VideoSource, NewVideoSource, VideoSourcesService } from './video-sources.service';

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
    await service.removeCustomSource(id);
    const mockSourcefromDb = await db.videoSources.get(id);
    expect(mockSourcefromDb).toBeUndefined();
  });


  it('should catch errors when adding existing video source and respond with correct enum value', async () => {
    try {
      await service.addCustomSource(randomNewMockSource);
      await service.addCustomSource(randomNewMockSource);
    } catch(err) {
      console.log((err as Error).message);
      expect((err as Error).name).toBe(VideoSourcesService.sourceExistsErrorType);
    }
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
    const idAsNumber = id as number;

    // Test that updating to existing value doesn't cause error
    await service.changeSourceActiveState(id, true);

    await service.changeSourceActiveState(id, false);
    let mockSourcefromDb = await db.videoSources.get(idAsNumber);
    expect(mockSourcefromDb?.active).toBeFalse();

    // Test all sources observable updates
    let sourcesFromObs: VideoSource[] | undefined;
    service.sources$.subscribe(sources => sourcesFromObs = sources);
    expect(sourcesFromObs).toEqual([{...randomMockSource, active: false}]);

    // Test active sources observable updates
    let activeSourcesFromObs: VideoSource[] | undefined;
    service.activeSources$.subscribe(activeSources => activeSourcesFromObs = activeSources);
    expect(activeSourcesFromObs).toEqual([]);

    await service.changeSourceActiveState(id, true);
    mockSourcefromDb = await db.videoSources.get(idAsNumber);
    expect(mockSourcefromDb?.active).toBeTrue();
  });
});
