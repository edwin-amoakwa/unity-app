import { Component, HostListener, OnInit } from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { NgClass } from '@angular/common';
import {CoreModule} from '../../core/core.module';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CoreModule, RouterLink, NgClass, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = true;
  isMobile = false;
  theme: 'light' | 'dark' = 'dark';
  showUserMenu = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.onResize();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.setTheme('light');
    } else if (savedTheme === 'dark') {
      this.setTheme('dark');
    } else {
      this.setTheme('dark');
    }

    const savedSidebar = localStorage.getItem('sidebarOpen');
    if (savedSidebar !== null) {
      this.sidebarOpen = savedSidebar === 'true';
    }

    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth < 992;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showUserMenu = false;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    localStorage.setItem('sidebarOpen', String(this.sidebarOpen));
  }

  closeSidebar(): void {
    if (this.isMobile) {
      this.sidebarOpen = false;
      localStorage.setItem('sidebarOpen', String(this.sidebarOpen));
    }
  }

  toggleTheme(): void {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    try {
      localStorage.clear();
    } catch (e) {
      // ignore storage errors
    }
    this.showUserMenu = false;
    this.router.navigateByUrl('/login');
  }

  private setTheme(t: 'light' | 'dark'): void {
    this.theme = t;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
  }
}
