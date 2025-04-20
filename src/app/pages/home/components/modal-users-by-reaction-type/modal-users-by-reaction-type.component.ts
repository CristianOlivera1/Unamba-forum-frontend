import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-users-by-reaction-type',
  imports: [CommonModule],
  templateUrl: './modal-users-by-reaction-type.component.html',
  styleUrl: './modal-users-by-reaction-type.component.css'
})
export class ModalUsersByReactionTypeComponent {
  @Input() reactionType!: string;
  @Input() users: any[] = [];
  @Input() position: { top: number; left: number } | null = null;
  
}
