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
      },
      { name: 'X', id: '@naoki_dev', href: 'https://twitter.com/naoki_dev' },
      {
        name: 'Bluesky',
        id: '@naoki.site',
        href: 'https://bsky.app/profile/naoki.site',
      },
      { name: 'Blog', href: 'https://naoki.site/' },
    ],
  },
  {
    name: 'dummy member',
    image: '/images/member/naoki.jpg',
  },
  {
    name: 'dummy member',
    image: '/images/member/naoki.jpg',
  },
  {
    name: 'dummy member',
    image: '/images/member/naoki.jpg',
  },
  {
    name: 'dummy member',
    image: '/images/member/naoki.jpg',
  },
];

export default member;
