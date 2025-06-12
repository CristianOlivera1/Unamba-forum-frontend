import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CareerService } from '../../../../core/services/career/career.service';
import { CategoryService } from '../../../../core/services/category/category.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter',
  imports: [CommonModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent implements OnInit {
  isDragging = false;
  startX = 0;
  scrollLeft = 0;

  careers: any[] = [];
  categories: any[] = [];

  selectedCareer: string = '';
  selectedCategory: string = '';

    @Output() filterChanged = new EventEmitter<{ idCarrera: string, idCategoria: string }>();

  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;

    constructor(
    private careerService: CareerService,
    private categoryService: CategoryService
  ) {}

ngOnInit() {
  this.careerService.getAllCareer().subscribe({
    next: res => {
      this.careers = (res && res.data) ? res.data : [];
    },
    error: () => {
      this.careers = [];
    }
  });
  this.categoryService.getAllCategory().subscribe({
    next: res => {
      this.categories = (res && res.data) ? res.data : [];
    },
    error: () => {
      this.categories = [];
    }
  });
  setTimeout(() => {
    this.emitFilter();
  }, 0);
}
 onCareerSelect(idCarrera: string) {
    this.selectedCareer = idCarrera;
    this.emitFilter();
  }

  onCategorySelect(event: any) {
    this.selectedCategory = event.target.value;
    this.emitFilter();
  }

  emitFilter() {
    this.filterChanged.emit({
      idCarrera: this.selectedCareer,
      idCategoria: this.selectedCategory
    });
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
