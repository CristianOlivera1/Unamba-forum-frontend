
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
const cabecera = {headers: new HttpHeaders({'Content-Type' : 'application/json'})};

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService  {
  private oauthURL = environment.oauthURL;
  private clientId = environment.clientId;
  private redirectUri = environment.redirectUri;
  private scope = environment.scope;
  private responseType = 'token id_token';

  constructor(private http: HttpClient) {}

  loginWithGoogle(): void {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=${this.responseType}&scope=${this.scope}`;
    window.location.href = authUrl;
  }

  handleGoogleCallback(): { idToken: string | null; accessToken: string | null } {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const idToken = urlParams.get('id_token');
    const accessToken = urlParams.get('access_token');
    return { idToken, accessToken };
  }

  registerWithGoogle(idToken: string, accessToken: string): Observable<any> {
    const payload = {
      idTokenString: idToken,
      accessToken: accessToken
    };
    return this.http.post(this.oauthURL, payload);
  }
}
