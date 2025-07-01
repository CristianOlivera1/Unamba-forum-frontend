import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-suggestion',
  imports: [CommonModule,RouterLink],
  templateUrl: './suggestion.component.html',
  styleUrl: './suggestion.component.css'
})
export class SuggestionComponent {
  @Input() suggestedUsers: any[] = [];
  hoverProfileData: any = null;
  hoverPosition = { top: 0, left: 0 };
  isHoverModalVisible = false;
  isHovering = false;

}
