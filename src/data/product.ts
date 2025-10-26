import type { Product } from '@/types/Product';

const product: Product[] = [
  {
    name: 'CHARIMACHI',
    image: '/images/product/charimachi.png',
    description:
      '2025年度の「都知事杯 Open Data Hackathon」で開発した、警視庁などが公開しているオープンデータを活用して自転車利用者が安心して車道を走行できるよう支援するスマホ用ナビゲーションアプリです。',
    href: 'https://odhackathon.metro.tokyo.lg.jp/collection/56/?year=2025',
  },
  {
    name: 'NANIMACHI',
    image: '/images/product/nanimachi.jpg',
    description:
      '2024年に開催された「Qiita Hackathon」で開発した、待ち時間をより一層楽しい時間に変えるためのWebサービスです。待ち人数の可視化や、待ち時間を楽しく過ごすためのコミュニケーションの場を提供します。',
    href: 'https://qiita.com/naoki-00-ito/items/214fb4f050ae809fe713',
  },
];

export default product;
