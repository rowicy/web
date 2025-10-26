import type { members } from '@/data/member';

type Product = {
  name: string;
  image?: string;
  description: string;
  href?: string;
  participants: (typeof members)[number][];
};

export type { Product };
