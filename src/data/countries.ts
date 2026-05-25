import type { Country } from '@/types';

export const COUNTRIES: Country[] = [
  { id: 'jp', isoCode: 'JP', nameJa: '日本', nameEn: 'Japan', flag: '🇯🇵', region: 'アジア', continent: 'アジア', mapX: 78, mapY: 38, accent: '#D95048' },
  { id: 'th', isoCode: 'TH', nameJa: 'タイ', nameEn: 'Thailand', flag: '🇹🇭', region: 'アジア', continent: 'アジア', mapX: 67, mapY: 52, accent: '#2F6EB5' },
  { id: 'kr', isoCode: 'KR', nameJa: '韓国', nameEn: 'South Korea', flag: '🇰🇷', region: 'アジア', continent: 'アジア', mapX: 75, mapY: 36, accent: '#315B9B' },
  { id: 'sg', isoCode: 'SG', nameJa: 'シンガポール', nameEn: 'Singapore', flag: '🇸🇬', region: 'アジア', continent: 'アジア', mapX: 68, mapY: 62, accent: '#D9363E' },
  { id: 'vn', isoCode: 'VN', nameJa: 'ベトナム', nameEn: 'Vietnam', flag: '🇻🇳', region: 'アジア', continent: 'アジア', mapX: 70, mapY: 53, accent: '#D62828' },
  { id: 'id', isoCode: 'ID', nameJa: 'インドネシア', nameEn: 'Indonesia', flag: '🇮🇩', region: 'アジア', continent: 'アジア', mapX: 72, mapY: 68, accent: '#C83D3D' },
  { id: 'cn', isoCode: 'CN', nameJa: '中国', nameEn: 'China', flag: '🇨🇳', region: 'アジア', continent: 'アジア', mapX: 68, mapY: 35, accent: '#D62C2C' },
  { id: 'tw', isoCode: 'TW', nameJa: '台湾', nameEn: 'Taiwan', flag: '🇹🇼', region: 'アジア', continent: 'アジア', mapX: 75, mapY: 45, accent: '#365BB7' },
  { id: 'in', isoCode: 'IN', nameJa: 'インド', nameEn: 'India', flag: '🇮🇳', region: 'アジア', continent: 'アジア', mapX: 57, mapY: 49, accent: '#EF8B2C' },
  { id: 'my', isoCode: 'MY', nameJa: 'マレーシア', nameEn: 'Malaysia', flag: '🇲🇾', region: 'アジア', continent: 'アジア', mapX: 67, mapY: 61, accent: '#244F9E' },
  { id: 'ph', isoCode: 'PH', nameJa: 'フィリピン', nameEn: 'Philippines', flag: '🇵🇭', region: 'アジア', continent: 'アジア', mapX: 77, mapY: 55, accent: '#3158A8' },
  { id: 'tr', isoCode: 'TR', nameJa: 'トルコ', nameEn: 'Turkey', flag: '🇹🇷', region: 'ヨーロッパ', continent: 'ヨーロッパ', mapX: 50, mapY: 35, accent: '#D73838' },
  { id: 'it', isoCode: 'IT', nameJa: 'イタリア', nameEn: 'Italy', flag: '🇮🇹', region: 'ヨーロッパ', continent: 'ヨーロッパ', mapX: 45, mapY: 36, accent: '#2D9B63' },
  { id: 'fr', isoCode: 'FR', nameJa: 'フランス', nameEn: 'France', flag: '🇫🇷', region: 'ヨーロッパ', continent: 'ヨーロッパ', mapX: 41, mapY: 34, accent: '#315AAB' },
  { id: 'es', isoCode: 'ES', nameJa: 'スペイン', nameEn: 'Spain', flag: '🇪🇸', region: 'ヨーロッパ', continent: 'ヨーロッパ', mapX: 39, mapY: 39, accent: '#D8A22A' },
  { id: 'de', isoCode: 'DE', nameJa: 'ドイツ', nameEn: 'Germany', flag: '🇩🇪', region: 'ヨーロッパ', continent: 'ヨーロッパ', mapX: 43, mapY: 31, accent: '#36312C' },
  { id: 'gb', isoCode: 'GB', nameJa: 'イギリス', nameEn: 'United Kingdom', flag: '🇬🇧', region: 'ヨーロッパ', continent: 'ヨーロッパ', mapX: 39, mapY: 29, accent: '#325AA8' },
  { id: 'is', isoCode: 'IS', nameJa: 'アイスランド', nameEn: 'Iceland', flag: '🇮🇸', region: 'ヨーロッパ', continent: 'ヨーロッパ', mapX: 35, mapY: 21, accent: '#3167A8' },
  { id: 'pt', isoCode: 'PT', nameJa: 'ポルトガル', nameEn: 'Portugal', flag: '🇵🇹', region: 'ヨーロッパ', continent: 'ヨーロッパ', mapX: 37, mapY: 39, accent: '#2A9566' },
  { id: 'nl', isoCode: 'NL', nameJa: 'オランダ', nameEn: 'Netherlands', flag: '🇳🇱', region: 'ヨーロッパ', continent: 'ヨーロッパ', mapX: 42, mapY: 30, accent: '#D76738' },
  { id: 'gr', isoCode: 'GR', nameJa: 'ギリシャ', nameEn: 'Greece', flag: '🇬🇷', region: 'ヨーロッパ', continent: 'ヨーロッパ', mapX: 47, mapY: 40, accent: '#2C84C8' },
  { id: 'fi', isoCode: 'FI', nameJa: 'フィンランド', nameEn: 'Finland', flag: '🇫🇮', region: 'ヨーロッパ', continent: 'ヨーロッパ', mapX: 47, mapY: 23, accent: '#3B6FA7' },
  { id: 'us', isoCode: 'US', nameJa: 'アメリカ', nameEn: 'United States', flag: '🇺🇸', region: '北米', continent: '北米', mapX: 20, mapY: 37, accent: '#3159A4' },
  { id: 'ca', isoCode: 'CA', nameJa: 'カナダ', nameEn: 'Canada', flag: '🇨🇦', region: '北米', continent: '北米', mapX: 18, mapY: 25, accent: '#D54242' },
  { id: 'mx', isoCode: 'MX', nameJa: 'メキシコ', nameEn: 'Mexico', flag: '🇲🇽', region: '北米', continent: '北米', mapX: 20, mapY: 49, accent: '#279B64' },
  { id: 'cu', isoCode: 'CU', nameJa: 'キューバ', nameEn: 'Cuba', flag: '🇨🇺', region: '北米', continent: '北米', mapX: 27, mapY: 51, accent: '#3267A8' },
  { id: 'pe', isoCode: 'PE', nameJa: 'ペルー', nameEn: 'Peru', flag: '🇵🇪', region: '南米', continent: '南米', mapX: 31, mapY: 70, accent: '#C83D3D' },
  { id: 'br', isoCode: 'BR', nameJa: 'ブラジル', nameEn: 'Brazil', flag: '🇧🇷', region: '南米', continent: '南米', mapX: 36, mapY: 70, accent: '#36A666' },
  { id: 'ar', isoCode: 'AR', nameJa: 'アルゼンチン', nameEn: 'Argentina', flag: '🇦🇷', region: '南米', continent: '南米', mapX: 33, mapY: 83, accent: '#5CA7D8' },
  { id: 'cl', isoCode: 'CL', nameJa: 'チリ', nameEn: 'Chile', flag: '🇨🇱', region: '南米', continent: '南米', mapX: 30, mapY: 82, accent: '#D74747' },
  { id: 'co', isoCode: 'CO', nameJa: 'コロンビア', nameEn: 'Colombia', flag: '🇨🇴', region: '南米', continent: '南米', mapX: 31, mapY: 61, accent: '#DAB334' },
  { id: 'ma', isoCode: 'MA', nameJa: 'モロッコ', nameEn: 'Morocco', flag: '🇲🇦', region: 'アフリカ', continent: 'アフリカ', mapX: 43, mapY: 48, accent: '#C73737' },
  { id: 'eg', isoCode: 'EG', nameJa: 'エジプト', nameEn: 'Egypt', flag: '🇪🇬', region: 'アフリカ', continent: 'アフリカ', mapX: 51, mapY: 48, accent: '#C84141' },
  { id: 'za', isoCode: 'ZA', nameJa: '南アフリカ', nameEn: 'South Africa', flag: '🇿🇦', region: 'アフリカ', continent: 'アフリカ', mapX: 52, mapY: 82, accent: '#2D9B63' },
  { id: 'ke', isoCode: 'KE', nameJa: 'ケニア', nameEn: 'Kenya', flag: '🇰🇪', region: 'アフリカ', continent: 'アフリカ', mapX: 56, mapY: 64, accent: '#2F8B57' },
  { id: 'au', isoCode: 'AU', nameJa: 'オーストラリア', nameEn: 'Australia', flag: '🇦🇺', region: 'オセアニア', continent: 'オセアニア', mapX: 79, mapY: 78, accent: '#315DAB' },
  { id: 'nz', isoCode: 'NZ', nameJa: 'ニュージーランド', nameEn: 'New Zealand', flag: '🇳🇿', region: 'オセアニア', continent: 'オセアニア', mapX: 87, mapY: 86, accent: '#315DAB' },
  { id: 'fj', isoCode: 'FJ', nameJa: 'フィジー', nameEn: 'Fiji', flag: '🇫🇯', region: 'オセアニア', continent: 'オセアニア', mapX: 91, mapY: 75, accent: '#62ADD7' },
];

export const COUNTRY_BY_ID = Object.fromEntries(COUNTRIES.map((country) => [country.id, country])) as Record<string, Country>;

export const REGION_ORDER = ['アジア', 'ヨーロッパ', '北米', '南米', 'アフリカ', 'オセアニア'] as const;

export function searchCountries(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return COUNTRIES;
  }

  return COUNTRIES.filter((country) => {
    return (
      country.nameJa.includes(query.trim()) ||
      country.nameEn.toLowerCase().includes(normalized) ||
      country.isoCode.toLowerCase().includes(normalized)
    );
  });
}
