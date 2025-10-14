import { Component, HostListener, OnInit } from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgClass, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = true;
  isMobile = false;
  theme: 'light' | 'dark' = 'light';

  ngOnInit(): void {
    this.onResize();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
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

  private setTheme(t: 'light' | 'dark'): void {
    this.theme = t;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
  }
}
