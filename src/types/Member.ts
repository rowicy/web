type Member = {
  name: string;
  image: string;
  description?: string;
  links?: { name: string; id?: string; href: string; type?: 'icon' }[];
};

export type { Member };
