export interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    user: {
      accountName: string;
      emailAddress: string;
      phoneNo: string;
      accountCategory: string;
      merchantName: string;
      merchantId: string;
      id: string;
    };
  };
}

export class UserSession {
  /**
   * Handle successful login response
   * Save the complete data to localStorage and also save merchantId and userId directly
   */
  static login(loginResponse: LoginResponse): void {
    if (!loginResponse.success || !loginResponse.data) {
      throw new Error('Invalid login response');
    }

    const { data } = loginResponse;
    const { user } = data;

    // Save the complete data object to localStorage
    localStorage.setItem('userData', JSON.stringify(data));

    // Save merchantId and userId directly to localStorage
    localStorage.setItem('merchantId', user.merchantId);
    localStorage.setItem('userId', user.id);
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
    localStorage.removeItem('userData');
    localStorage.removeItem('merchantId');
    localStorage.removeItem('userId');
  }

  /**
   * Check if user is logged in
   */
  static isLoggedIn(): boolean {
    return this.getUserData() !== null;
  }
}
