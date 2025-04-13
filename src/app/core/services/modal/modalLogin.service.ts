import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalLoginService {
  private loginModalVisible = new BehaviorSubject<boolean>(false);

  isLoginModalVisible$ = this.loginModalVisible.asObservable();

  showLoginModal(): void {
    this.loginModalVisible.next(true);
  }

  hideLoginModal(): void {
    this.loginModalVisible.next(false);
  }
}