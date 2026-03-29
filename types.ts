export enum Gender {
  Female = 'Female',
  Male = 'Male',
  NonBinary = 'Non-binary',
}

export enum Size {
  XS = 'XS',
  S = 'Small',
  M = 'Medium',
  L = 'Large',
  XL = 'Extra Large',
  XXL = 'Plus Size',
}

export enum Ethnicity {
  Any = 'Diverse',
  Asian = 'Asian',
  Black = 'Black',
  Hispanic = 'Hispanic',
  White = 'White',
  MiddleEastern = 'Middle Eastern',
}

export interface ModelSettings {
  gender: Gender;
  size: Size;
  ethnicity: Ethnicity;
  vibe: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export enum AppMode {
  TryOn = 'TRY_ON',
  Generator = 'GENERATOR',
}