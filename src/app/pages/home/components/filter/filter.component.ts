import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-filter',
  imports: [],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent {
  isDragging = false;
  startX = 0;
  scrollLeft = 0;

  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;
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
