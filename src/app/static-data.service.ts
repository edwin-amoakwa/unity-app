import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from 'src/app/core/ApiResponse';
import { environment } from 'src/environments/environment';


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
      { id: 'TIGO_CASH', itemName: 'Tigo Cash' },
      { id: 'VODAFON_CASH', itemName: 'Vodafon Cash' },
      { id: 'AIRTEL_MONEY', itemName: 'Airtel Money' },
      { id: 'BANK_TRANSFER', itemName: 'Bank Transfer' }
    ];

    return data;
  }

  public static accountCategories():any[]
  {
    let data = [
      { id: 'INDIVIDUAL', itemName: 'Individual' },
      { id: 'BUSINESS', itemName: 'Business' },
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

  public static userCategories():any[]
  {
    let data = [
      { id: 'ADMIN', itemName: 'Admin' },
      { id: 'USER', itemName: 'User' }
    ];

    return data;
  }

}
