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

// Canopy preset — teal brand + warm stone surfaces, driving all PrimeNG components.
const Canopy = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e9f6f4',
      100: '#c9eae5',
      200: '#97d6cd',
      300: '#5cbbae',
      400: '#2e9c8d',
      500: '#0f7e6f',
      600: '#0b6557',
      700: '#094e44',
      800: '#073a33',
      900: '#08221f',
      950: '#051a17',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        surface: {
          0: '#ffffff',
          50: '#f7f6f3',
          100: '#efede8',
          200: '#e4e1da',
          300: '#cbc7bd',
          400: '#a8a39a',
          500: '#807b71',
          600: '#5c574e',
          700: '#403c35',
          800: '#2a2722',
          900: '#1a1815',
          950: '#0f0e0c',
        },
      },
      dark: {
        primary: {
          color: '#2fb89e',
          contrastColor: '#06241e',
          hoverColor: '#46c6ae',
          activeColor: '#5cbbae',
        },
        surface: {
          0: '#15201d',
          50: '#1b2723',
          100: '#22302c',
          200: '#243430',
          300: '#324743',
          400: '#5c6b66',
          500: '#93a09b',
          600: '#b4beba',
          700: '#cdd6d2',
          800: '#e1e7e4',
          900: '#e8e6e0',
          950: '#f4f3ef',
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
        preset: Canopy,
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
