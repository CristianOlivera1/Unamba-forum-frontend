import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CareerService {

  private apiCareer = environment.apiCareer;
  constructor(private httpClient: HttpClient) { }
  public getAllCareer(): Observable<any> {
		return this.httpClient.get(`${this.apiCareer}/getall`);
	}

  getCareerById(idCarrera: string): Observable<any> {
    return this.httpClient.get(`${this.apiCareer}/${idCarrera}`);
  }

}
