export const SITE_URL = process.env.VERCEL_ENV === 'production' 
    ? 'https://preview-rowicy-web-riiim.riiimparm.com' // 本番ドメインが決まっているならここ
    : process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` // プレビューURLなど
      : 'http://localhost:4321'         // ローカル開発用