import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiCategory = environment.apiCategory;
  constructor(private httpClient: HttpClient) { }

  public getAllCategory(): Observable<any> {
		return this.httpClient.get(`${this.apiCategory}/getall`);
	}

}
