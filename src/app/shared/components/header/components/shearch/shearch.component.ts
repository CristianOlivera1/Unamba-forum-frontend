import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { PublicationService } from '../../../../../core/services/publication/publication.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shearch',
  imports: [CommonModule],
  templateUrl: './shearch.component.html',
  styleUrl: './shearch.component.css'
})
export class ShearchComponent {
query = '';
  results: any[] = [];
  showDropdown = false;
  loading = false;
  private searchSubject = new Subject<string>();

  constructor(private publicationService: PublicationService, private router: Router) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.loading = true;
        if (!query.trim()) {
          this.results = [];
          this.loading = false;
          this.showDropdown = false;
          return [];
        }
        return this.publicationService.searchPublications(query);
      })
    ).subscribe((res: any) => {
      this.loading = false;
      this.results = res?.data || [];
      this.showDropdown = this.results.length > 0;
    });
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.query = value;
    this.searchSubject.next(value);
  }

  goToPublication(id: string) {
    this.showDropdown = false;
    this.query = '';
    this.router.navigate(['/publication', id]);
  }

  closeDropdown() {
    setTimeout(() => this.showDropdown = false, 150);
  }
}
