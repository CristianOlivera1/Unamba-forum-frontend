import { Component, OnInit,PLATFORM_ID,Inject } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { HeroComponent } from './components/hero/hero.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { SummaryComponent } from '../../shared/components/summary/summary.component';
import { PublicationComponent } from '../../shared/components/publication/publication.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent,HeroComponent,FooterComponent,SummaryComponent,PublicationComponent,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

} 
