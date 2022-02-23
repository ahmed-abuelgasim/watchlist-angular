export interface NewVideoSource {
  image?: string,
  name: string,
};


export interface VideoSource extends NewVideoSource {
  id?: number,
  active: boolean,
  order: number,
};


export const sortByName = (a: NewVideoSource | VideoSource, b: NewVideoSource | VideoSource) => {
  return new Intl.Collator().compare(a.name, b.name)
};


export const sortByOrder = (a: VideoSource, b: VideoSource) => a.order - b.order;


export const initialVideoSources: NewVideoSource[] = [
  {name: 'Disney plus'},
  {name: 'Apple TV+'},
  {name: 'Netflix'},
  {name: 'Amazon prime'},
];
