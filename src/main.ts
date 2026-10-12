import {
  enableProdMode,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';

import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { routes } from './app/app-routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { CoreModule } from './app/core/core.module';
import { RequestInterceptor } from './app/core/requestInterceptor';
import { MessageService } from 'primeng/api';
import { registerLocaleData } from '@angular/common';
import localeEnGh from '@angular/common/locales/en-GH';
import { LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { provideRouter } from '@angular/router';

if (environment.production) {
  enableProdMode();
}

registerLocaleData(localeEnGh);

// Apply the saved theme before bootstrap to avoid a flash of the wrong theme.
const savedTheme = localStorage.getItem('theme');
document.documentElement.setAttribute(
  'data-theme',
  savedTheme === 'dark' ? 'dark' : 'light',
);

const EcolinkPay = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eef2f9',
      100: '#d5deee',
      200: '#abbcdb',
      300: '#7a93c0',
      400: '#4a6699',
      500: '#2a4577',
      600: '#1c3768',
      700: '#132d5c',
      800: '#0e2147',
      900: '#0a1833',
      950: '#060f22',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.700}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.800}',
          activeColor: '{primary.900}',
        },
        surface: {
          0: '#ffffff',
          50: '#f3f5f9',
          100: '#eaeef4',
          200: '#dfe4ee',
          300: '#c6cedc',
          400: '#98a2b8',
          500: '#6a7591',
          600: '#4a5672',
          700: '#36415c',
          800: '#212b44',
          900: '#0f1b33',
          950: '#0a1226',
        },
      },
      dark: {
        primary: {
          color: '#4ba445',
          contrastColor: '#0b1a10',
          hoverColor: '#5db955',
          activeColor: '#7fcb75',
        },
        surface: {
          0: '#121b36',
          50: '#19243f',
          100: '#1f2a47',
          200: '#273352',
          300: '#34416a',
          400: '#5a6684',
          500: '#8691ab',
          600: '#a9b3ca',
          700: '#c5cddd',
          800: '#dde2ec',
          900: '#e8ecf5',
          950: '#f4f6fa',
        },
      },
    },
  },
});

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    MessageService,
    importProvidersFrom(BrowserModule, CoreModule),
    provideAnimations(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([RequestInterceptor])),
    providePrimeNG({
      theme: {
        preset: EcolinkPay,
        options: {
          // Activate PrimeNG dark theme tokens when the app is in dark mode.
          // We use the global [data-theme="dark"] attribute that the app toggles.
          darkModeSelector: '[data-theme="dark"]',
        },
      },
    }),
    { provide: LOCALE_ID, useValue: 'en-GH' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'GHS' },
  ],
}).catch((err) => console.error(err));
