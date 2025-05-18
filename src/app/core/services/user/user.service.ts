import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUser = environment.apiUser;
  constructor(private httpClient: HttpClient) { }

  getSuggestedUsers(userId: string, count: number = 5): Observable<any> {
    const url = `${this.apiUser}/suggested/${userId}?count=${count}`;
    return this.httpClient.get<any>(url);
  }

  updateUserPassword(formData: FormData): Observable<any> {
    const url = `${this.apiUser}/update`;
    return this.httpClient.put<any>(url, formData);
  }
  
}
