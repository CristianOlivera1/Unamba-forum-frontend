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

  public getPublicationsWithFilesPaginated(page: number = 0): Observable<any> {
    return this.httpClient.get(`${this.apiPublication}/withfiles/paginated?page=${page}`);
  }

  public getAllPublicationwithoutFile(): Observable<any> {
		return this.httpClient.get(`${this.apiPublication}/withoutfiles/paginated`);
	}
  
  getPublicationById(idPublication: string): Observable<any> {
    return this.httpClient.get(`${this.apiPublication}/details/${idPublication}`);
  }
  getPublicationUser(idUser: string, page: number = 0): Observable<any> {
    return this.httpClient.get(`${this.apiPublication}/user/${idUser}?page=${page}`);
  }
}
