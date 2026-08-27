import { Product, Supplier, Transaction, User, CategoryMetric } from '../types';

export const APP_LOGO_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg viewBox="0 0 300 380" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C5AA46" />
      <stop offset="45%" stop-color="#9D852C" />
      <stop offset="100%" stop-color="#7D671A" />
    </linearGradient>
    <radialGradient id="g2" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#C5AA46" />
      <stop offset="70%" stop-color="#9D852C" />
      <stop offset="100%" stop-color="#7D671A" />
    </radialGradient>
  </defs>
  <text x="150" y="70" text-anchor="middle" fill="url(#g1)" font-family="'Playfair Display','Cinzel',Georgia,serif" font-weight="700" font-size="66" letter-spacing="1">Adda</text>
  <circle cx="76" cy="120" r="18" fill="url(#g2)" />
  <circle cx="224" cy="120" r="18" fill="url(#g2)" />
  <circle cx="76" cy="260" r="18" fill="url(#g2)" />
  <circle cx="224" cy="260" r="18" fill="url(#g2)" />
  <g transform="translate(150, 190)">
    <path d="M -36 -50 C -14 -72 18 -76 40 -58 C 34 -44 26 -30 4 -14 C -2 -28 -12 -40 -36 -50 Z" fill="url(#g1)" />
    <path d="M 50 -36 C 72 -14 76 18 58 40 C 44 34 30 26 14 4 C 28 -2 40 -12 50 -36 Z" fill="url(#g1)" />
    <path d="M 36 50 C 14 72 -18 76 -40 58 C -34 44 -26 30 -4 14 C 2 28 12 40 36 50 Z" fill="url(#g1)" />
    <path d="M -50 36 C -72 14 -76 -18 -58 -40 C -44 -34 -30 -26 -14 -4 C -28 2 -40 12 -50 36 Z" fill="url(#g1)" />
  </g>
  <text x="150" y="336" text-anchor="middle" fill="url(#g1)" font-family="'Playfair Display','Cinzel',Georgia,serif" font-weight="700" font-size="66" letter-spacing="1">Rasa</text>
  <line x1="36" y1="358" x2="264" y2="358" stroke="url(#g1)" stroke-width="4" stroke-linecap="round" />
</svg>
`)}`;
export const USER_AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjKL5wk7zfB5aGlo6K1kjOEtLrTMDhlDQxbPuK-E3vXFp3hADyyP6z92kiaR8lbwFGAzIHZcjOVk-0HLX0ZiUez7l31CtnvJoRjb8RdmUUR5S27ixuP4fSK_dpSXKnIiHf-GLvrcYEsumHP7cydJIovn08DQanCLFjt9kP8gehLBBEY-6IJBPVvSrrYbWNX4aTReT-b5V6kY6wtPIlqnHIuNfKxMtPSEwwJdh4aq6JvKeUdIA8d8yp';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator',
    role: 'Inventory Manager',
    avatar: '',
    email: 'addarasakjd@gmail.com',
    phone: '+62 812-3456-7890',
    initials: 'AD',
    status: 'Aktif',
    createdAt: '2026-08-26',
    lastLogin: '2026-08-26 20:30',
  },
];

export const INITIAL_USER: User = INITIAL_USERS[0];

export const INITIAL_SUPPLIERS: Supplier[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const CATEGORY_METRICS: CategoryMetric[] = [];

export const NOTIFICATIONS: Array<{
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: string;
}> = [];

