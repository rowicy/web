import type { Member } from '@/types/Member';

const member: Member[] = [
  {
    name: 'Naoki',
    image: '/images/member/naoki.jpg',
    description: 'Frontend Developer',
    links: [
      {
        name: 'GitHub',
        id: '@naoki-00-ito',
        href: 'https://github.com/naoki-00-ito',
        type: 'icon',
      },
      {
        name: 'X',
        id: '@naoki_dev',
        href: 'https://twitter.com/naoki_dev',
        type: 'icon',
      },
    ],
  },
  {
    name: 'RiiiM',
    image: '/images/member/riiim.jpg',
    description: 'Backend Developer',
    links: [
      {
        name: 'GitHub',
        id: '@riiim400th',
        href: 'https://github.com/riiim400th',
        type: 'icon',
      },
      {
        name: 'X',
        id: '@riiim400th',
        href: 'https://twitter.com/riiim400th',
        type: 'icon',
      },
    ],
  },
  {
    name: 'Millin',
    description: 'Game Developer',
  },
  {
    name: 'TANIZAKI',
    description: 'Security Consultant',
  },
];

export default member;

// NOTE: メンバーの名前のみをエクスポートするユーティリティ
export const members = member.map(m => m.name);
