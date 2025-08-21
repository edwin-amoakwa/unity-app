import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SmsModel, ApplicationModel, SenderIdModel, SmsNature } from './sms.model';

@Injectable({
  providedIn: 'root'
})
export class SmsService {
  private apiUrl = '/api/sms';

  constructor(private http: HttpClient) {}

  getSmsMessages(): Observable<{ data: SmsModel[] }> {
    // Mock data for now - replace with actual API call
    const mockData: SmsModel[] = [
      {
        id: '1',
        applicationId: 'APP001',
        senderId: 'SENDER001',
        messageText: 'Welcome to our service! Your account has been created successfully.',
        phoneNos: '+1234567890,+0987654321',
        totalReceipient: 2,
        actualCost: 0.05,
        pagesCount: 1,
        dispatched: true,
        flashSms: false,
        scheduleSms: false,
        templateSms: false,
        smsNature: SmsNature.TRANSACTIONAL,
        smsNatureName: 'Transactional',
        createdAt: new Date('2025-01-15T10:30:00')
      },
      {
        id: '2',
        applicationId: 'APP002',
        senderId: 'SENDER002',
        messageText: 'Special offer! Get 50% off on all products. Visit our store now and grab amazing deals on electronics, clothing, and home appliances.',
        phoneNos: '+1111111111,+2222222222,+3333333333',
        totalReceipient: 3,
        actualCost: 0.15,
        pagesCount: 2,
        dispatched: false,
        flashSms: true,
        scheduleSms: true,
        templateSms: true,
        smsNature: SmsNature.PROMOTIONAL,
        smsNatureName: 'Promotional',
        scheduledTime: new Date('2025-01-20T14:00:00'),
        createdAt: new Date('2025-01-16T09:15:00')
      }
    ];
    return of({ data: mockData });
  }

  createSmsMessage(sms: Partial<SmsModel>): Observable<{ data: SmsModel }> {
    // Calculate pages count based on message text length
    const pagesCount = Math.ceil(sms.messageText ? sms.messageText.length / 160 : 1);

    const newSms: SmsModel = {
      id: Date.now().toString(),
      applicationId: sms.applicationId || '',
      senderId: sms.senderId || '',
      messageText: sms.messageText || '',
      phoneNos: sms.phoneNos || '',
      totalReceipient: sms.totalReceipient || 0,
      actualCost: sms.actualCost || 0,
      pagesCount: pagesCount,
      dispatched: sms.dispatched || false,
      flashSms: sms.flashSms || false,
      scheduleSms: sms.scheduleSms || false,
      templateSms: sms.templateSms || false,
      smsNature: sms.smsNature || SmsNature.TRANSACTIONAL,
      smsNatureName: sms.smsNatureName || 'Transactional',
      scheduledTime: sms.scheduledTime,
      createdAt: new Date()
    };

    // Mock API response - replace with actual API call
    return of({ data: newSms });
  }

  updateSmsMessage(id: string, sms: Partial<SmsModel>): Observable<{ data: SmsModel }> {
    // Calculate pages count if message text is updated
    if (sms.messageText) {
      sms.pagesCount = Math.ceil(sms.messageText.length / 160);
    }

    // Mock API response - replace with actual API call
    const updatedSms = { ...sms, id, updatedAt: new Date() } as SmsModel;
    return of({ data: updatedSms });
  }

  deleteSmsMessage(id: string): Observable<{ success: boolean }> {
    // Mock API response - replace with actual API call
    return of({ success: true });
  }

  getApplications(): Observable<{ data: ApplicationModel[] }> {
    // Mock data - replace with actual API call
    const mockApplications: ApplicationModel[] = [
      { id: 'APP001', name: 'Main Application' },
      { id: 'APP002', name: 'Marketing App' },
      { id: 'APP003', name: 'Customer Service' },
      { id: 'APP004', name: 'E-commerce Platform' }
    ];
    return of({ data: mockApplications });
  }

  getSenderIds(): Observable<{ data: SenderIdModel[] }> {
    // Mock data - replace with actual API call
    const mockSenderIds: SenderIdModel[] = [
      { senderId: 'SENDER001', idStatus: 'ACTIVE', idStatusName: 'Active', merchantId: 'MERCHANT001' },
      { senderId: 'SENDER002', idStatus: 'ACTIVE', idStatusName: 'Active', merchantId: 'MERCHANT002' },
      { senderId: 'SENDER003', idStatus: 'PENDING', idStatusName: 'Pending', merchantId: 'MERCHANT003' },
      { senderId: 'SENDER004', idStatus: 'ACTIVE', idStatusName: 'Active', merchantId: 'MERCHANT004' }
    ];
    return of({ data: mockSenderIds });
  }

  calculatePagesCount(messageText: string): number {
    return Math.ceil(messageText.length / 160);
  }
}
