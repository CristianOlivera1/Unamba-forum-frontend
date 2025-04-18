import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-follower',
  imports: [CommonModule],
  templateUrl: './modal-follower.component.html',
  styleUrl: './modal-follower.component.css'
})
export class ModalFollowerComponent {
  @Input() followers: any[] = []; 
  @Output() close = new EventEmitter<void>(); 

constructor( private router:Router){}
  closeModal(): void {
    this.close.emit();
  }

  navigateToProfileUser(idSeguidor: string) {
    this.router.navigate(['/profile', idSeguidor]);
    this.close.emit();
  }

}
