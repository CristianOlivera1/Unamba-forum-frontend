import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentPublicationService {

  private apiCommentPublication = environment.apiCommentPublication;

  constructor(private httpClient: HttpClient) {}
  getUsersWhoCommented(idPublication: string): Observable<any> {
    return this.httpClient.get(`${this.apiCommentPublication}/users/${idPublication}`);
  }
}
