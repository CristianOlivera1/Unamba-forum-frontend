import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiProfile = environment.apiProfile;

  constructor(private httpClient: HttpClient) {}

  getProfileByUserId(userId: string): Observable<any> {
    return this.httpClient.get(`${this.apiProfile}/getprofilebyuser/${userId}`);
  }
}
