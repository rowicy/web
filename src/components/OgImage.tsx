import siteInfo from '@/data/siteInfo';
import satori from 'satori';
import sharp from 'sharp';

type Props = {
  title?: string;
  author?: string;
};

export async function getOgImage({ title, author }: Props) {
  const fontData = (await getFontData()) as ArrayBuffer;
  const svg = await satori(
    <main
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: 'hsl(222.2 84% 4.9%)',
        color: 'white',
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexFlow: 'column',
      }}
    >
      <section
        style={{
          height: '100%',
          width: '100%',
          padding: '40px',
          borderRadius: '10px',
          backgroundColor: 'hsl(222.2 47.4% 11.2%)',
          display: 'flex',
          justifyContent: 'center',
          flexFlow: 'column',
        }}
      >
        {title && <h1 style={{ fontSize: '50px' }}>{title}</h1>}
        {author && <p style={{ fontSize: '40px' }}>Author: {author}</p>}
        <p style={{ fontSize: '40px' }}>{siteInfo.appName}</p>
      </section>
    </main>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: fontData,
          style: 'normal',
        },
      ],
    }
  );

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

async function getFontData() {
  const API = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700`;

  const css = await (
    await fetch(API, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (!resource) return;

  return await fetch(resource[1]).then(res => res.arrayBuffer());
}
