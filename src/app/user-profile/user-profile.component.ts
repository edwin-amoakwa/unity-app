// angular import
import { Component, OnInit } from '@angular/core';

// project import
import { CardComponent } from '../theme/shared/components/card/card.component';
import { UserSession } from '../core/user-session';
import { SmsRecordsComponent } from '../sms-records/sms-records.component';
import { SmsChannelPriceComponent } from '../sms-channel-price/sms-channel-price.component';

import { PageHeaderComponent } from '../theme/shared/components/page-header/page-header.component';
@Component({
  selector: 'app-account-profile',
  imports: [PageHeaderComponent, CardComponent, SmsChannelPriceComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  user: any = UserSession.getUser();
  merchant: any = UserSession.getMerchant();

  ngOnInit() {}
}
