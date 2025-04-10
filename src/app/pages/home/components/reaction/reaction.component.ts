import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-reaction',
  imports: [CommonModule],
  templateUrl: './reaction.component.html',
  styleUrl: './reaction.component.css'
})
export class ReactionComponent {
  popoverVisible = false;
  tooltipActivo: string | null = null;
  
  mostrarPopover() {
    this.popoverVisible = true;
  }
  
  mantenerPopoverVisible() {
    this.popoverVisible = true;
  }
  
  ocultarPopover() {
    this.popoverVisible = false;
  }
  
  mostrarTooltip(nombre: string) {
    this.tooltipActivo = nombre;
  }
  
  ocultarTooltip() {
    this.tooltipActivo = null;
  }
  
  
}
