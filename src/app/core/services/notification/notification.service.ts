import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiNotification = environment.apiNotification;

  constructor(private httpClient: HttpClient) {}

  public countUnreadNotifications(idUsuario: string): Observable<any> {
    return this.httpClient.get(`${this.apiNotification}/count/${idUsuario}`);
  }

  public markAsRead(idNotificacion: string): Observable<any> {
    return this.httpClient.put(
      `${this.apiNotification}/read/${idNotificacion}`,
      {}
    );
  }

  public getNotifications(idUsuario: string, page: number = 0, size: number = 5):Observable<any>{
    return this.httpClient.get(
      `${this.apiNotification}/all/${idUsuario}?page=${page}&size=${size}`
    );
  }
}
