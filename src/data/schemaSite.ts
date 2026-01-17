import member from './member';

interface Person {
  '@type': 'Person';
  name: string;
  description: string;
  image?: string;
  sameAs?: string[];
}

const orgMembers = member.map(m => {
  const person: Person = {
    '@type': 'Person',
    name: m.name,
    description: m.description || '',
  };

  if (m.image) {
    person.image = new URL(m.image, 'https://t2cqwfps.riiimparm.com/').toString();
  }

  if (m.links && m.links.length > 0) {
    person.sameAs = m.links.map(l => l.href);
  }

  return person;
});

const schemaSite = {
  '@type': 'WebSite',
  name: 'Rowicy',
  url: 'https://t2cqwfps.riiimparm.com',
  description: 'We are a creative organization founded by active developers!!!',
  inLanguage: 'ja',
  publisher: {
    '@type': 'Organization',
    name: 'Rowicy',
    url: 'https://t2cqwfps.riiimparm.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://t2cqwfps.riiimparm.com/rowicy-icon-bk.svg',
      width: 320,
      height: 320,
    },
    sameAs: ['https://x.com/rowicy_official'],
    foundingDate: '2024',
    member: orgMembers,
  },
};

export default schemaSite;
