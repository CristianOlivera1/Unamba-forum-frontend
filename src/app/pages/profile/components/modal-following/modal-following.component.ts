import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-following',
  imports: [CommonModule],
  templateUrl: './modal-following.component.html',
  styleUrl: './modal-following.component.css'
})
export class ModalFollowingComponent {
  @Input() followings: any[] = [];
  @Output() close = new EventEmitter<void>(); 
  constructor( private router:Router){}

  closeModal(): void {
    this.close.emit();
  }

  navigateToProfileUser(idSeguido: string) {
    this.router.navigate(['/profile', idSeguido]);
    this.close.emit();
  }
}
