import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReactionPublicationService {

  private apiReactionPublication = environment.apiReactionPublication;

  constructor(private httpClient: HttpClient) {}
  addReaction(dtoReaction: any): Observable<any> {
    const url = `${this.apiReactionPublication}/insert`;
    const formData = new FormData();
    formData.append('idUsuario', dtoReaction.idUsuario);
    formData.append('idPublicacion', dtoReaction.idPublicacion);
    formData.append('tipo', dtoReaction.tipo);
  
    return this.httpClient.post<any>(url, formData);
  }

  removeReaction(idUsuario: string, idPublicacion: string): Observable<any> {
    const url = `${this.apiReactionPublication}/delete`;
    const params = { idUsuario, idPublicacion };
    return this.httpClient.delete<any>(url, { params });
  }

  /*Cargar las reacciones del usuario logueado a todas las publicaciones */
  getReaction(idUsuario: string, idPublicacion: string): Observable<any> {
    const url = `${this.apiReactionPublication}/get`;
    const params = { idUsuario, idPublicacion };
    return this.httpClient.get<any>(url, { params });
  }

  updateReaction(idUsuario: string, idPublicacion: string, nuevoTipo: string): Observable<any> {
    const url = `${this.apiReactionPublication}/update`;
    const params = { idUsuario, idPublicacion, nuevoTipo };
    return this.httpClient.put<any>(url, null, { params });
  }

  getReactionAndCommentSummary(idPublicacion: string): Observable<any> {
    const url = `${this.apiReactionPublication}/reactioncommentsummary`;
    const params = { idPublicacion };
    return this.httpClient.get<any>(url, { params });
  }

  getUsersByReactionType(idPublicacion: string, tipo: string): Observable<any> {
    const url = `${this.apiReactionPublication}/reactionuser`;
    const params = { idPublicacion, tipo };
    return this.httpClient.get<any>(url, { params });
  }
}
