type Member = {
  name: string;
  image: string;
  description?: string;
  links?: { name: string; id?: string; href: string }[];
};

export type { Member };
