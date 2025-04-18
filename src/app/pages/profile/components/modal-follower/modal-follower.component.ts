import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-follower',
  imports: [CommonModule],
  templateUrl: './modal-follower.component.html',
  styleUrl: './modal-follower.component.css'
})
export class ModalFollowerComponent {
  @Input() followers: any[] = []; // Recibe los datos de los seguidores
  @Output() close = new EventEmitter<void>(); // Evento para cerrar el modal

  closeModal(): void {
    this.close.emit();
  }
}
