import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalInfoCompleteService {
  private completeInfoModalVisible = new BehaviorSubject<boolean>(false);
  isInfoCompleteModalVisible$ = this.completeInfoModalVisible.asObservable();

  showInfoCompleteModal(): void {
    this.completeInfoModalVisible.next(true);
  }

  hideInfoCompleteModal(): void {
    this.completeInfoModalVisible.next(false);
  }
}