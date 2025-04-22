import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResponseCommentService {

  private responsecomment = environment.apiResponseComment;
  constructor(private httpClient: HttpClient) {}

  addResponse(dto: FormData): Observable<any> {
    return this.httpClient.post(`${this.responsecomment}/insert`, dto, {
      headers: {
        'enctype': 'multipart/form-data'
      }
    });
  }
  getResponsesByComment(idComentario: string): Observable<any> {
    return this.httpClient.get(`${this.responsecomment}/list/${idComentario}`);
  }
  
}
