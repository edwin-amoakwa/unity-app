export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  role?: string[];
  isMainParent?: boolean;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard',
        icon: 'bi bi-speedometer2',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'elements',
    title: 'Pages',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'applications',
        title: 'Applications',
        type: 'item',
        classes: 'nav-item',
        url: '/applications',
        icon: 'bi bi-grid'
      },
      {
        id: 'sender-id',
        title: 'Sender IDs',
        type: 'item',
        classes: 'nav-item',
        url: '/sender-id',
        icon: 'bi bi-tag'
      },
      {
        id: 'send-sms',
        title: 'Send SMS',
        type: 'item',
        classes: 'nav-item',
        url: '/send-sms',
        icon: 'bi bi-envelope'
      },
      {
        id: 'sms-records',
        title: 'Message Logs',
        type: 'item',
        classes: 'nav-item',
        url: '/sms-records',
        icon: 'bi bi-clock-history'
      },
      {
        id: 'add-funds',
        title: 'Add Funds',
        type: 'item',
        classes: 'nav-item',
        url: '/add-funds',
        icon: 'bi bi-wallet2',
      },
      {
        id: 'group-contacts',
        title: 'Groups & Contacts',
        type: 'item',
        classes: 'nav-item',
        url: '/group-contacts',
        icon: 'bi bi-people',
      },
      {
        id: 'users',
        title: 'User Management',
        type: 'item',
        classes: 'nav-item',
        url: '/users',
        icon: 'bi bi-person-gear',
      },
      {
        id: 'settings',
        title: 'Settings',
        type: 'item',
        classes: 'nav-item',
        url: '/profile',
        icon: 'bi bi-gear',
      }

    ]
  },


];
