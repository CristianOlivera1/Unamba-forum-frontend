import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { WelcomeComponent } from '../../../pages/home/components/welcome/welcome.component';
import { TokenService } from '../../../core/services/oauth/token.service';

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [CommonModule,WelcomeComponent],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.css'
})
export class PublicationComponent {
  isOpen = false;
  selectedOption: string | null = null;

  options: string[] = [
    'Todas',
    'Tecnología',
    'Ropa',
    'Hogar',
    'Deportes',
  ];

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.isOpen = false;
  }
  
  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;

  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  isLoggedIn: boolean = false;

  constructor(private tokenService: TokenService) {}
  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenService.getToken();
  }

  startDrag(event: MouseEvent | TouchEvent) {
    this.isDragging = true;

    const pageX = (event instanceof TouchEvent)
      ? event.touches[0].pageX
      : event.pageX;

    this.startX = pageX - this.scrollContainer.nativeElement.offsetLeft;
    this.scrollLeft = this.scrollContainer.nativeElement.scrollLeft;
  }

  stopDrag() {
    this.isDragging = false;
  }

  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    event.preventDefault();

    const pageX = (event instanceof TouchEvent)
      ? event.touches[0].pageX
      : event.pageX;

    const x = pageX - this.scrollContainer.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5;

    this.scrollContainer.nativeElement.scrollLeft = this.scrollLeft - walk;
  }
}
