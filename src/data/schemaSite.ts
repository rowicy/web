import member from './member';

const orgMembers = member.map(m => {
  const person = {
    '@type': 'Person',
    name: m.name,
    description: m.description || '',
    image: '',
    sameAs: [] as string[],
  };
  if (m.image) {
    person.image = new URL(m.image, 'https://www.rowicy.com/').toString();
  }
  if (m.links && m.links.length > 0) {
    person.sameAs = m.links.map(l => l.href);
  }

  return person;
});

const schemaSite = {
  '@type': 'WebSite',
  name: 'Rowicy',
  url: 'https://www.rowicy.com',
  description: 'We are a creative organization founded by active developers!!!',
  inLanguage: 'ja',
  publisher: {
    '@type': 'Organization',
    name: 'Rowicy',
    url: 'https://www.rowicy.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.rowicy.com/rowicy-icon-bk.png',
    },
    sameAs: ['https://x.com/rowicy_official'],
    foundingDate: '2024',
    member: orgMembers,
  },
};

export default schemaSite;
