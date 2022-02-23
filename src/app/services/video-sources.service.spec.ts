import Dexie from 'dexie';
import { dbName, db } from '../../db/db';
import { initialVideoSources, NewVideoSource, VideoSource } from '../utils/video-source-utils';
import { VideoSourcesService } from './video-sources.service';


describe('VideoSourcesService', () => {
  const mockSource1: NewVideoSource = {name: 'Mock video source'};
  const mockSource2: NewVideoSource = {name: 'Mock video source 2', image: 'fake-image'};
  const mockSource3: NewVideoSource = {name: 'Mock video source 3'};

  let service: VideoSourcesService;
  let initialSourcesInDb: VideoSource[] = [];
  let randomMockSource: NewVideoSource;


  beforeAll(async () => {
    service = new VideoSourcesService();
    initialSourcesInDb = await db.videoSources.toArray();
  });


  beforeEach(async () => {
    const rand = Math.random();
    randomMockSource = rand < 0.3 ? mockSource1 : (rand < 0.6 ? mockSource2 : mockSource3);
    await db.videoSources.clear();
  });


  it('should initialise db table with initial values', async () => {
    const initialSourcesNames = initialVideoSources.map(source => source.name);
    initialSourcesInDb.forEach((source) => {
      expect(initialSourcesNames.includes(source.name)).toBeTrue();
    });
  });


  it('should add sources to db and update observables', async () => {
    let activeSourcesFromObs: VideoSource[];
    let sourcesFromObs: VideoSource[];
    service.sources$.subscribe((sources) => sourcesFromObs = sources);
    service.activeSources$.subscribe(activeSources => activeSourcesFromObs = activeSources);

    const mockSource2Id = await service.addCustomSource(mockSource2);
    const mockSource1Id = await service.addCustomSource(mockSource1);
    const sourcesInDb = await db.videoSources.toArray();
    const expectedResult = [
      {...mockSource2, id: mockSource2Id, active: true, order: 0},
      {...mockSource1, id: mockSource1Id, active: true, order: 1},
    ];

    expect(mockSource2Id).toBeInstanceOf(Number);
    expect(mockSource1Id).toBeInstanceOf(Number);
    expect(sourcesInDb).toEqual(expectedResult);
    expect(sourcesFromObs!).toEqual(expectedResult);
    expect(activeSourcesFromObs!).toEqual(expectedResult);
  });


  it('should throw expected error when adding source with name that matches an existing source', async () => {
    await service.addCustomSource(randomMockSource);
    const sourceWithDuplicateName: NewVideoSource = {name: randomMockSource.name, image: 'test'};
    try {
      await service.addCustomSource(sourceWithDuplicateName);
    } catch(err) {
      expect((err as Error).name).toBe(VideoSourcesService.sourceExistsErrorType);
    }
  });


  it('should remove sources from db and update observables', async () => {
    let activeSourcesFromObs: VideoSource[];
    let sourcesFromObs: VideoSource[];
    service.activeSources$.subscribe(activeSources => activeSourcesFromObs = activeSources);
    service.sources$.subscribe((sources) => sourcesFromObs = sources);

    const ids = await db.videoSources.bulkAdd(
      [
        {...mockSource1, active: true, order: 0},
        {...mockSource2, active: true, order: 1},
        {...mockSource3, active: true, order: 2},
      ],
      {allKeys: true}
    );
    await service.removeCustomSource(ids[0]);
    const sourcesInDb = await db.videoSources.toArray();
    const expectedResult = [
      {...mockSource2, id: ids[1], active: true, order: 0},
      {...mockSource3, id: ids[2], active: true, order: 1},
    ]

    expect(sourcesInDb).toEqual(expectedResult);
    expect(sourcesFromObs!).toEqual(expectedResult);
    expect(activeSourcesFromObs!).toEqual(expectedResult);
  });


  it('should change active state of sources correctly', async () => {
    const randomMockSourceForDb = {...randomMockSource, active: true, order: 0}
    let activeSourcesFromObs: VideoSource[];
    let sourcesFromObs: VideoSource[];
    service.activeSources$.subscribe(activeSources => activeSourcesFromObs = activeSources);
    service.sources$.subscribe(sources => sourcesFromObs = sources);

    const id = await db.videoSources.add(randomMockSourceForDb);
    // Test that updating to existing value doesn't throw error
    await service.changeSourceActiveState(id, true);
    await service.changeSourceActiveState(id, false);
    let mockSourcefromDb = await db.videoSources.get(id);
    expect(mockSourcefromDb?.active).toBeFalse();
    expect(activeSourcesFromObs!).toEqual([]);

    await service.changeSourceActiveState(id, true);
    mockSourcefromDb = await db.videoSources.get(id);
    expect(mockSourcefromDb?.active).toBeTrue();
    expect(activeSourcesFromObs!).toEqual([{...randomMockSourceForDb, id}]);
  });


  afterAll(() => {
    Dexie.delete(dbName);
  });
});
