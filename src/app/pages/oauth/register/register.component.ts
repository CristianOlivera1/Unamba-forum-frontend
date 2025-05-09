import { Component, OnInit,PLATFORM_ID,Inject } from '@angular/core';
import { RegisterService } from '../../../core/services/oauth/register.service';
import { CareerService } from '../../../core/services/career/career.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService } from '../../../core/services/oauth/token.service';
import { CustomValidators } from '../../../Validators/CustomValidators';
import { isPlatformBrowser } from '@angular/common';
import { GoogleAuthService } from '../../../core/services/oauth/google-auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,FormsModule],
  providers: [CustomValidators],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent implements OnInit{
  
  career: any[] = [];
  
  registerData: any = {
    nombre: '',
    apellidos: '',
    email: '',
    contrasenha: '',
    confirmarContrasenha: '', 
    idCarrera: ''
  };

  alert: { type: string; message: string } | null = null;
  isRegistering: boolean = false;
  showPassword: boolean = false; 
  showConfirmPassword: boolean = false; 

  constructor(private registerService: RegisterService, private careerService: CareerService, private router: Router,private tokenService:TokenService,private customValidators: CustomValidators,@Inject(PLATFORM_ID) private platformId: Object,private googleAuthService:GoogleAuthService
  ) {}

  ngOnInit(): void {
    this.loadCareers();
    if (isPlatformBrowser(this.platformId)) {
      const { idToken, accessToken } = this.googleAuthService.handleGoogleCallback();
      if (idToken && accessToken) {
        this.registerWithGoogle(idToken, accessToken);
      }
    }
  }

  showAlert(type: string, messages: string[]): void {
    const message = messages.join(', ');
    this.alert = { type, message };
    setTimeout(() => {
      this.alert = null; 
    }, 5000);
  }

  loadCareers(): void {
    this.careerService.getAllCareer().subscribe({
      next: (response: any) => {
        if (response.type === 'success') {
          this.career = response.data;
    
        } else {
          this.showAlert('error', ['Error al cargar las carreras: ' + response.listMessage]);
        }
      },
      error: (error: any) => {
        console.error('Error en la solicitud:', error);
      }
    });
  }

  register(): void {
    const errors: string[] = [];

  // Validaciones
  const emailError = this.customValidators.validateEmail(this.registerData.email);
  if (emailError) errors.push(emailError);

  const passwordError = this.customValidators.validatePassword(
    this.registerData.contrasenha,
    this.registerData.confirmarContrasenha
  );
  if (passwordError) errors.push(passwordError);

  if (!this.registerData.nombre || !this.registerData.apellidos) {
    errors.push('Todos los campos son obligatorios.');
  }

  const careerError = this.customValidators.validateCareer(this.registerData.idCarrera);
  if (careerError) errors.push(careerError);

  if (errors.length > 0) {
    this.showAlert('error', errors);
    return;
  }
  this.isRegistering = true;

    const formData = new FormData();
    formData.append('nombre', this.registerData.nombre);
    formData.append('apellidos', this.registerData.apellidos);
    formData.append('email', this.registerData.email);
    formData.append('contrasenha', this.registerData.contrasenha);
    formData.append('idCarrera', this.registerData.idCarrera);
  
    this.registerService.registerUser(formData).subscribe(
      (response) => {
        if (response.type === 'success') {
               const jwtToken = response.data.jwtToken;
          this.tokenService.setToken(jwtToken);
          this.showAlert('success', response.listMessage);
            this.router.navigate(['/']);
        } else {
          this.showAlert('error', response.listMessage);
          this.isRegistering = false; 

        }
      },
      (error) => {
        console.error('Error al registrar:', error);
        this.showAlert('error', ['Error al registrar el usuario.']);
        this.isRegistering = false; 
      }
    );
  }

  registerWithGoogle(idToken: string, accessToken: string): void {
    this.googleAuthService.registerWithGoogle(idToken, accessToken).subscribe(
      (response: any) => {
        if (response.type === 'success') {
          const jwtToken = response.data.jwtToken;
          this.tokenService.setToken(jwtToken);
          this.showAlert('success', response.listMessage);
          window.location.href = '/';
      
        } else {
          this.showAlert('error', response.listMessage);
        }
      },
      (error) => {
        console.error('Error al registrar con Google:', error);
        this.showAlert('error', ['Error al registrar con Google.']);
      }
    );
  }

  loginWithGoogle(): void {
    this.googleAuthService.registerWithGoogleOauth();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
