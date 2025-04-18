import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FollowService {

  private apiFollow = environment.apiFollow;

  constructor(private httpClient: HttpClient) {}

  getFollowersByUserId(userId: string): Observable<any> {
    return this.httpClient.get(`${this.apiFollow}/followers/${userId}`);
  }

  getFollowingsByUserId(userId: string): Observable<any> {
    return this.httpClient.get(`${this.apiFollow}/following/${userId}`);
  }
}
