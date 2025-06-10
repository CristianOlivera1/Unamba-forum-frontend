import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { PublicationService } from '../../../../../core/services/publication/publication.service';
import { CommonModule } from '@angular/common';
const RECENT_SEARCHES_KEY = 'recentSearches';

@Component({
  selector: 'app-search',
  imports: [CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class ShearchComponent {
query = '';
  results: any[] = [];
  showDropdown = false;
  loading = false;
  private searchSubject = new Subject<string>();
  recentSearches: string[] = [];
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(private publicationService: PublicationService, private router: Router,    private eRef: ElementRef) {
    this.loadRecentSearches();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.loading = true;
        if (!query.trim()) {
          this.results = [];
          this.loading = false;
          return of([]);
        }
        return this.publicationService.searchPublications(query);
      })
    ).subscribe((res: any) => {
      this.loading = false;
      this.results = res?.data || [];
    });
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.query = value;
    if (!value.trim()) {
      this.results = [];
    } else {
      this.searchSubject.next(value);
    }
  }

  openDropdown() {
    this.showDropdown = true;
    setTimeout(() => this.searchInput?.nativeElement.focus(), 100);
  }
  onFocus() {
    if (!this.query.trim() && this.recentSearches.length > 0) {
      this.showDropdown = true;
    } else if (this.results.length > 0) {
      this.showDropdown = true;
    }
  }

  closeDropdown() {
    this.showDropdown = false;
    this.query = '';
    this.results = [];
  }

  clearQuery() {
    this.query = '';
    this.results = [];
  }
 goToPublication(id: string) {
    this.saveRecentSearch(this.query);
    this.closeDropdown();
    this.router.navigate(['/publication', id]);
  }

  selectRecentSearch(search: string) {
    this.query = search;
    this.searchSubject.next(search);
    setTimeout(() => this.searchInput?.nativeElement.focus(), 100);
  }

loadRecentSearches() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    this.recentSearches = stored ? JSON.parse(stored) : [];
  } else {
    this.recentSearches = [];
  }
}

saveRecentSearch(search: string) {
  if (!search.trim()) return;
  this.recentSearches = this.recentSearches.filter(s => s !== search);
  this.recentSearches.unshift(search);
  if (this.recentSearches.length > 5) this.recentSearches = this.recentSearches.slice(0, 5);
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(this.recentSearches));
  }
}
// Cierra el dropdown al hacer click fuera
  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (this.showDropdown && !this.eRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }
}
