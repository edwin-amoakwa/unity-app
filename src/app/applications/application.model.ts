export enum ApplicationType {
  SMS = 'SMS'
}

export interface ApplicationModel {
  id?: string;
  appName: string;
  apiKey: string;
  currentPrice: number;
  applicationType: ApplicationType | null;
  applicationTypeName: string;
  createdAt?: Date;
  updatedAt?: Date;
}
