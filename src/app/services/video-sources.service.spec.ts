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
    service = new VideoSourcesService();
  });


  it('should initialise db table with initial values', async () => {
    const initialSourcesNames = initialVideoSources.map(source => source.name);
    initialSourcesInDb.forEach((source) => {
      expect(initialSourcesNames.includes(source.name)).toBeTrue();
    });
  });


  it('should add sources to db with correct order and update observables', async () => {
    let activeSourcesFromObs: VideoSource[];
    let sourcesFromObs: VideoSource[];
    service.activeSources$.subscribe(activeSources => activeSourcesFromObs = activeSources);
    service.sources$.subscribe(sources => sourcesFromObs = sources);

    const mockSource2Id = await service.addCustomSource(mockSource2);
    const mockSource1Id = await service.addCustomSource(mockSource1);
    const mockSource3Id = await service.addCustomSource(mockSource3);
    const sourcesInDb = await db.videoSources.toArray();
    const expectedResult = [
      {...mockSource2, id: mockSource2Id, active: true, order: 2},
      {...mockSource1, id: mockSource1Id, active: true, order: 1},
      {...mockSource3, id: mockSource3Id, active: true, order: 0},
    ]

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
    const mockSource2ForBD = {...mockSource2, active: false, order: 1};
    const ids = await db.videoSources.bulkAdd(
      [
        {...mockSource1, active: true, order: 0},
        mockSource2ForBD,
      ],
      {allKeys: true}
    );
    service = new VideoSourcesService();
    service.activeSources$.subscribe(activeSources => activeSourcesFromObs = activeSources);
    service.sources$.subscribe(sources => sourcesFromObs = sources);

    await service.deleteCustomSource(ids[0]);
    const sourcesInDb = await db.videoSources.toArray();
    const expectedResult = [
      {...mockSource2ForBD, id: ids[1], order: 0},
    ]

    expect(sourcesInDb).toEqual(expectedResult);
    expect(sourcesFromObs!).toEqual(expectedResult);
    expect(activeSourcesFromObs!).toEqual([]);
  });


  it('should change active state of sources correctly', async () => {
    let activeSourcesFromObs: VideoSource[];
    const ids = await db.videoSources.bulkAdd(
      [
        {...mockSource1, active: false, order: 0},
        {...mockSource2, active: false, order: 1},
      ],
      {allKeys: true}
    );
    service = new VideoSourcesService();
    service.activeSources$.subscribe(activeSources => activeSourcesFromObs = activeSources);

    // Test that updating to existing value doesn't throw error
    await service.changeSourceActiveState(ids[0], false);
    await service.changeSourceActiveState(ids[0], true);
    let mockSource1fromDb = await db.videoSources.get(ids[0]);

    expect(mockSource1fromDb?.active).toBeTrue();
    expect(activeSourcesFromObs!).toEqual([mockSource1fromDb!]);


    await service.changeSourceActiveState(ids[1], true);
    let mockSource2fromDb = await db.videoSources.get(ids[1]);
    expect(mockSource2fromDb?.active).toBeTrue();
    expect(activeSourcesFromObs!).toEqual([mockSource1fromDb!, mockSource2fromDb!]);
  });


  it('should reorder sources correctly', async () => {
    let sourcesFromObs: VideoSource[];
    const ids = await db.videoSources.bulkAdd(
      [
        {...mockSource1, active: false, order: 0},
        {...mockSource2, active: false, order: 1},
        {...mockSource3, active: false, order: 2},
      ],
      {allKeys: true}
    );
    service = new VideoSourcesService();
    service.sources$.subscribe(sources => sourcesFromObs = sources);

    await service.reorderSources([
      {id: ids[0], order: 1},
      {id: ids[1], order: 2},
      {id: ids[2], order: 0},
    ]);
    const sourcesInDb = await db.videoSources.toArray();
    const expectedResult = [
      {...mockSource1, id: ids[0], active: false, order: 1},
      {...mockSource2, id: ids[1], active: false, order: 2},
      {...mockSource3, id: ids[2], active: false, order: 0}
    ];
    expect(sourcesInDb).toEqual(expectedResult);
    expect(sourcesFromObs!).toEqual(expectedResult);
  });


  afterAll(() => {
    Dexie.delete(dbName);
  });
});
