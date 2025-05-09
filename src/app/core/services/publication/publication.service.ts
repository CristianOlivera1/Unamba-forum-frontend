import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {

  private apiPublication = environment.apiPublication;

  constructor(private httpClient: HttpClient) { }

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

  public insertPublication(formData: FormData): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.httpClient.post(`${this.apiPublication}/insert`, formData, { headers });
  }

  public deletePublication(idPublication: string): Observable<any> {
    return this.httpClient.delete(`${this.apiPublication}/delete/${idPublication}`);
  }

  public getRelatedPublications(idPublication: string, page: number = 0, size: number = 6): Observable<any> {
    return this.httpClient.get(`${this.apiPublication}/related/${idPublication}?page=${page}&size=${size}`);
  }

  public fixPublication(dtoFixPublication: any): Observable<any> {
    return this.httpClient.put(`${this.apiPublication}/fix`, dtoFixPublication);
  }

  public updatePublication(formData: FormData): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.httpClient.put(`${this.apiPublication}/update`, formData, { headers });
  }

  public getPublicationsWithoutFilesByCareerPaginated(idCarrera: string, page: number = 0): Observable<any> {
    return this.httpClient.get(`${this.apiPublication}/withoutfiles/career/paginated/${idCarrera}`, {
      params: { page: page.toString() }
    });
  }

  public getPublicationsWithFilesByCareerPaginated(idCarrera: string, page: number = 0): Observable<any> {
    return this.httpClient.get(`${this.apiPublication}/withfiles/career/paginated/${idCarrera}`, {
      params: { page: page.toString() }
    });
  }
}
