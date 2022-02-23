export interface NewVideoSource {
  image?: string,
  name: string,
  order?: number,
};


export interface VideoSource extends NewVideoSource {
  id?: number,
  active: boolean,
};


export const sortByName = (a: VideoSource, b: VideoSource) => {
  return new Intl.Collator().compare(a.name, b.name)
};


export const initialVideoSources: VideoSource[] = [
  {
    active: false,
    name: 'Disney plus',
  },
  {
    active: false,
    name: 'Apple TV+',
  },
  {
    active: false,
    name: 'Netflix',
  },
  {
    active: false,
    name: 'Amazon prime',
  },
];
