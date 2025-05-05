import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  private apiNotes = environment.apiNotes;
  constructor(private httpClient: HttpClient) { }
  
  public createNote(request: FormData): Observable<any> {
    return this.httpClient.post(`${this.apiNotes}/insert`, request, {
      headers: {
        'enctype': 'multipart/form-data'
      }
    });
  }
  public getNotesByCareer(idCarrera: string): Observable<any> {
    return this.httpClient.get(`${this.apiNotes}/career/${idCarrera}`);
  }

  public deleteNoteById(idNota: string): Observable<any> {
    return this.httpClient.delete(`${this.apiNotes}/delete/${idNota}`);
  }

}
