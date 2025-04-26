import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-photo-slider',
  imports: [CommonModule],
  templateUrl: './photo-slider.component.html',
  styleUrl: './photo-slider.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PhotoSliderComponent implements OnInit {
  @Input() photos: { tipo: string; rutaArchivo: string }[] = [];
  @Input() initialIndex: number = 0;
  @Output() close = new EventEmitter<void>();

  currentIndex = 0;
  scale = 1;
  translateX = 0;
  translateY = 0;
  
  // Variables para el arrastre
  isDragging = false;
  startX = 0;
  currentX = 0;
  dragThreshold = 100; 
  isZoomed = false;

  ngOnInit(): void {
    this.currentIndex = this.initialIndex;
  }

  get currentPhoto() {
    return this.photos[this.currentIndex];
  }
  next() {
    if (this.currentIndex < this.photos.length - 1) {
      this.currentIndex++;
      this.resetZoom();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetZoom();
    }
  }

  closeSlider() {
    this.close.emit();
  }
  zoomIn() {
    this.scale += 0.3;
  }

  zoomOut() {
    if (this.scale > 1) {
      this.scale -= 0.3;
    }
  }

  resetZoom() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
  }
  onWheel(event: WheelEvent) {
    event.preventDefault(); 
    if (event.deltaY < 0) {
      this.zoomIn();
    } else if (event.deltaY > 0) {
      this.zoomOut();
    }
  }

  // Touch events
  onTouchStart(event: TouchEvent) {
    if (this.isZoomed) return;
    this.startX = event.touches[0].clientX;
    this.currentX = this.startX;
    this.isDragging = true;
    event.preventDefault();
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging || this.isZoomed) return;
    this.currentX = event.touches[0].clientX;
    event.preventDefault();
  }

  onTouchEnd() {
    if (this.isZoomed) return;
    
    const deltaX = this.currentX - this.startX;
    
    if (Math.abs(deltaX) > this.dragThreshold) {
      if (deltaX > 0) {
        this.prev();
      } else {
        this.next();
      }
    }
    
    this.isDragging = false;
  }

  // Mouse events
  onMouseDown(event: MouseEvent) {
    if (this.isZoomed) return;
    this.startX = event.clientX;
    this.currentX = this.startX;
    this.isDragging = true;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging || this.isZoomed) return;
    this.currentX = event.clientX;
    event.preventDefault();
  }

  onMouseUp() {
    if (this.isZoomed) return;
    
    const deltaX = this.currentX - this.startX;
    
    if (Math.abs(deltaX) > this.dragThreshold) {
      if (deltaX > 0) {
        this.prev();
      } else {
        this.next();
      }
    }
    
    this.isDragging = false;
  }

  handleImageClick(event: MouseEvent) {
    if (this.isDragging) {
      event.stopPropagation();
      this.isDragging = false;
    }
  }

  // Permite cerrar el slider con la tecla ESC
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    this.closeSlider();
  }
}