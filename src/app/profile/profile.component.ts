// angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// project import
import { CardComponent } from '../theme/shared/components/card/card.component';
import {UserSession} from '../core/user-session';
import {SmsRecordsComponent} from '../sms-records/sms-records.component';
import {SmsChannelPriceComponent} from '../sms-channel-price/sms-channel-price.component';


@Component({
  selector: 'app-account-profile',
  imports: [CardComponent, CommonModule, SmsChannelPriceComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user:any = UserSession.getUser();
  merchant:any = UserSession.getMerchant();

  ngOnInit() {

  }


}
