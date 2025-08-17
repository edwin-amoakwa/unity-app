export interface LoginResponse {
    sessionId: string;
    user: {
      accountName: string;
      emailAddress: string;
      phoneNo: string;
      accountCategory: string;
      merchantName: string;
      merchantId: string;
      id: string;
    };
}

export class UserSession {
  /**
   * Handle successful login response
   * Save the complete data to localStorage and also save merchantId and userId directly
   */
  static login(loginResponse: LoginResponse): void {
    // if (!loginResponse.success || !loginResponse.data) {
    //   throw new Error('Invalid login response');
    // }

    // const { data } = loginResponse;
    const { user } = loginResponse;

    // Save the complete data object to localStorage
    localStorage.setItem('user', JSON.stringify(user));

    // Save merchantId and userId directly to localStorage
    localStorage.setItem('merchantId', user.merchantId);
    localStorage.setItem('userId', user.id);
    localStorage.setItem(this.SessionId, loginResponse.sessionId);
  }

  /**
   * Get user data from localStorage
   */
  static getUserData(): any | null {
    const userData = localStorage.getItem('userData');
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
    return this.getUserData() !== null;
  }

  public static readonly SessionId: string = "sessionId";
  public static readonly UserID: string = "userId";
  public static readonly MerchantId: string = "merchantId";
}
