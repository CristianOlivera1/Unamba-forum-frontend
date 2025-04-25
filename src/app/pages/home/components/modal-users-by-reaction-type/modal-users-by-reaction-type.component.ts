import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router:Router){}

  navigateToProfileUser(idUsuario:string){
    this.router.navigate(["/profile",idUsuario])
  }
}
