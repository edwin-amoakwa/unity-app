import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class StaticDataService {

  constructor(private http: HttpClient) { }

  // public async getProductList()
  // {
  //   return await this.http.get<ApiResponse<any>>(`${environment.baseApi}/account/accounts/list`, {}).toPromise();
  // }


  public static formsOfPayment():any[]
  {
    let data = [
      { id: 'CARD_PAYMENT', itemName: 'Card Payment' },
      { id: 'CASH', itemName: 'Cash' },
      { id: 'MTN_MOBILE_MONEY', itemName: 'MTN Mobile Money' },
      { id: 'AT_CASH', itemName: 'AT Cash' },
      { id: 'VODAFON_CASH', itemName: 'Vodafon Cash' },
      { id: 'BANK_TRANSFER', itemName: 'Bank Transfer' }
    ];

    return data;
  }

  public static accountCategories():any[]
  {
    let data = [
      { id: 'ADMIN', itemName: 'Administrator' },
      { id: 'VIEWER', itemName: 'Viewer' },
      { id: 'ENTERPRISE', itemName: 'Enterprise' }
    ];

    return data;
  }

  public static accountStatuses():any[]
  {
    let data = [
      { id: 'ACTIVE', itemName: 'Active' },
      { id: 'INACTIVE', itemName: 'Inactive' }
    ];

    return data;
  }



  public static groupTypes():any[]
  {
   return [
      { id: 'FREE_FORM', itemName: 'Free Form' },
      { id: 'CONTACT_BASED', itemName: 'Contact Based' },
    ];
  }

  public static smsNature():any[]
  {
   return [
      { id: 'ONE_TIME', itemName: 'Onetime' },
      { id: 'RECURRING', itemName: 'Recurring' },
    ];
  }

  public static PhoneNumbersSources():any[]
  {
   return [
      { id: 'COPY_PASTE', itemName: 'Copy and Paste' },
      { id: 'UPLOADED_FILE', itemName: 'Uploaded File' },
      { id: 'GROUP', itemName: 'Group' },
    ];
  }

}
