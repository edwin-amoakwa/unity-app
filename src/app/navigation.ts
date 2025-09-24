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
        icon: 'ti ti-dashboard',
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
        icon: 'ti ti-typography'
      },
      {
        id: 'sender-id',
        title: 'Sender IDs',
        type: 'item',
        classes: 'nav-item',
        url: '/sender-id',
        icon: 'ti ti-typography'
      },
      {
        id: 'send-sms',
        title: 'Send SMS',
        type: 'item',
        classes: 'nav-item',
        url: '/send-sms',
        icon: 'ti ti-brush'
      },
      {
        id: 'sms-records',
        title: 'Message Logs',
        type: 'item',
        classes: 'nav-item',
        url: '/sms-records',
        icon: 'ti ti-brush'
      },
      {
        id: 'add-funds',
        title: 'Add Funds',
        type: 'item',
        classes: 'nav-item',
        url: '/add-funds',
        icon: 'ti ti-currency-dollar',
      },
      {
        id: 'group-contacts',
        title: 'Groups & Contacts',
        type: 'item',
        classes: 'nav-item',
        url: '/group-contacts',
        icon: 'ti ti-users',
      },
      {
        id: 'users',
        title: 'User Management',
        type: 'item',
        classes: 'nav-item',
        url: '/users',
        icon: 'ti ti-brush',
      }

    ]
  },


];
