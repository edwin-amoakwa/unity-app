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
        id: 'contact-manager',
        title: 'Contact Manager',
        type: 'item',
        classes: 'nav-item',
        url: '/contact-manager',
        icon: 'ti ti-plant-2',
        target: true,
        external: true
      }
    ]
  },


];
