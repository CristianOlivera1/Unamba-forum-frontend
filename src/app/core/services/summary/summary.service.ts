import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {

  private apiSummary = environment.apiSummary;
  constructor(private httpClient: HttpClient) { }
  public getTotalCareerPublicationUser(): Observable<any> {
		return this.httpClient.get(`${this.apiSummary}`);
	}

  
}
