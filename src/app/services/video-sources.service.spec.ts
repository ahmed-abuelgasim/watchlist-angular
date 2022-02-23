import Dexie from 'dexie';
import { dbName, db } from '../../db/db';
import { initialVideoSources, NewVideoSource, VideoSource } from '../utils/video-source-utils';
import { VideoSourcesService } from './video-sources.service';


describe('VideoSourcesService', () => {
  const newMockSource1: NewVideoSource = {name: 'Mock video source'};
  const mockSource1: VideoSource = {...newMockSource1, active: true};
  const newMockSource2: NewVideoSource = {name: 'Mock video source 2', image: 'fake-image'};
  const mockSource2: VideoSource = {...newMockSource2, active: true};

  let service: VideoSourcesService;
  let initialSourcesInDb: VideoSource[] = [];
  let randomMockSource: VideoSource;
  let randomNewMockSource: NewVideoSource;


  beforeAll(async () => {
    service = new VideoSourcesService();
    initialSourcesInDb = await db.videoSources.toArray();
  });


  beforeEach(async () => {
    const rand = Math.random();
    randomNewMockSource = rand < 0.5 ? newMockSource1 : newMockSource2;
    randomMockSource = rand < 0.5 ? mockSource1 : mockSource2;
    await db.videoSources.clear();
  });


  it('should initialise db table with initial values', async () => {
    const initialSourcesNames = initialVideoSources.map((source: VideoSource) => source.name);
    initialSourcesInDb.forEach((source) => {
      expect(initialSourcesNames.includes(source.name)).toBeTrue();
    });
  });


  it('should add a source to db', async () => {
    const id = await service.addCustomSource(randomNewMockSource);
    expect(id).toBeInstanceOf(Number);

    const mockSourcefromDb = await db.videoSources.get(id as number);
    const expectedResult: VideoSource = {...randomMockSource, id: id};
    expect(mockSourcefromDb).toEqual(expectedResult);
  });


  it('should throw expected error when adding source with name that matches an existing source', async () => {
    await service.addCustomSource(randomNewMockSource);
    const sourceWithDuplicateName: NewVideoSource = {name: randomNewMockSource.name, image: 'test'};
    try {
      await service.addCustomSource(sourceWithDuplicateName);
    } catch(err) {
      expect((err as Error).name).toBe(VideoSourcesService.sourceExistsErrorType);
    }
  });


  it('should remove a source from db', async () => {
    const id = await db.videoSources.add(randomMockSource);
    const response = await service.removeCustomSource(id);
    expect(response).toBeUndefined();

    const mockSourcefromDb = await db.videoSources.get(id);
    expect(mockSourcefromDb).toBeUndefined();
  });


  it('should emit updated sources on observable when source added', async () => {
    let sourcesFromObs: VideoSource[];
    service.sources$.subscribe((sources) => sourcesFromObs = sources);

    const mockSource2Id = await service.addCustomSource(newMockSource2) as number;
    const mockSource1Id = await service.addCustomSource(newMockSource1) as number;
    expect(sourcesFromObs!).toEqual([{...mockSource2, id: mockSource2Id}, {...mockSource1, id: mockSource1Id}]);
  });


  it('should emit updated sources on observable when sources removed', async () => {
    let sourcesFromObs: VideoSource[];
    service.sources$.subscribe((sources) => sourcesFromObs = sources);

    const mockSource2Id = await service.addCustomSource(newMockSource2) as number;
    const mockSource1Id = await service.addCustomSource(newMockSource1) as number;
    await service.removeCustomSource(mockSource1Id);

    expect(sourcesFromObs!).toEqual([{...mockSource2, id: mockSource2Id}]);
  });


  it('should change active state of sources correctly', async () => {
    let activeSourcesFromObs: VideoSource[];
    let sourcesFromObs: VideoSource[];
    service.sources$.subscribe(sources => sourcesFromObs = sources);
    service.activeSources$.subscribe(activeSources => activeSourcesFromObs = activeSources);

    const id = await db.videoSources.add(randomMockSource);
    // Test that updating to existing value doesn't throw error
    await service.changeSourceActiveState(id, true);

    await service.changeSourceActiveState(id, false);
    let mockSourcefromDb = await db.videoSources.get(id as number);
    expect(mockSourcefromDb?.active).toBeFalse();
    expect(sourcesFromObs!).toEqual([{...randomMockSource, active: false}]);
    expect(activeSourcesFromObs!).toEqual([]);

    await service.changeSourceActiveState(id, true);
    mockSourcefromDb = await db.videoSources.get(id as number);
    expect(mockSourcefromDb?.active).toBeTrue();
    expect(sourcesFromObs!).toEqual([{...randomMockSource, active: true}]);
    expect(activeSourcesFromObs!).toEqual([randomMockSource]);
  });


  afterAll(() => {
    Dexie.delete(dbName);
  });
});
