import {ObjectUtil} from './system.utils';


export class UserSession {
  /**
   * Handle successful login response
   * Save the complete data to localStorage and also save merchantId and userId directly
   */
  static login(loginResponse: any): void {
    // if (!loginResponse.success || !loginResponse.data) {
    //   throw new Error('Invalid login response');
    // }

    // const { data } = loginResponse;
    const { user } = loginResponse;
    const { merchant } = loginResponse;

    // Save the complete data object to localStorage
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem(UserSession.merchant, JSON.stringify(merchant));

    // Save merchantId and userId directly to localStorage
    localStorage.setItem('merchantId', user.merchantId);
    localStorage.setItem('userId', user.id);
    localStorage.setItem(this.SessionId, loginResponse.sessionId);
  }

  /**
   * Get user data from localStorage
   */
  static getUser(): any | null {
    return this.getAsJson(UserSession.User);
  }

  static getMerchant(): any | null {
    return this.getAsJson(UserSession.merchant);
  }

  static getAsJson(key): any | null {
    const userData = localStorage.getItem(key);
    if (!userData) {
      return null
    }

    if(ObjectUtil.noValue(userData))
    {
      return null;
    }
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Get merchant ID from localStorage
   */
  static getMerchantId(): string | null {
    return localStorage.getItem('merchantId');
  }

  /**
   * Get user ID from localStorage
   */
  static getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  /**
   * Clear all session data
   */
  static logout(): void {
    localStorage.clear();
  }

  /**
   * Check if user is logged in
   */
  static isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  public static readonly SessionId: string = "sessionId";
  public static readonly UserID: string = "userId";
  public static readonly MerchantId: string = "merchantId";
  public static readonly User: string = "user";
  public static readonly merchant: string = "merchant";
}
