import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {

  private apiPublication = environment.apiPublication;

  constructor(private httpClient: HttpClient) {}

  public getAllPublicationwithFile(): Observable<any> {
		return this.httpClient.get(`${this.apiPublication}/getall`);
	}

  public getAllPublicationwithoutFile(): Observable<any> {
		return this.httpClient.get(`${this.apiPublication}/getall`);
	}

  getProfileByUserId(userId: string): Observable<any> {
    return this.httpClient.get(`${this.apiPublication}/getprofilebyuser/${userId}`);
  }
  
}
