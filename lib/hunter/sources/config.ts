export type SourceType =
  | "RSS"
  | "API"
  | "OFFICIAL";

export type SourceConfig = {
  name: string;
  type: SourceType;
  url: string;
  category: string;
  enabled: boolean;
};

export const trialSources: SourceConfig[] = [
  // Real sources will be added here.
];

export const dealSources: SourceConfig[] = [
  // Real deal sources will be added here.
];