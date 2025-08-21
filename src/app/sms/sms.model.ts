export enum SmsNature {
  PROMOTIONAL = 'PROMOTIONAL',
  TRANSACTIONAL = 'TRANSACTIONAL',
  SERVICE_IMPLICIT = 'SERVICE_IMPLICIT',
  SERVICE_EXPLICIT = 'SERVICE_EXPLICIT'
}

export interface SmsModel {
  id?: string;
  applicationId: string;
  senderId: string;
  messageText: string;
  phoneNos: string;
  totalReceipient: number;
  actualCost: number;
  pagesCount: number;
  dispatched: boolean;
  flashSms: boolean;
  scheduleSms: boolean;
  templateSms: boolean;
  smsNature: SmsNature;
  smsNatureName: string;
  scheduledTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApplicationModel {
  id: string;
  name: string;
}

export interface SenderIdModel {
  senderId: string;
  idStatus: string;
  idStatusName: string;
  merchantId: string;
}
