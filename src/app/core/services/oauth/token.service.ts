
import { Injectable } from '@angular/core';

const TOKEN_KEY = 'AuthToken';
@Injectable({
  providedIn: 'root'
})
export class TokenService  {
  constructor() { }

  public getToken(): string {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY) || '';
    }
    return '';
  }

  public setToken(token: string): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
  }
  logOut(): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.clear();
  }
}
