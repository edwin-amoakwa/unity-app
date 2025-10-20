import { Component, HostListener, OnInit } from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import {CoreModule} from '../../core/core.module';
import {UserSession} from '../../core/user-session';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CoreModule, RouterLink, NgClass, RouterLinkActive, NgIf],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = true;
  isMobile = false;
  theme: 'light' | 'dark' = 'light';
  showUserMenu = false;
  user:any
  // userName:anu;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.user = UserSession.getUser();
    this.user.name = this.getFirstName(this.user.accountName);

    this.onResize();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.setTheme('light');
    } else if (savedTheme === 'dark') {
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



    this.user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.accountName)}&background=6ee7ff&color=0b1020&size=64`





  }

  getFirstName(name: string): string {
    const firstPart = name.trim().split(' ')[0];
    return firstPart;
  }

  // Checks if the current user is allowed to access the route represented by the given routerLink.
  // Accepts values like '/dashboard' or 'dashboard' and normalizes them.
  allow(link: string): boolean {
    if (!link) { return false; }
    // If the template passes an array or other types in future, handle string only here.
    const str = (Array.isArray(link) ? link.join('/') : String(link)).trim();
    const normalized = str.replace(/^\/+/, ''); // strip leading slashes
    return UserSession.allowRoute(normalized);
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
