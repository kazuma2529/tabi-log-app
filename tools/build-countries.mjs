import fs from 'node:fs';

const centroids = JSON.parse(fs.readFileSync('tools/centroids.json', 'utf8'));

// 既存38か国（日本除外）。mapX/mapY/accent は完全維持。
const EXISTING = [
  { id: 'th', isoCode: 'TH', nameJa: 'タイ', nameEn: 'Thailand', flag: '🇹🇭', region: 'アジア', mapX: 67, mapY: 52, accent: '#2F6EB5' },
  { id: 'kr', isoCode: 'KR', nameJa: '韓国', nameEn: 'South Korea', flag: '🇰🇷', region: 'アジア', mapX: 75, mapY: 36, accent: '#315B9B' },
  { id: 'sg', isoCode: 'SG', nameJa: 'シンガポール', nameEn: 'Singapore', flag: '🇸🇬', region: 'アジア', mapX: 68, mapY: 62, accent: '#D9363E' },
  { id: 'vn', isoCode: 'VN', nameJa: 'ベトナム', nameEn: 'Vietnam', flag: '🇻🇳', region: 'アジア', mapX: 70, mapY: 53, accent: '#D62828' },
  { id: 'id', isoCode: 'ID', nameJa: 'インドネシア', nameEn: 'Indonesia', flag: '🇮🇩', region: 'アジア', mapX: 72, mapY: 68, accent: '#C83D3D' },
  { id: 'cn', isoCode: 'CN', nameJa: '中国', nameEn: 'China', flag: '🇨🇳', region: 'アジア', mapX: 68, mapY: 35, accent: '#D62C2C' },
  { id: 'tw', isoCode: 'TW', nameJa: '台湾', nameEn: 'Taiwan', flag: '🇹🇼', region: 'アジア', mapX: 75, mapY: 45, accent: '#365BB7' },
  { id: 'in', isoCode: 'IN', nameJa: 'インド', nameEn: 'India', flag: '🇮🇳', region: 'アジア', mapX: 57, mapY: 49, accent: '#EF8B2C' },
  { id: 'my', isoCode: 'MY', nameJa: 'マレーシア', nameEn: 'Malaysia', flag: '🇲🇾', region: 'アジア', mapX: 67, mapY: 61, accent: '#244F9E' },
  { id: 'ph', isoCode: 'PH', nameJa: 'フィリピン', nameEn: 'Philippines', flag: '🇵🇭', region: 'アジア', mapX: 77, mapY: 55, accent: '#3158A8' },
  { id: 'tr', isoCode: 'TR', nameJa: 'トルコ', nameEn: 'Turkey', flag: '🇹🇷', region: 'ヨーロッパ', mapX: 50, mapY: 35, accent: '#D73838' },
  { id: 'it', isoCode: 'IT', nameJa: 'イタリア', nameEn: 'Italy', flag: '🇮🇹', region: 'ヨーロッパ', mapX: 45, mapY: 36, accent: '#2D9B63' },
  { id: 'fr', isoCode: 'FR', nameJa: 'フランス', nameEn: 'France', flag: '🇫🇷', region: 'ヨーロッパ', mapX: 41, mapY: 34, accent: '#315AAB' },
  { id: 'es', isoCode: 'ES', nameJa: 'スペイン', nameEn: 'Spain', flag: '🇪🇸', region: 'ヨーロッパ', mapX: 39, mapY: 39, accent: '#D8A22A' },
  { id: 'de', isoCode: 'DE', nameJa: 'ドイツ', nameEn: 'Germany', flag: '🇩🇪', region: 'ヨーロッパ', mapX: 43, mapY: 31, accent: '#36312C' },
  { id: 'gb', isoCode: 'GB', nameJa: 'イギリス', nameEn: 'United Kingdom', flag: '🇬🇧', region: 'ヨーロッパ', mapX: 39, mapY: 29, accent: '#325AA8' },
  { id: 'is', isoCode: 'IS', nameJa: 'アイスランド', nameEn: 'Iceland', flag: '🇮🇸', region: 'ヨーロッパ', mapX: 35, mapY: 21, accent: '#3167A8' },
  { id: 'pt', isoCode: 'PT', nameJa: 'ポルトガル', nameEn: 'Portugal', flag: '🇵🇹', region: 'ヨーロッパ', mapX: 37, mapY: 39, accent: '#2A9566' },
  { id: 'nl', isoCode: 'NL', nameJa: 'オランダ', nameEn: 'Netherlands', flag: '🇳🇱', region: 'ヨーロッパ', mapX: 42, mapY: 30, accent: '#D76738' },
  { id: 'gr', isoCode: 'GR', nameJa: 'ギリシャ', nameEn: 'Greece', flag: '🇬🇷', region: 'ヨーロッパ', mapX: 47, mapY: 40, accent: '#2C84C8' },
  { id: 'fi', isoCode: 'FI', nameJa: 'フィンランド', nameEn: 'Finland', flag: '🇫🇮', region: 'ヨーロッパ', mapX: 47, mapY: 23, accent: '#3B6FA7' },
  { id: 'us', isoCode: 'US', nameJa: 'アメリカ', nameEn: 'United States', flag: '🇺🇸', region: '北米', mapX: 20, mapY: 37, accent: '#3159A4' },
  { id: 'ca', isoCode: 'CA', nameJa: 'カナダ', nameEn: 'Canada', flag: '🇨🇦', region: '北米', mapX: 18, mapY: 25, accent: '#D54242' },
  { id: 'mx', isoCode: 'MX', nameJa: 'メキシコ', nameEn: 'Mexico', flag: '🇲🇽', region: '北米', mapX: 20, mapY: 49, accent: '#279B64' },
  { id: 'cu', isoCode: 'CU', nameJa: 'キューバ', nameEn: 'Cuba', flag: '🇨🇺', region: '北米', mapX: 27, mapY: 51, accent: '#3267A8' },
  { id: 'pe', isoCode: 'PE', nameJa: 'ペルー', nameEn: 'Peru', flag: '🇵🇪', region: '南米', mapX: 31, mapY: 70, accent: '#C83D3D' },
  { id: 'br', isoCode: 'BR', nameJa: 'ブラジル', nameEn: 'Brazil', flag: '🇧🇷', region: '南米', mapX: 36, mapY: 70, accent: '#36A666' },
  { id: 'ar', isoCode: 'AR', nameJa: 'アルゼンチン', nameEn: 'Argentina', flag: '🇦🇷', region: '南米', mapX: 33, mapY: 83, accent: '#5CA7D8' },
  { id: 'cl', isoCode: 'CL', nameJa: 'チリ', nameEn: 'Chile', flag: '🇨🇱', region: '南米', mapX: 30, mapY: 82, accent: '#D74747' },
  { id: 'co', isoCode: 'CO', nameJa: 'コロンビア', nameEn: 'Colombia', flag: '🇨🇴', region: '南米', mapX: 31, mapY: 61, accent: '#DAB334' },
  { id: 'ma', isoCode: 'MA', nameJa: 'モロッコ', nameEn: 'Morocco', flag: '🇲🇦', region: 'アフリカ', mapX: 43, mapY: 48, accent: '#C73737' },
  { id: 'eg', isoCode: 'EG', nameJa: 'エジプト', nameEn: 'Egypt', flag: '🇪🇬', region: 'アフリカ', mapX: 51, mapY: 48, accent: '#C84141' },
  { id: 'za', isoCode: 'ZA', nameJa: '南アフリカ', nameEn: 'South Africa', flag: '🇿🇦', region: 'アフリカ', mapX: 52, mapY: 82, accent: '#2D9B63' },
  { id: 'ke', isoCode: 'KE', nameJa: 'ケニア', nameEn: 'Kenya', flag: '🇰🇪', region: 'アフリカ', mapX: 56, mapY: 64, accent: '#2F8B57' },
  { id: 'au', isoCode: 'AU', nameJa: 'オーストラリア', nameEn: 'Australia', flag: '🇦🇺', region: 'オセアニア', mapX: 79, mapY: 78, accent: '#315DAB' },
  { id: 'nz', isoCode: 'NZ', nameJa: 'ニュージーランド', nameEn: 'New Zealand', flag: '🇳🇿', region: 'オセアニア', mapX: 87, mapY: 86, accent: '#315DAB' },
  { id: 'fj', isoCode: 'FJ', nameJa: 'フィジー', nameEn: 'Fiji', flag: '🇫🇯', region: 'オセアニア', mapX: 91, mapY: 75, accent: '#62ADD7' },
];

// 新規159か国（id, isoCode, nameJa, nameEn, region）
const NEW = [
  // === アジア 36か国 ===
  // 東アジア (4)
  { id: 'mn', isoCode: 'MN', nameJa: 'モンゴル', nameEn: 'Mongolia', region: 'アジア' },
  { id: 'kp', isoCode: 'KP', nameJa: '北朝鮮', nameEn: 'North Korea', region: 'アジア' },
  // 東南アジア (6) - 既存: TH, SG, VN, ID, MY, PH
  { id: 'bn', isoCode: 'BN', nameJa: 'ブルネイ', nameEn: 'Brunei', region: 'アジア' },
  { id: 'kh', isoCode: 'KH', nameJa: 'カンボジア', nameEn: 'Cambodia', region: 'アジア' },
  { id: 'la', isoCode: 'LA', nameJa: 'ラオス', nameEn: 'Laos', region: 'アジア' },
  { id: 'mm', isoCode: 'MM', nameJa: 'ミャンマー', nameEn: 'Myanmar', region: 'アジア' },
  { id: 'tl', isoCode: 'TL', nameJa: '東ティモール', nameEn: 'Timor-Leste', region: 'アジア' },
  // 南アジア (7) - 既存: IN
  { id: 'af', isoCode: 'AF', nameJa: 'アフガニスタン', nameEn: 'Afghanistan', region: 'アジア' },
  { id: 'bd', isoCode: 'BD', nameJa: 'バングラデシュ', nameEn: 'Bangladesh', region: 'アジア' },
  { id: 'bt', isoCode: 'BT', nameJa: 'ブータン', nameEn: 'Bhutan', region: 'アジア' },
  { id: 'mv', isoCode: 'MV', nameJa: 'モルディブ', nameEn: 'Maldives', region: 'アジア' },
  { id: 'np', isoCode: 'NP', nameJa: 'ネパール', nameEn: 'Nepal', region: 'アジア' },
  { id: 'pk', isoCode: 'PK', nameJa: 'パキスタン', nameEn: 'Pakistan', region: 'アジア' },
  { id: 'lk', isoCode: 'LK', nameJa: 'スリランカ', nameEn: 'Sri Lanka', region: 'アジア' },
  // 中央アジア (5)
  { id: 'kz', isoCode: 'KZ', nameJa: 'カザフスタン', nameEn: 'Kazakhstan', region: 'アジア' },
  { id: 'kg', isoCode: 'KG', nameJa: 'キルギス', nameEn: 'Kyrgyzstan', region: 'アジア' },
  { id: 'tj', isoCode: 'TJ', nameJa: 'タジキスタン', nameEn: 'Tajikistan', region: 'アジア' },
  { id: 'tm', isoCode: 'TM', nameJa: 'トルクメニスタン', nameEn: 'Turkmenistan', region: 'アジア' },
  { id: 'uz', isoCode: 'UZ', nameJa: 'ウズベキスタン', nameEn: 'Uzbekistan', region: 'アジア' },
  // 西アジア・中東 (17)
  { id: 'am', isoCode: 'AM', nameJa: 'アルメニア', nameEn: 'Armenia', region: 'アジア' },
  { id: 'az', isoCode: 'AZ', nameJa: 'アゼルバイジャン', nameEn: 'Azerbaijan', region: 'アジア' },
  { id: 'bh', isoCode: 'BH', nameJa: 'バーレーン', nameEn: 'Bahrain', region: 'アジア' },
  { id: 'cy', isoCode: 'CY', nameJa: 'キプロス', nameEn: 'Cyprus', region: 'アジア' },
  { id: 'ge', isoCode: 'GE', nameJa: 'ジョージア', nameEn: 'Georgia', region: 'アジア' },
  { id: 'iq', isoCode: 'IQ', nameJa: 'イラク', nameEn: 'Iraq', region: 'アジア' },
  { id: 'ir', isoCode: 'IR', nameJa: 'イラン', nameEn: 'Iran', region: 'アジア' },
  { id: 'il', isoCode: 'IL', nameJa: 'イスラエル', nameEn: 'Israel', region: 'アジア' },
  { id: 'jo', isoCode: 'JO', nameJa: 'ヨルダン', nameEn: 'Jordan', region: 'アジア' },
  { id: 'kw', isoCode: 'KW', nameJa: 'クウェート', nameEn: 'Kuwait', region: 'アジア' },
  { id: 'lb', isoCode: 'LB', nameJa: 'レバノン', nameEn: 'Lebanon', region: 'アジア' },
  { id: 'om', isoCode: 'OM', nameJa: 'オマーン', nameEn: 'Oman', region: 'アジア' },
  { id: 'qa', isoCode: 'QA', nameJa: 'カタール', nameEn: 'Qatar', region: 'アジア' },
  { id: 'sa', isoCode: 'SA', nameJa: 'サウジアラビア', nameEn: 'Saudi Arabia', region: 'アジア' },
  { id: 'sy', isoCode: 'SY', nameJa: 'シリア', nameEn: 'Syria', region: 'アジア' },
  { id: 'ae', isoCode: 'AE', nameJa: 'アラブ首長国連邦', nameEn: 'United Arab Emirates', region: 'アジア' },
  { id: 'ye', isoCode: 'YE', nameJa: 'イエメン', nameEn: 'Yemen', region: 'アジア' },

  // === ヨーロッパ 35か国 === (既存: TR, IT, FR, ES, DE, GB, IS, PT, NL, GR, FI)
  { id: 'al', isoCode: 'AL', nameJa: 'アルバニア', nameEn: 'Albania', region: 'ヨーロッパ' },
  { id: 'ad', isoCode: 'AD', nameJa: 'アンドラ', nameEn: 'Andorra', region: 'ヨーロッパ' },
  { id: 'at', isoCode: 'AT', nameJa: 'オーストリア', nameEn: 'Austria', region: 'ヨーロッパ' },
  { id: 'by', isoCode: 'BY', nameJa: 'ベラルーシ', nameEn: 'Belarus', region: 'ヨーロッパ' },
  { id: 'be', isoCode: 'BE', nameJa: 'ベルギー', nameEn: 'Belgium', region: 'ヨーロッパ' },
  { id: 'ba', isoCode: 'BA', nameJa: 'ボスニア・ヘルツェゴビナ', nameEn: 'Bosnia and Herzegovina', region: 'ヨーロッパ' },
  { id: 'bg', isoCode: 'BG', nameJa: 'ブルガリア', nameEn: 'Bulgaria', region: 'ヨーロッパ' },
  { id: 'hr', isoCode: 'HR', nameJa: 'クロアチア', nameEn: 'Croatia', region: 'ヨーロッパ' },
  { id: 'cz', isoCode: 'CZ', nameJa: 'チェコ', nameEn: 'Czech Republic', region: 'ヨーロッパ' },
  { id: 'dk', isoCode: 'DK', nameJa: 'デンマーク', nameEn: 'Denmark', region: 'ヨーロッパ' },
  { id: 'ee', isoCode: 'EE', nameJa: 'エストニア', nameEn: 'Estonia', region: 'ヨーロッパ' },
  { id: 'hu', isoCode: 'HU', nameJa: 'ハンガリー', nameEn: 'Hungary', region: 'ヨーロッパ' },
  { id: 'ie', isoCode: 'IE', nameJa: 'アイルランド', nameEn: 'Ireland', region: 'ヨーロッパ' },
  { id: 'lv', isoCode: 'LV', nameJa: 'ラトビア', nameEn: 'Latvia', region: 'ヨーロッパ' },
  { id: 'li', isoCode: 'LI', nameJa: 'リヒテンシュタイン', nameEn: 'Liechtenstein', region: 'ヨーロッパ' },
  { id: 'lt', isoCode: 'LT', nameJa: 'リトアニア', nameEn: 'Lithuania', region: 'ヨーロッパ' },
  { id: 'lu', isoCode: 'LU', nameJa: 'ルクセンブルク', nameEn: 'Luxembourg', region: 'ヨーロッパ' },
  { id: 'mt', isoCode: 'MT', nameJa: 'マルタ', nameEn: 'Malta', region: 'ヨーロッパ' },
  { id: 'md', isoCode: 'MD', nameJa: 'モルドバ', nameEn: 'Moldova', region: 'ヨーロッパ' },
  { id: 'mc', isoCode: 'MC', nameJa: 'モナコ', nameEn: 'Monaco', region: 'ヨーロッパ' },
  { id: 'me', isoCode: 'ME', nameJa: 'モンテネグロ', nameEn: 'Montenegro', region: 'ヨーロッパ' },
  { id: 'mk', isoCode: 'MK', nameJa: '北マケドニア', nameEn: 'North Macedonia', region: 'ヨーロッパ' },
  { id: 'no', isoCode: 'NO', nameJa: 'ノルウェー', nameEn: 'Norway', region: 'ヨーロッパ' },
  { id: 'pl', isoCode: 'PL', nameJa: 'ポーランド', nameEn: 'Poland', region: 'ヨーロッパ' },
  { id: 'ro', isoCode: 'RO', nameJa: 'ルーマニア', nameEn: 'Romania', region: 'ヨーロッパ' },
  { id: 'ru', isoCode: 'RU', nameJa: 'ロシア', nameEn: 'Russia', region: 'ヨーロッパ' },
  { id: 'sm', isoCode: 'SM', nameJa: 'サンマリノ', nameEn: 'San Marino', region: 'ヨーロッパ' },
  { id: 'rs', isoCode: 'RS', nameJa: 'セルビア', nameEn: 'Serbia', region: 'ヨーロッパ' },
  { id: 'sk', isoCode: 'SK', nameJa: 'スロバキア', nameEn: 'Slovakia', region: 'ヨーロッパ' },
  { id: 'si', isoCode: 'SI', nameJa: 'スロベニア', nameEn: 'Slovenia', region: 'ヨーロッパ' },
  { id: 'se', isoCode: 'SE', nameJa: 'スウェーデン', nameEn: 'Sweden', region: 'ヨーロッパ' },
  { id: 'ch', isoCode: 'CH', nameJa: 'スイス', nameEn: 'Switzerland', region: 'ヨーロッパ' },
  { id: 'ua', isoCode: 'UA', nameJa: 'ウクライナ', nameEn: 'Ukraine', region: 'ヨーロッパ' },
  { id: 'va', isoCode: 'VA', nameJa: 'バチカン市国', nameEn: 'Vatican City', region: 'ヨーロッパ' },
  { id: 'xk', isoCode: 'XK', nameJa: 'コソボ', nameEn: 'Kosovo', region: 'ヨーロッパ' },

  // === 北米 19か国 === (既存: US, CA, MX, CU)
  { id: 'bz', isoCode: 'BZ', nameJa: 'ベリーズ', nameEn: 'Belize', region: '北米' },
  { id: 'cr', isoCode: 'CR', nameJa: 'コスタリカ', nameEn: 'Costa Rica', region: '北米' },
  { id: 'sv', isoCode: 'SV', nameJa: 'エルサルバドル', nameEn: 'El Salvador', region: '北米' },
  { id: 'gt', isoCode: 'GT', nameJa: 'グアテマラ', nameEn: 'Guatemala', region: '北米' },
  { id: 'hn', isoCode: 'HN', nameJa: 'ホンジュラス', nameEn: 'Honduras', region: '北米' },
  { id: 'ni', isoCode: 'NI', nameJa: 'ニカラグア', nameEn: 'Nicaragua', region: '北米' },
  { id: 'pa', isoCode: 'PA', nameJa: 'パナマ', nameEn: 'Panama', region: '北米' },
  { id: 'ag', isoCode: 'AG', nameJa: 'アンティグア・バーブーダ', nameEn: 'Antigua and Barbuda', region: '北米' },
  { id: 'bs', isoCode: 'BS', nameJa: 'バハマ', nameEn: 'Bahamas', region: '北米' },
  { id: 'bb', isoCode: 'BB', nameJa: 'バルバドス', nameEn: 'Barbados', region: '北米' },
  { id: 'dm', isoCode: 'DM', nameJa: 'ドミニカ国', nameEn: 'Dominica', region: '北米' },
  { id: 'do', isoCode: 'DO', nameJa: 'ドミニカ共和国', nameEn: 'Dominican Republic', region: '北米' },
  { id: 'gd', isoCode: 'GD', nameJa: 'グレナダ', nameEn: 'Grenada', region: '北米' },
  { id: 'ht', isoCode: 'HT', nameJa: 'ハイチ', nameEn: 'Haiti', region: '北米' },
  { id: 'jm', isoCode: 'JM', nameJa: 'ジャマイカ', nameEn: 'Jamaica', region: '北米' },
  { id: 'kn', isoCode: 'KN', nameJa: 'セントクリストファー・ネービス', nameEn: 'Saint Kitts and Nevis', region: '北米' },
  { id: 'lc', isoCode: 'LC', nameJa: 'セントルシア', nameEn: 'Saint Lucia', region: '北米' },
  { id: 'vc', isoCode: 'VC', nameJa: 'セントビンセント及びグレナディーン諸島', nameEn: 'Saint Vincent and the Grenadines', region: '北米' },
  { id: 'tt', isoCode: 'TT', nameJa: 'トリニダード・トバゴ', nameEn: 'Trinidad and Tobago', region: '北米' },

  // === 南米 7か国 === (既存: PE, BR, AR, CL, CO)
  { id: 'bo', isoCode: 'BO', nameJa: 'ボリビア', nameEn: 'Bolivia', region: '南米' },
  { id: 'ec', isoCode: 'EC', nameJa: 'エクアドル', nameEn: 'Ecuador', region: '南米' },
  { id: 'gy', isoCode: 'GY', nameJa: 'ガイアナ', nameEn: 'Guyana', region: '南米' },
  { id: 'py', isoCode: 'PY', nameJa: 'パラグアイ', nameEn: 'Paraguay', region: '南米' },
  { id: 'sr', isoCode: 'SR', nameJa: 'スリナム', nameEn: 'Suriname', region: '南米' },
  { id: 'uy', isoCode: 'UY', nameJa: 'ウルグアイ', nameEn: 'Uruguay', region: '南米' },
  { id: 've', isoCode: 'VE', nameJa: 'ベネズエラ', nameEn: 'Venezuela', region: '南米' },

  // === アフリカ 50か国 === (既存: MA, EG, ZA, KE)
  { id: 'dz', isoCode: 'DZ', nameJa: 'アルジェリア', nameEn: 'Algeria', region: 'アフリカ' },
  { id: 'ao', isoCode: 'AO', nameJa: 'アンゴラ', nameEn: 'Angola', region: 'アフリカ' },
  { id: 'bj', isoCode: 'BJ', nameJa: 'ベナン', nameEn: 'Benin', region: 'アフリカ' },
  { id: 'bw', isoCode: 'BW', nameJa: 'ボツワナ', nameEn: 'Botswana', region: 'アフリカ' },
  { id: 'bf', isoCode: 'BF', nameJa: 'ブルキナファソ', nameEn: 'Burkina Faso', region: 'アフリカ' },
  { id: 'bi', isoCode: 'BI', nameJa: 'ブルンジ', nameEn: 'Burundi', region: 'アフリカ' },
  { id: 'cv', isoCode: 'CV', nameJa: 'カーボベルデ', nameEn: 'Cabo Verde', region: 'アフリカ' },
  { id: 'cm', isoCode: 'CM', nameJa: 'カメルーン', nameEn: 'Cameroon', region: 'アフリカ' },
  { id: 'cf', isoCode: 'CF', nameJa: '中央アフリカ', nameEn: 'Central African Republic', region: 'アフリカ' },
  { id: 'td', isoCode: 'TD', nameJa: 'チャド', nameEn: 'Chad', region: 'アフリカ' },
  { id: 'km', isoCode: 'KM', nameJa: 'コモロ', nameEn: 'Comoros', region: 'アフリカ' },
  { id: 'cg', isoCode: 'CG', nameJa: 'コンゴ共和国', nameEn: 'Republic of the Congo', region: 'アフリカ' },
  { id: 'cd', isoCode: 'CD', nameJa: 'コンゴ民主共和国', nameEn: 'Democratic Republic of the Congo', region: 'アフリカ' },
  { id: 'ci', isoCode: 'CI', nameJa: 'コートジボワール', nameEn: "Côte d'Ivoire", region: 'アフリカ' },
  { id: 'dj', isoCode: 'DJ', nameJa: 'ジブチ', nameEn: 'Djibouti', region: 'アフリカ' },
  { id: 'gq', isoCode: 'GQ', nameJa: '赤道ギニア', nameEn: 'Equatorial Guinea', region: 'アフリカ' },
  { id: 'er', isoCode: 'ER', nameJa: 'エリトリア', nameEn: 'Eritrea', region: 'アフリカ' },
  { id: 'sz', isoCode: 'SZ', nameJa: 'エスワティニ', nameEn: 'Eswatini', region: 'アフリカ' },
  { id: 'et', isoCode: 'ET', nameJa: 'エチオピア', nameEn: 'Ethiopia', region: 'アフリカ' },
  { id: 'ga', isoCode: 'GA', nameJa: 'ガボン', nameEn: 'Gabon', region: 'アフリカ' },
  { id: 'gm', isoCode: 'GM', nameJa: 'ガンビア', nameEn: 'Gambia', region: 'アフリカ' },
  { id: 'gh', isoCode: 'GH', nameJa: 'ガーナ', nameEn: 'Ghana', region: 'アフリカ' },
  { id: 'gn', isoCode: 'GN', nameJa: 'ギニア', nameEn: 'Guinea', region: 'アフリカ' },
  { id: 'gw', isoCode: 'GW', nameJa: 'ギニアビサウ', nameEn: 'Guinea-Bissau', region: 'アフリカ' },
  { id: 'ls', isoCode: 'LS', nameJa: 'レソト', nameEn: 'Lesotho', region: 'アフリカ' },
  { id: 'lr', isoCode: 'LR', nameJa: 'リベリア', nameEn: 'Liberia', region: 'アフリカ' },
  { id: 'ly', isoCode: 'LY', nameJa: 'リビア', nameEn: 'Libya', region: 'アフリカ' },
  { id: 'mg', isoCode: 'MG', nameJa: 'マダガスカル', nameEn: 'Madagascar', region: 'アフリカ' },
  { id: 'mw', isoCode: 'MW', nameJa: 'マラウイ', nameEn: 'Malawi', region: 'アフリカ' },
  { id: 'ml', isoCode: 'ML', nameJa: 'マリ', nameEn: 'Mali', region: 'アフリカ' },
  { id: 'mr', isoCode: 'MR', nameJa: 'モーリタニア', nameEn: 'Mauritania', region: 'アフリカ' },
  { id: 'mu', isoCode: 'MU', nameJa: 'モーリシャス', nameEn: 'Mauritius', region: 'アフリカ' },
  { id: 'mz', isoCode: 'MZ', nameJa: 'モザンビーク', nameEn: 'Mozambique', region: 'アフリカ' },
  { id: 'na', isoCode: 'NA', nameJa: 'ナミビア', nameEn: 'Namibia', region: 'アフリカ' },
  { id: 'ne', isoCode: 'NE', nameJa: 'ニジェール', nameEn: 'Niger', region: 'アフリカ' },
  { id: 'ng', isoCode: 'NG', nameJa: 'ナイジェリア', nameEn: 'Nigeria', region: 'アフリカ' },
  { id: 'rw', isoCode: 'RW', nameJa: 'ルワンダ', nameEn: 'Rwanda', region: 'アフリカ' },
  { id: 'st', isoCode: 'ST', nameJa: 'サントメ・プリンシペ', nameEn: 'Sao Tome and Principe', region: 'アフリカ' },
  { id: 'sn', isoCode: 'SN', nameJa: 'セネガル', nameEn: 'Senegal', region: 'アフリカ' },
  { id: 'sc', isoCode: 'SC', nameJa: 'セーシェル', nameEn: 'Seychelles', region: 'アフリカ' },
  { id: 'sl', isoCode: 'SL', nameJa: 'シエラレオネ', nameEn: 'Sierra Leone', region: 'アフリカ' },
  { id: 'so', isoCode: 'SO', nameJa: 'ソマリア', nameEn: 'Somalia', region: 'アフリカ' },
  { id: 'ss', isoCode: 'SS', nameJa: '南スーダン', nameEn: 'South Sudan', region: 'アフリカ' },
  { id: 'sd', isoCode: 'SD', nameJa: 'スーダン', nameEn: 'Sudan', region: 'アフリカ' },
  { id: 'tz', isoCode: 'TZ', nameJa: 'タンザニア', nameEn: 'Tanzania', region: 'アフリカ' },
  { id: 'tg', isoCode: 'TG', nameJa: 'トーゴ', nameEn: 'Togo', region: 'アフリカ' },
  { id: 'tn', isoCode: 'TN', nameJa: 'チュニジア', nameEn: 'Tunisia', region: 'アフリカ' },
  { id: 'ug', isoCode: 'UG', nameJa: 'ウガンダ', nameEn: 'Uganda', region: 'アフリカ' },
  { id: 'zm', isoCode: 'ZM', nameJa: 'ザンビア', nameEn: 'Zambia', region: 'アフリカ' },
  { id: 'zw', isoCode: 'ZW', nameJa: 'ジンバブエ', nameEn: 'Zimbabwe', region: 'アフリカ' },

  // === オセアニア 12か国 === (既存: AU, NZ, FJ)
  { id: 'ki', isoCode: 'KI', nameJa: 'キリバス', nameEn: 'Kiribati', region: 'オセアニア' },
  { id: 'mh', isoCode: 'MH', nameJa: 'マーシャル諸島', nameEn: 'Marshall Islands', region: 'オセアニア' },
  { id: 'fm', isoCode: 'FM', nameJa: 'ミクロネシア連邦', nameEn: 'Micronesia', region: 'オセアニア' },
  { id: 'nr', isoCode: 'NR', nameJa: 'ナウル', nameEn: 'Nauru', region: 'オセアニア' },
  { id: 'pw', isoCode: 'PW', nameJa: 'パラオ', nameEn: 'Palau', region: 'オセアニア' },
  { id: 'pg', isoCode: 'PG', nameJa: 'パプアニューギニア', nameEn: 'Papua New Guinea', region: 'オセアニア' },
  { id: 'ws', isoCode: 'WS', nameJa: 'サモア', nameEn: 'Samoa', region: 'オセアニア' },
  { id: 'sb', isoCode: 'SB', nameJa: 'ソロモン諸島', nameEn: 'Solomon Islands', region: 'オセアニア' },
  { id: 'to', isoCode: 'TO', nameJa: 'トンガ', nameEn: 'Tonga', region: 'オセアニア' },
  { id: 'tv', isoCode: 'TV', nameJa: 'ツバル', nameEn: 'Tuvalu', region: 'オセアニア' },
  { id: 'vu', isoCode: 'VU', nameJa: 'バヌアツ', nameEn: 'Vanuatu', region: 'オセアニア' },
  { id: 'ck', isoCode: 'CK', nameJa: 'クック諸島', nameEn: 'Cook Islands', region: 'オセアニア' },
];

// SVG パスがない国の手動座標（viewBox 0 0 360 198 を 100% 換算）
// 既存のパス重心スケール感に合わせた配置
const MANUAL_COORDS = {
  // ペルシャ湾の小国（QA centroid: 64.5,37 / SA centroid: 65,40付近）
  BH: { mapX: 64, mapY: 36 },
  // 南アジア（IN centroid: 73,36 / 印度洋）
  MV: { mapX: 72, mapY: 46 },
  // 欧州マイクロ国家
  AD: { mapX: 46, mapY: 26 },         // ピレネー、FR-ES境
  LI: { mapX: 51, mapY: 23 },         // CH と AT の境
  MT: { mapX: 53, mapY: 28 },         // シチリア南
  MC: { mapX: 49, mapY: 26 },         // 南仏沿岸
  SM: { mapX: 52, mapY: 25 },         // 中部イタリア
  VA: { mapX: 53, mapY: 26 },         // ローマ
  // カリブ小アンティル諸島
  AG: { mapX: 32, mapY: 51 },         // アンティグア
  BB: { mapX: 33, mapY: 53 },         // バルバドス
  DM: { mapX: 32, mapY: 52 },         // ドミニカ国
  GD: { mapX: 32, mapY: 53 },         // グレナダ
  KN: { mapX: 31, mapY: 51 },         // セントクリストファー
  LC: { mapX: 32, mapY: 52 },         // セントルシア
  VC: { mapX: 32, mapY: 53 },         // セントビンセント
  // アフリカ近海
  CV: { mapX: 38, mapY: 50 },         // カーボベルデ (西アフリカ沖)
  KM: { mapX: 59, mapY: 67 },         // コモロ
  MU: { mapX: 61, mapY: 71 },         // モーリシャス
  ST: { mapX: 48, mapY: 60 },         // サントメ
  SC: { mapX: 60, mapY: 64 },         // セーシェル
  // 太平洋諸島
  KI: { mapX: 96, mapY: 62 },         // キリバス
  MH: { mapX: 92, mapY: 58 },         // マーシャル
  FM: { mapX: 88, mapY: 60 },         // ミクロネシア
  NR: { mapX: 91, mapY: 63 },         // ナウル
  PW: { mapX: 85, mapY: 59 },         // パラオ
  WS: { mapX: 95, mapY: 70 },         // サモア
  TO: { mapX: 94, mapY: 73 },         // トンガ
  TV: { mapX: 93, mapY: 67 },         // ツバル
  VU: { mapX: 91, mapY: 71 },         // バヌアツ
  CK: { mapX: 98, mapY: 75 },         // クック諸島
};

const REGION_COLORS = {
  'アジア': { h: 176, s: 54, l: 40 },     // teal
  'ヨーロッパ': { h: 199, s: 60, l: 47 },  // blue
  '北米': { h: 277, s: 28, l: 53 },        // purple
  '南米': { h: 41, s: 70, l: 51 },         // gold
  'アフリカ': { h: 65, s: 50, l: 41 },     // olive
  'オセアニア': { h: 186, s: 41, l: 51 },  // light teal
};

function isoToFlag(iso) {
  return iso.toUpperCase().split('').map((c) => String.fromCodePoint(0x1F1E6 + (c.charCodeAt(0) - 65))).join('');
}

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function hslToHex(h, s, l) {
  // h: 0-360, s: 0-100, l: 0-100
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp >= 0 && hp < 1) { r = c; g = x; }
  else if (hp < 2) { r = x; g = c; }
  else if (hp < 3) { g = c; b = x; }
  else if (hp < 4) { g = x; b = c; }
  else if (hp < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = l - c / 2;
  const to255 = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0').toUpperCase();
  return `#${to255(r)}${to255(g)}${to255(b)}`;
}

function generateAccent(region, isoCode) {
  const base = REGION_COLORS[region];
  if (!base) throw new Error(`Unknown region: ${region}`);
  const hash = hashCode(isoCode);
  // 色相±20度、彩度±10、明度±8 の範囲でバリエーション
  const dh = ((hash % 41) - 20);
  const ds = (((hash >> 5) % 21) - 10);
  const dl = (((hash >> 10) % 17) - 8);
  const h = (base.h + dh + 360) % 360;
  const s = Math.max(25, Math.min(85, base.s + ds));
  const l = Math.max(30, Math.min(62, base.l + dl));
  return hslToHex(h, s, l);
}

function escape(s) {
  return s.replace(/'/g, "\\'");
}

function formatCountry(c) {
  return `  { id: '${c.id}', isoCode: '${c.isoCode}', nameJa: '${escape(c.nameJa)}', nameEn: '${escape(c.nameEn)}', flag: '${c.flag}', region: '${c.region}', continent: '${c.region}', mapX: ${c.mapX}, mapY: ${c.mapY}, accent: '${c.accent}' },`;
}

// === 構築 ===
const all = [...EXISTING];
const missing = [];
for (const n of NEW) {
  const manual = MANUAL_COORDS[n.isoCode];
  const cent = centroids[n.isoCode];
  let mapX, mapY;
  if (manual) {
    mapX = manual.mapX;
    mapY = manual.mapY;
  } else if (cent) {
    mapX = cent.mapX;
    mapY = cent.mapY;
  } else {
    missing.push(n.isoCode);
    continue;
  }
  all.push({
    id: n.id,
    isoCode: n.isoCode,
    nameJa: n.nameJa,
    nameEn: n.nameEn,
    flag: isoToFlag(n.isoCode),
    region: n.region,
    mapX,
    mapY,
    accent: generateAccent(n.region, n.isoCode),
  });
}

if (missing.length > 0) {
  console.error(`Missing coordinates for: ${missing.join(', ')}`);
  process.exit(1);
}

// === 検証 ===
const regions = {};
for (const c of all) {
  regions[c.region] = (regions[c.region] ?? 0) + 1;
}

const ids = new Set();
const dupIds = [];
for (const c of all) {
  if (ids.has(c.id)) dupIds.push(c.id);
  ids.add(c.id);
}

const isos = new Set();
const dupIsos = [];
for (const c of all) {
  if (isos.has(c.isoCode)) dupIsos.push(c.isoCode);
  isos.add(c.isoCode);
}

const outOfRange = all.filter((c) => c.mapX < 0 || c.mapX > 100 || c.mapY < 0 || c.mapY > 100);
const hasJp = all.some((c) => c.id === 'jp');
const hasTw = all.some((c) => c.id === 'tw');

const summary = [
  `Total: ${all.length}`,
  `Asia: ${regions['アジア']}`,
  `Europe: ${regions['ヨーロッパ']}`,
  `NA: ${regions['北米']}`,
  `SA: ${regions['南米']}`,
  `Africa: ${regions['アフリカ']}`,
  `Oceania: ${regions['オセアニア']}`,
  `Japan included: ${hasJp}`,
  `Taiwan included: ${hasTw}`,
  `Duplicate IDs: ${dupIds.length}`,
  `Duplicate ISOs: ${dupIsos.length}`,
  `Out of range: ${outOfRange.length}`,
];
console.error(summary.join('\n'));

if (all.length !== 196) console.error(`WARNING: expected 196, got ${all.length}`);
if (hasJp) console.error(`WARNING: Japan still included!`);
if (!hasTw) console.error(`WARNING: Taiwan missing!`);
if (dupIds.length) console.error(`DUPLICATE IDs: ${dupIds.join(', ')}`);
if (dupIsos.length) console.error(`DUPLICATE ISOs: ${dupIsos.join(', ')}`);
if (outOfRange.length) console.error(`OUT OF RANGE: ${outOfRange.map(c => c.id).join(', ')}`);

// === 出力 ===
const lines = [
  `import type { Country } from '@/types';`,
  ``,
  `export const COUNTRIES: Country[] = [`,
  ...all.map(formatCountry),
  `];`,
  ``,
  `export const COUNTRY_BY_ID = Object.fromEntries(COUNTRIES.map((country) => [country.id, country])) as Record<string, Country>;`,
  ``,
  `export const REGION_ORDER = ['アジア', 'ヨーロッパ', '北米', '南米', 'アフリカ', 'オセアニア'] as const;`,
  ``,
  `export function searchCountries(query: string) {`,
  `  const normalized = query.trim().toLowerCase();`,
  ``,
  `  if (!normalized) {`,
  `    return COUNTRIES;`,
  `  }`,
  ``,
  `  return COUNTRIES.filter((country) =>`,
  `    [country.nameJa, country.nameEn, country.isoCode].some((value) => value.toLowerCase().includes(normalized)),`,
  `  );`,
  `}`,
  ``,
];

console.log(lines.join('\n'));
