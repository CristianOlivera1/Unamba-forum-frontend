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

  updateProfile(formData: FormData): Observable<any> {
    const headers = new HttpHeaders();
    return this.httpClient.put(`${this.apiProfile}/update`, formData, { headers });
  }

  getUserProfileHover(userId: string): Observable<any> {
    return this.httpClient.get(`${this.apiProfile}/hover/${userId}`);
  }

  getUserProfileDetail(userId: string): Observable<any> {
    return this.httpClient.get(`${this.apiProfile}/detail/${userId}`);
  }
  
  
}
