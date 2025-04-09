
import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';

const TOKEN_KEY = 'AuthToken';
@Injectable({
  providedIn: 'root'
})
export class TokenService  {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  public getToken(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(TOKEN_KEY) || '';
    }
    return '';
  }

  public setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  public logOut(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.clear();
    }
  }
}
