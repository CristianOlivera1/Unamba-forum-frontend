import { Component, OnInit,PLATFORM_ID,Inject } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { HeroComponent } from './components/hero/hero.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { SummaryComponent } from '../../shared/components/summary/summary.component';
import { PublicationComponent } from '../../shared/components/publication/publication.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TokenService } from '../../core/services/oauth/token.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent,HeroComponent,FooterComponent,SummaryComponent,PublicationComponent,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  hasCheckedLogin: boolean = false;

  constructor(
    private tokenService: TokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.tokenService.isLoggedIn$.subscribe(status => {
        this.isLoggedIn = status;
        this.hasCheckedLogin = true;
      });
    }
  }
} 
