// Seed content for Surasang. This is the single source for:
//   1. the site's fallback content when no CMS is configured (src/lib/cms.js), and
//   2. the CloudIA import files written by scripts/export-seed.mjs.
// Prices and descriptions come from the Surasang PDF menu and the Pocha menu boards (2025).
// Once the CMS is live, edit content there; this file only matters for first import and offline builds.

export const settings = {
  name: 'Surasang',
  heroTitle: 'Charcoal, broth and the king’s table',
  heroText: 'Korean BBQ and hot pot cooked at your table in Parkhurst. Pocha’s street food now shares the menu.',
  googleRating: 4.5,
  googleReviews: 689,
  uberEatsUrl:
    'https://www.ubereats.com/store/surasang-korean-bbq-&-hotpot/pRGU6jq5Si-Ij00FtNmMhw?diningMode=DELIVERY',
  instagram: 'https://www.instagram.com/surasangkoreanbbq',
  tiktok: 'https://www.tiktok.com/@surasangkoreanbbq',
  facebook: 'https://www.facebook.com/profile.php?id=61550894874036',
  pochaInstagram: 'https://www.instagram.com/pochajhb/',
  pochaTiktok: 'https://www.tiktok.com/@pochajhb',
  menuPdf: '/surasang-menu.pdf',
  announcementOn: true,
  announcementTitle: 'Sunninghill is moving to Dainfern',
  announcementText:
    'Our Sunninghill restaurant is moving to Dainfern, Fourways. We will post the new address here as soon as the doors open.',
}

export const sections = [
  {
    slug: 'bbq', title: 'Korean BBQ', korean: '숯불구이', brand: 'surasang', order: 10,
    intro: 'Meat goes on the grill set into your table. You cook, we keep the banchan coming.',
    note: 'Minimum two portions to grill at the table; a single portion is cooked in the kitchen. Served with lettuce, kimchi and side dishes.',
    image: '/img/bbq-flame.webp',
  },
  {
    slug: 'hot-pot', title: 'Hot pot', korean: '샤브샤브', brand: 'surasang', order: 20,
    intro: 'Shabu shabu: a pot of broth on the table, thin beef and vegetables to dip, porridge at the end.',
    note: 'Minimum order two portions.',
    image: '/img/hotpot-dip.webp',
  },
  {
    slug: 'stew', title: 'Stews', korean: '찌개', brand: 'surasang', order: 30,
    intro: 'Bubbling in an earthenware pot when it reaches you.',
    note: 'Every stew comes with rice and banchan.',
    image: '/img/kimchi.webp',
  },
  {
    slug: 'to-start', title: 'To start', korean: '전채', brand: 'surasang', order: 40,
    intro: null, note: null, image: '/img/banchan.webp',
  },
  {
    slug: 'street', title: 'Street food', korean: '분식', brand: 'surasang', order: 50,
    intro: null, note: null, image: '/img/kimbap.webp',
  },
  {
    slug: 'rice-noodles', title: 'Rice & noodles', korean: '밥 · 면', brand: 'surasang', order: 60,
    intro: null, note: null, image: '/img/noodle-soup.webp',
  },
  {
    slug: 'pocha-share', title: 'Designed to share', korean: '함께', brand: 'pocha', order: 70,
    intro: 'Big pans and pots for two or three, finished at the table. Ask for fried rice in the leftover sauce.',
    note: 'Pocha dishes are served at Pocha Parkhurst, next door.',
    image: '/img/pocha-dakgalbi.webp',
  },
  {
    slug: 'pocha-small', title: 'Pocha plates', korean: '안주', brand: 'pocha', order: 80,
    intro: 'Fried chicken, skewers and pancakes. The things you order with soju.',
    note: null, image: null,
  },
  {
    slug: 'pocha-rice', title: 'Pocha rice, soup & noodles', korean: '식사', brand: 'pocha', order: 90,
    intro: null, note: null, image: null,
  },
  {
    slug: 'dessert', title: 'Dessert', korean: '후식', brand: 'surasang', order: 100,
    intro: null, note: null, image: null,
  },
  {
    slug: 'drinks', title: 'Drinks', korean: '술 · 음료', brand: 'surasang', order: 110,
    intro: null, note: 'Whisky, cognac, vodka and gin are available. Ask your waiter for the selection.',
    image: null,
  },
]

let order = 0
const item = (section, name, korean, price, description = null, extra = {}) => ({
  slug: `${section}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name, korean, section, price, description,
  priceLabel: null, group: null, options: null, tags: [], serves: null, image: null,
  order: (order += 10), available: true,
  ...extra,
})

export const items = [
  // BBQ
  item('bbq', 'Rib eye', '등심', 229, 'Beef steak from the rib section', { group: 'Beef' }),
  item('bbq', 'Brisket', '차돌박이', 229, 'Thin-sliced beef brisket, grilled for seconds', { group: 'Beef' }),
  item('bbq', 'Bulgogi', '불고기', 229, 'Thin beef in a soy and fruit bulgogi marinade', { group: 'Beef', tags: ['signature'] }),
  item('bbq', 'Samgyeopsal', '삼겹살', 199, 'Korean-style pork belly', { group: 'Pork' }),
  item('bbq', 'Thin samgyeopsal', '대패 삼겹살', 199, 'Shaved pork belly', { group: 'Pork' }),
  item('bbq', 'Pork galbi', '돼지갈비', 229, 'Marinated pork rib', { group: 'Pork' }),
  item('bbq', 'Beef BBQ set', '소고기 세트', 659,
    'Two portions of assorted beef, steamed egg bomb, doenjang jjigae, two rice, banchan and two ice creams',
    { group: 'Sets for two', tags: ['signature', 'share'], serves: '2' }),
  item('bbq', 'Pork BBQ set', '돼지고기 세트', 649,
    'Two portions of assorted pork, steamed egg bomb, doenjang jjigae, two rice, banchan and two ice creams',
    { group: 'Sets for two', tags: ['share'], serves: '2' }),
  item('bbq', 'Pork galbi set', '갈비 세트', 659,
    'Two portions of pork galbi, steamed egg bomb, doenjang jjigae, two rice, banchan and two ice creams',
    { group: 'Sets for two', tags: ['share'], serves: '2' }),

  // Hot pot
  item('hot-pot', 'Shabu shabu set', '샤브샤브', 249,
    'Per portion: sliced beef (120 g), vegetables, mushrooms, mandu, fish balls and tofu',
    { group: 'The set', tags: ['signature', 'share'], priceLabel: 'R249 pp' }),
  item('hot-pot', 'Korean broth', '육수', 0, 'The house soup base', { group: 'Broth' }),
  item('hot-pot', 'Spicy chilli broth, half', '반 매운 육수', 49, 'Half the pot spicy', { group: 'Broth', tags: ['spicy'] }),
  item('hot-pot', 'Spicy chilli broth, full', '매운 육수', 89, 'The whole pot spicy', { group: 'Broth', tags: ['spicy'] }),
  item('hot-pot', 'Beef (120 g)', '소고기', 99, null, { group: 'Add to the pot' }),
  item('hot-pot', 'Vegetables', '야채', 99, null, { group: 'Add to the pot' }),
  item('hot-pot', 'Mushrooms', '버섯', 49, null, { group: 'Add to the pot' }),
  item('hot-pot', 'Mandu (3)', '만두', 49, null, { group: 'Add to the pot' }),
  item('hot-pot', 'Fish balls', '어묵', 59, null, { group: 'Add to the pot' }),
  item('hot-pot', 'Noodles', '면', 49, null, { group: 'Add to the pot' }),
  item('hot-pot', 'Rice porridge', '죽', 49, 'Cooked in what is left of the broth', { group: 'Add to the pot' }),

  // Stew
  item('stew', 'Kimchi jjigae', '김치찌개', 169, 'Kimchi stew'),
  item('stew', 'Doenjang jjigae', '된장찌개', 169, 'Soybean paste stew'),
  item('stew', 'Sundubu jjigae', '순두부찌개', 169, 'Soft tofu stew'),
  item('stew', 'Budae jjigae', '부대찌개', 249, 'Sausage stew with rice and noodles', { tags: ['share'] }),
  item('stew', 'Dwaeji gukbap', '돼지국밥', 199, 'Traditional pork soup with rice'),
  item('stew', 'Gamjatang', '뼈해장국', 199, 'Pork backbone soup'),

  // To start
  item('to-start', 'Tofu salad', '두부샐러드', 89, 'Tofu with a spicy soy dressing', { tags: ['spicy'] }),
  item('to-start', 'House salad', '샐러드', 99, 'Leaves with a Korean-style dressing', { options: 'Add chicken +R39' }),
  item('to-start', 'Mandu', '만두', 89, 'Deep-fried Korean dumplings'),
  item('to-start', 'Dakgangjeong', '닭강정', 89, 'Fried chicken, glazed'),
  item('to-start', 'Japchae', '잡채', 159, 'Stir-fried glass noodles and vegetables'),
  item('to-start', 'Kimchi jeon', '김치전', 149, 'Kimchi pancake'),
  item('to-start', 'Pajeon', '파전', 179, 'Seafood and spring onion pancake', { tags: ['share'] }),
  item('to-start', 'Steamed egg bomb', '계란찜', 99, 'Egg steamed in a stone pot until it rises over the rim'),

  // Street food
  item('street', 'Kimbap', '김밥', 89, 'Korean rice roll', { options: 'Add cheese +R10\nAdd tuna +R15' }),
  item('street', 'Tteokbokki', '떡볶이', 149, 'Rice cakes in red chilli paste sauce with vegetables', { tags: ['spicy'], options: 'Add cheese +R40' }),
  item('street', 'K-chicken, half', '치킨 반마리', 135, 'Korean fried chicken', { options: 'Sweet chilli, soy garlic or volcano +R15' }),
  item('street', 'K-chicken, whole', '치킨 한마리', 230, 'Korean fried chicken', { tags: ['share'], options: 'Sweet chilli, soy garlic or volcano +R30' }),
  item('street', 'Donkatsu', '돈가스', 179, 'Korean pork cutlet'),
  item('street', 'Fish cutlet', '생선가스', 179, 'Hake cutlet with tartar sauce'),

  // Rice & noodles
  item('rice-noodles', 'Jeyuk rice', '제육볶음', 179, 'Spicy stir-fried pork with rice', { group: 'Rice', tags: ['spicy'] }),
  item('rice-noodles', 'Bulgogi rice', '뚝배기 불고기', 179, 'Bulgogi beef in a hot clay pot, with rice', { group: 'Rice' }),
  item('rice-noodles', 'Kimchi fried rice', '김치볶음밥', 149, 'Topped with a fried egg', { group: 'Rice' }),
  item('rice-noodles', 'Dolsot bibimbap', '돌솥 비빔밥', 159, 'Rice, vegetables and egg in a hot stone bowl, with chilli paste', { group: 'Rice' }),
  item('rice-noodles', 'Ramen', '라면', 89, 'Spicy Korean noodle soup', {
    group: 'Noodles', tags: ['spicy'], options: 'Egg +R10\nCheese, beef or pork +R15',
  }),
  item('rice-noodles', 'Janchi guksu', '잔치국수', 149, 'Banquet noodle soup with beef', { group: 'Noodles' }),
  item('rice-noodles', 'Mul naengmyeon', '물냉면', 179, 'Cold buckwheat noodles in chilled broth', { group: 'Noodles' }),
  item('rice-noodles', 'Bibim naengmyeon', '비빔냉면', 179, 'Cold buckwheat noodles in chilli dressing', { group: 'Noodles', tags: ['spicy'] }),

  // Pocha: designed to share
  item('pocha-share', 'Dak-galbi', '닭갈비', 430,
    'Chicken stir-fried on a hot plate at the table with gochujang, cabbage, sweet potato and rice cakes. Fry rice in what is left.',
    { serves: '2-3', tags: ['spicy', 'share', 'signature'], image: '/img/pocha-dakgalbi.webp',
      options: 'Rosé or teriyaki +R20\nUdon, ramen, cheese, rice cake or fried rice +R40\nSweet potato +R30' }),
  item('pocha-share', 'Dak-bokkeumtang', '닭볶음탕', 430,
    'Chicken braised with potato, carrot and onion in a spicy gochujang broth',
    { serves: '2-3', tags: ['spicy', 'share'], image: '/img/chicken-stew.webp', options: 'Udon, ramen, steamed rice or fried rice +R40' }),
  item('pocha-share', 'Hot pot tteokbokki', '즉석떡볶이', 360,
    'Rice cakes, fish cakes, ramen, vegetables and boiled eggs simmered at the table in gochujang',
    { serves: '2-3', tags: ['spicy', 'share'], options: 'Ramen, jjolmyeon, cheese or fried rice +R40' }),
  item('pocha-share', 'Dak-hanmari', '닭한마리', 430,
    'A whole chicken simmered with garlic and spring onion, with knife-cut noodles. Turn the last of the soup into porridge.',
    { serves: '2-3', tags: ['share'], image: '/img/noodle-soup.webp', options: 'Noodles or rice porridge +R40' }),
  item('pocha-share', 'Jjimdak', '찜닭', 430,
    'Chicken braised in soy with glass noodles, potato, carrot, garlic and ginger. Sweet, savoury, a little heat.',
    { serves: '2-3', tags: ['share'], image: '/img/braised-chicken.webp', options: 'Steamed rice +R30' }),

  // Pocha plates
  item('pocha-small', 'Korean chicken', '치킨', 155, 'Double-fried chicken in the sauce you choose', {
    priceLabel: 'R155 / R255', tags: ['signature'], options: 'Half or whole\nSweet chilli or soy garlic +R15 / +R30',
  }),
  item('pocha-small', 'Chicken wings', '닭날개', 95, 'Wings in sweet chilli sauce'),
  item('pocha-small', 'Grilled chicken skewers', '닭꼬치', 95, 'Two skewers in a savoury-sweet glaze', { options: 'Teriyaki or hot spicy +R20' }),
  item('pocha-small', 'Honey butter garlic chips', '허니버터 감자튀김', 95, 'Fries in sweet honey butter'),
  item('pocha-small', 'Sotteok sotteok', '소떡소떡', 105, 'Sausage and rice cake skewers in sweet chilli sauce', { tags: ['spicy'] }),
  item('pocha-small', 'Tofu kimchi', '두부김치', 110, 'Stir-fried kimchi with sliced, boiled tofu'),
  item('pocha-small', 'Potato pancake', '감자전', 105, 'Grated potato, pan-fried until crisp', { options: 'Cheese +R30' }),
  item('pocha-small', 'Mung bean pancake', '빈대떡', 120, 'Ground mung beans with kimchi and spring onion'),
  item('pocha-small', 'Sweet corn cheese', '콘치즈', 95, 'Sweet corn under melted cheese'),
  item('pocha-small', 'Ssoya', '쏘야', 115, 'Stir-fried sausage with onion, pepper and carrot'),
  item('pocha-small', 'Chicken gizzards', '닭똥집', 120, 'Stir-fried with garlic', { options: 'Hot spicy +R20' }),
  item('pocha-small', 'Fried chicken gizzards', '닭똥집 튀김', 120, 'Crisp outside, tender inside'),
  item('pocha-small', 'Spicy chicken feet', '닭발', 140, 'For people who know', { tags: ['spicy'] }),
  item('pocha-small', 'Pocha salad', '포차 샐러드', 115, 'Fresh vegetables with the house dressing'),
  item('pocha-small', 'Chilled chicken salad', '닭냉채', 120, 'Cold chicken and vegetables in a vinegar dressing', { options: 'Mustard or chilli sauce' }),

  // Pocha rice, soup & noodles
  item('pocha-rice', 'Chicken rice bowl', '닭덮밥', 185, 'Stir-fried chicken over rice', { options: 'Red chilli or teriyaki sauce' }),
  item('pocha-rice', 'Vegetable fried rice', '야채볶음밥', 155, null),
  item('pocha-rice', 'Ham fried rice', '햄볶음밥', 165, 'With ham and Spam'),
  item('pocha-rice', 'Kimchi fried rice', '김치볶음밥', 165, null),
  item('pocha-rice', 'Chicken soup', '닭곰탕', 165, 'Chicken simmered with herbs, served with rice'),
  item('pocha-rice', 'Spicy chicken soup', '닭개장', 185, 'Shredded chicken and vegetables in a chilli broth, with rice', { tags: ['spicy'] }),
  item('pocha-rice', 'Jjajang noodles', '짜장면', 115, 'Noodles in black bean sauce', { options: 'Cheese or egg +R15' }),
  item('pocha-rice', 'Buldak noodles', '불닭볶음면', 115, 'Fiery gochujang stir-fried noodles', { tags: ['spicy'], options: 'Cheese or egg +R15' }),
  item('pocha-rice', 'Cold buckwheat noodles', '막국수', 185, 'In chilled broth, tangy and a little spicy', { options: 'Broth, bibim or sesame oil' }),

  // Dessert
  item('dessert', 'Bingsu', '팥빙수', 89, 'Snowflake shaved ice with sweet red beans'),
  item('dessert', 'Waffle', '와플', 89, null),
  item('dessert', 'Ice cream', '아이스크림', 39, null),
  item('dessert', 'Golden fish', '붕어빵', 95, 'Fish-shaped pastry with sweet red bean, with ice cream', { group: 'At Pocha', image: '/img/golden-fish.webp' }),
  item('dessert', 'Coffee bean bread', '커피콩빵', 95, 'Soft mini buns with coffee filling, with ice cream', { group: 'At Pocha', image: '/img/coffee-bean-bread.webp' }),
  item('dessert', 'Pocha ice cream', '아이스크림', 49, null, { group: 'At Pocha', image: '/img/ice-cream.webp' }),

  // Drinks
  ...[
    ['Korean liquor', [['Soju', '소주', 150, 'Ask which flavours are in'], ['Makgeolli', '막걸리', 150, 'Korean rice wine']]],
    ['Beer', [['Castle Lite, Amstel or Hansa', null, 32], ['Heineken or Stella', null, 37], ['Windhoek Draught', null, 45], ['Corona', null, 45], ['Guinness', null, 150]]],
    ['Cocktails', [['Mojito', null, 65], ['Piña colada', null, 70], ['Strawberry daiquiri', null, 70], ['Sex on the beach', null, 65], ['Margarita', null, 80]]],
    ['Red wine', [['Porcupine Ridge Shiraz', null, 180], ['Spier Pinotage', null, 220], ['Spier Merlot', null, 220], ['Spier Cabernet Sauvignon', null, 220], ['Beyerskloof Pinotage', null, 255], ['Warwick First Lady Cabernet Sauvignon', null, 285], ['Fat Bastard Merlot', null, 335], ['The Chocolate Block', null, 565], ['Meerlust Merlot', null, 850]]],
    ['White wine', [['Spier Chardonnay', null, 165], ['Spier Sauvignon Blanc', null, 190], ['Spier Chenin Blanc', null, 190], ['Fat Bastard Chardonnay', null, 255], ['Cederberg Sauvignon Blanc', null, 260]]],
    ['Coffee & tea', [['Americano, hot or iced', null, 35], ['Latte, hot or iced', null, 38], ['Cappuccino, hot or iced', null, 38], ['Espresso', null, 24, null, 'R24 / R26'], ['Yuja tea, hot or iced', '유자차', 39], ['Maesil tea, hot or iced', '매실차', 39]]],
    ['Cold drinks', [['Water, still or sparkling', null, 20], ['Coke, Sprite or Fanta', null, 30], ['Juice', null, 30], ['Grapetiser or Appletiser', null, 35], ['Aloe drink', null, 38], ['Rock shandy or Steelworks', null, 50], ['Passion fruit lemonade', null, 50]]],
  ].flatMap(([group, list]) =>
    list.map(([name, korean, price, description = null, priceLabel = null]) =>
      item('drinks', name, korean, price, description, { group, priceLabel }),
    ),
  ),
]

export const branches = [
  {
    slug: 'parkhurst', name: 'Surasang Parkhurst', area: 'Parkhurst', status: 'open', order: 10,
    address: 'Shop 2, Parkhurst Square, 38 4th Ave, Parkhurst, Randburg 2193',
    phone: '+27 65 737 4266', whatsapp: '+27 65 737 4266', email: null,
    mapUrl: 'https://maps.google.com/?q=Surasang+Korean+BBQ+Parkhurst',
    dineplanKey: 'rV7fQwH0', hours: null,
    note: 'Pocha is next door.', image: '/img/bbq-table.webp',
  },
  {
    slug: 'pocha-parkhurst', name: 'Pocha Parkhurst', area: 'Parkhurst', status: 'open', order: 20,
    address: '38 4th Ave, Parkhurst, Johannesburg 2193',
    phone: '+27 78 953 8995', whatsapp: '+27 78 953 8995', email: 'pochajhb@gmail.com',
    mapUrl: 'https://maps.google.com/?q=Pocha+38+4th+Ave+Parkhurst',
    dineplanKey: '62vmTH89', hours: 'Tue to Sun, 11:00 to 22:00. Closed Mondays.',
    note: 'Next door to Surasang.', image: '/img/pocha-tent.webp',
  },
  {
    slug: 'dainfern', name: 'Surasang Dainfern', area: 'Dainfern, Fourways', status: 'moving', order: 30,
    address: 'New address coming soon',
    phone: '+27 83 497 8177', whatsapp: '+27 83 497 8177', email: null,
    mapUrl: null,
    dineplanKey: '2HCJP3tW', hours: null,
    note: 'Moving from The Square, Sunninghill.', image: '/img/hotpot-wide.webp',
  },
]

export const reviews = [
  { slug: 'lerato', author: 'Lerato Lichaba', source: 'Google', order: 10,
    quote: 'The service is top tier from arrival to finish. If you want a Korean experience in the heart of Joburg, come here.' },
  { slug: 'chad', author: 'Chad Ellenson', source: 'Google', order: 20,
    quote: 'Highly recommend the tteokbokki. The beef ramen is probably one of the tastiest I have had.' },
  { slug: 'sara', author: 'Sara Lubis', source: 'Google', order: 30,
    quote: 'We ordered Korean chicken and ramen. The chicken was soft and succulent, marinated perfectly. Seriously finger-lickin’ good.' },
  { slug: 'olivia', author: 'Olivia G', source: 'Google', order: 40,
    quote: 'Awesome place to enjoy authentic Korean cuisine.' },
]
