
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

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  public decodeToken(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  public getUserId(): string | null {
    const decodedToken = this.decodeToken();
    return decodedToken?.idUsuario || null;
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
