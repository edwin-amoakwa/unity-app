import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutes } from './app/app-routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/aura';
import {CoreModule} from './app/core/core.module';
import { RequestInterceptor } from './app/core/requestInterceptor';
import {MessageService} from 'primeng/api';
import { registerLocaleData } from '@angular/common';
import localeEnGh from '@angular/common/locales/en-GH';
import { LOCALE_ID,DEFAULT_CURRENCY_CODE } from '@angular/core';

if (environment.production) {
  enableProdMode();
}

registerLocaleData(localeEnGh);

bootstrapApplication(AppComponent, {
  providers: [
    MessageService,
    importProvidersFrom(BrowserModule, AppRoutes, CoreModule),
    provideAnimations(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([RequestInterceptor])),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false, // This disables system dark mode detection
        },
      },

    }),
    { provide: LOCALE_ID, useValue: 'en-GH' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'GHS' }
  ]
}).catch((err) => console.error(err));
