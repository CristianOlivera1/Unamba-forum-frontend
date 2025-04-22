import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReactionCommentAndResponse {

  private apiReactionCommentAndResponse = environment.apiReactionCommentAndResponse;

  constructor(private httpClient: HttpClient) {}

  addReactionToCommentOrResponse(dtoReaction: any): Observable<any> {
    const url = `${this.apiReactionCommentAndResponse}/insert`;
    const formData = new FormData();
    formData.append('idUsuario', dtoReaction.idUsuario);
    formData.append('idComentario', dtoReaction.idComentario || '');
    if (dtoReaction.idRespuesta) {
      formData.append('idRespuesta', dtoReaction.idRespuesta);
    }
    formData.append('tipo', dtoReaction.tipo);
  
    return this.httpClient.post<any>(url, formData);
  }
  updateReactionCommentOrResponse(
    idReaccion: string,
    dtoReaction: { idUsuario: string; idComentario?: string; idRespuesta?: string; nuevoTipo: string }
  ): Observable<any> {
    const url = `${this.apiReactionCommentAndResponse}/update`;
    const params = {
      idUsuario: dtoReaction.idUsuario,
      idComentario: dtoReaction.idComentario || '',
      idRespuesta: dtoReaction.idRespuesta || '',
      nuevoTipo: dtoReaction.nuevoTipo,
    };
    return this.httpClient.put<any>(url, null, { params });
  }

  removeReactionCommentOrResponse(idReaction: string): Observable<any> {
    const url = `${this.apiReactionCommentAndResponse}/remove/${idReaction}`;
    return this.httpClient.delete<any>(url);
  }
  
  getUserReactionsToComments(idUsuario: string, idPublicacion: string): Observable<any> {
    const url = `${this.apiReactionCommentAndResponse}/userreactions`;
    const params = { idUsuario, idPublicacion };
    return this.httpClient.get<any>(url, { params });
  }
}
