// Script to seed real Vietnam tourist destinations
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

// Real Vietnam tourist places data
const vietnamPlaces = [
  {
    name: 'Vịnh Hạ Long',
    slug: 'vinh-ha-long',
    shortDescription: 'Di sản thiên nhiên thế giới UNESCO với hàng nghìn đảo đá vôi kỳ vĩ',
    description: 'Vịnh Hạ Long là một trong những kỳ quan thiên nhiên nổi tiếng nhất Việt Nam, được UNESCO công nhận là Di sản Thiên nhiên Thế giới. Với hơn 1.600 hòn đảo và các dốc đá vôi nhô lên từ nước biển xanh trong, tạo nên một cảnh quan tuyệt đẹp và huyền bí.',
    region: 'bac-bo',
    province: 'Quảng Ninh',
    provinceSlug: 'quang-ninh',
    type: 'bien',
    coordinates: { lat: 20.9101, lng: 107.1839 },
    address: 'Thành phố Hạ Long, Tỉnh Quảng Ninh',
    trustLabel: 'verified',
    source: { type: 'partner', partnerName: 'Sở Du lịch Quảng Ninh' },
    status: 'published',
    rating: { average: 4.8, count: 2847, breakdown: { 5: 1890, 4: 657, 3: 200, 2: 70, 1: 30 } },
    tags: ['UNESCO', 'di sản thế giới', 'vịnh', 'du thuyền', 'thiên nhiên'],
    viewCount: 45230,
    likeCount: 3890,
    featured: true
  },
  {
    name: 'Phố Cổ Hội An',
    slug: 'pho-co-hoi-an',
    shortDescription: 'Thành phố cổ với kiến trúc độc đáo, đèn lồng rực rỡ và ẩm thực phong phú',
    description: 'Hội An là một thành phố cổ quyến rũ với kiến trúc truyền thống được bảo tồn hoàn hảo. Những con phố nhỏ được thắp sáng bởi hàng nghìn đèn lồng tạo nên không khí lãng mạn và cổ kính. Đây là nơi tuyệt vời để khám phá văn hóa, ẩm thực và lịch sử Việt Nam.',
    region: 'trung-bo',
    province: 'Quảng Nam',
    provinceSlug: 'quang-nam',
    type: 'van-hoa',
    coordinates: { lat: 15.8801, lng: 108.335 },
    address: 'Thành phố Hội An, Tỉnh Quảng Nam',
    trustLabel: 'verified',
    source: { type: 'partner', partnerName: 'Sở Du lịch Quảng Nam' },
    status: 'published',
    rating: { average: 4.9, count: 3256, breakdown: { 5: 2404, 4: 652, 3: 150, 2: 35, 1: 15 } },
    tags: ['UNESCO', 'phố cổ', 'đèn lồng', 'văn hóa', 'ẩm thực'],
    viewCount: 52180,
    likeCount: 4320,
    featured: true
  },
  {
    name: 'Sa Pa và Ruộng Bậc Thang',
    slug: 'sa-pa-ruong-bac-thang',
    shortDescription: 'Cao nguyên mây ngàn với ruộng bậc thang tuyệt đẹp và văn hóa dân tộc phong phú',
    description: 'Sa Pa là một thị trấn miền núi nằm ở độ cao 1.500m, nổi tiếng với những ruộng bậc thang tuyệt đẹp và khí hậu mát mẻ quanh năm. Đây là nơi sinh sống của nhiều dân tộc thiểu số với văn hóa đặc sắc và truyền thống lâu đời.',
    region: 'bac-bo',
    province: 'Lào Cai',
    provinceSlug: 'lao-cai',
    type: 'nui',
    coordinates: { lat: 22.3380, lng: 103.8442 },
    address: 'Thị xã Sa Pa, Tỉnh Lào Cai',
    trustLabel: 'contributor',
    source: { type: 'user', userId: 'contributor_001' },
    status: 'published',
    rating: { average: 4.7, count: 1892, breakdown: { 5: 1234, 4: 456, 3: 145, 2: 42, 1: 15 } },
    tags: ['ruộng bậc thang', 'núi', 'dân tộc', 'trekking', 'cao nguyên'],
    viewCount: 32450,
    likeCount: 2890,
    featured: true
  },
  {
    name: 'Bà Nà Hills',
    slug: 'ba-na-hills',
    shortDescription: 'Khu du lịch trên đỉnh núi với Cầu Vàng nổi tiếng và khí hậu Châu Âu',
    description: 'Bà Nà Hills là một khu du lịch độc đáo tọa lạc trên đỉnh núi cao 1.487m, nổi tiếng khắp thế giới với Cầu Vàng - cây cầu được nâng đỡ bởi đôi bàn tay khổng lồ. Nơi đây có khí hậu ôn đới quanh năm và kiến trúc mang phong cách Châu Âu cổ điển.',
    region: 'trung-bo',
    province: 'Đà Nẵng',
    provinceSlug: 'da-nang',
    type: 'check-in',
    coordinates: { lat: 15.9966, lng: 107.9918 },
    address: 'Huyện Hoà Vang, Thành phố Đà Nẵng',
    trustLabel: 'partner',
    source: { type: 'partner', partnerName: 'Sở Du lịch Đà Nẵng' },
    status: 'published',
    rating: { average: 4.6, count: 2134, breakdown: { 5: 1278, 4: 567, 3: 201, 2: 65, 1: 23 } },
    tags: ['cầu vàng', 'cáp treo', 'check-in', 'châu âu', 'núi'],
    viewCount: 89320,
    likeCount: 7650,
    featured: true
  },
  {
    name: 'Chợ Nổi Cái Răng',
    slug: 'cho-noi-cai-rang',
    shortDescription: 'Chợ nổi lớn nhất miền Tây với đặc sản trái cây và văn hóa sông nước',
    description: 'Chợ nổi Cái Răng là một trong những chợ nổi lớn nhất và nổi tiếng nhất ở đồng bằng sông Cửu Long. Nơi đây quy tụ hàng trăm chiếc ghe bán đầy ắp trái cây tươi ngon và đặc sản miền Tây, tạo nên một khung cảnh sông nước đầy màu sắc.',
    region: 'nam-bo',
    province: 'Cần Thơ',
    provinceSlug: 'can-tho',
    type: 'van-hoa',
    coordinates: { lat: 10.0150, lng: 105.7430 },
    address: 'Quận Cái Răng, Thành phố Cần Thơ',
    trustLabel: 'contributor',
    source: { type: 'user', userId: 'contributor_002' },
    status: 'published',
    rating: { average: 4.5, count: 1456, breakdown: { 5: 856, 4: 423, 3: 127, 2: 38, 1: 12 } },
    tags: ['chợ nổi', 'sông nước', 'trái cây', 'miền tây', 'văn hóa'],
    viewCount: 23180,
    likeCount: 1890,
    featured: false
  },
  {
    name: 'Đảo Phú Quốc',
    slug: 'dao-phu-quoc',
    shortDescription: 'Đảo ngọc với bãi biển xanh trong, hải sản tươi ngon và khu nghỉ dưỡng cao cấp',
    description: 'Phú Quốc được mệnh danh là "đảo ngọc" của Việt Nam với những bãi biển đẹp nhất thế giới, nước biển trong vắt và cát trắng mịn. Đây là điểm đến lý tưởng cho nghỉ dưỡng với nhiều resort cao cấp, hải sản tươi ngon và các hoạt động thể thao biển hấp dẫn.',
    region: 'nam-bo',
    province: 'Kiên Giang',
    provinceSlug: 'kien-giang',
    type: 'bien',
    coordinates: { lat: 10.2899, lng: 103.9840 },
    address: 'Thành phố Phú Quốc, Tỉnh Kiên Giang',
    trustLabel: 'verified',
    source: { type: 'partner', partnerName: 'Sở Du lịch Kiên Giang' },
    status: 'published',
    rating: { average: 4.8, count: 3890, breakdown: { 5: 2723, 4: 856, 3: 234, 2: 56, 1: 21 } },
    tags: ['đảo', 'biển', 'resort', 'hải sản', 'nghỉ dưỡng'],
    viewCount: 78450,
    likeCount: 6780,
    featured: true
  },
  {
    name: 'Tràng An Ninh Bình',
    slug: 'trang-an-ninh-binh',
    shortDescription: 'Quần thể di sản thế giới với hang động kỳ bí và cảnh quan karst tuyệt đẹp',
    description: 'Tràng An là quần thể di sản văn hóa và thiên nhiên thế giới duy nhất ở Việt Nam, nổi tiếng với hệ thống hang động phong phú và cảnh quan núi đá vôi hùng vĩ. Du khách có thể khám phá bằng thuyền kayak qua các hang động và ngắm cảnh thiên nhiên tuyệt đẹp.',
    region: 'bac-bo',
    province: 'Ninh Bình',
    provinceSlug: 'ninh-binh',
    type: 'van-hoa',
    coordinates: { lat: 20.2500, lng: 105.9167 },
    address: 'Huyện Hoa Lư, Tỉnh Ninh Bình',
    trustLabel: 'verified',
    source: { type: 'partner', partnerName: 'Sở Du lịch Ninh Bình' },
    status: 'published',
    rating: { average: 4.7, count: 2567, breakdown: { 5: 1823, 4: 567, 3: 134, 2: 32, 1: 11 } },
    tags: ['UNESCO', 'hang động', 'thuyền kayak', 'núi đá vôi', 'di sản thế giới'],
    viewCount: 34560,
    likeCount: 2890,
    featured: true
  },
  {
    name: 'Bãi biển Mỹ Khê',
    slug: 'bai-bien-my-khe',
    shortDescription: 'Một trong những bãi biển đẹp nhất thế giới với cát trắng và sóng êm',
    description: 'Bãi biển Mỹ Khê ở Đà Nẵng được tạp chí Forbes bình chọn là một trong những bãi biển quyến rũ nhất hành tinh. Với bờ cát trắng mịn trải dài, nước biển trong xanh và sóng nhẹ, đây là nơi lý tưởng để tắm biển và thư giãn.',
    region: 'trung-bo',
    province: 'Đà Nẵng',
    provinceSlug: 'da-nang',
    type: 'bien',
    coordinates: { lat: 16.0471, lng: 108.2068 },
    address: 'Quận Ngũ Hành Sơn, Thành phố Đà Nẵng',
    trustLabel: 'partner',
    source: { type: 'partner', partnerName: 'Sở Du lịch Đà Nẵng' },
    status: 'published',
    rating: { average: 4.6, count: 1987, breakdown: { 5: 1287, 4: 498, 3: 145, 2: 42, 1: 15 } },
    tags: ['bãi biển', 'Forbes', 'cát trắng', 'sóng êm', 'tắm biển'],
    viewCount: 45670,
    likeCount: 3890,
    featured: false
  },
  {
    name: 'Đà Lạt - Thành phố Ngàn Hoa',
    slug: 'da-lat-thanh-pho-ngan-hoa',
    shortDescription: 'Thành phố mát mẻ với khí hậu Châu Âu, hoa đa dạng và kiến trúc Pháp cổ',
    description: 'Đà Lạt là thành phố cao nguyên nổi tiếng với khí hậu mát mẻ quanh năm, những vườn hoa rực rỡ và kiến trúc Pháp cổ kính. Được mệnh danh là "Paris nhỏ" của Việt Nam, Đà Lạt là điểm đến lý tưởng cho những ai yêu thích không khí lãng mạn và thiên nhiên.',
    region: 'nam-bo',
    province: 'Lâm Đồng',
    provinceSlug: 'lam-dong',
    type: 'nui',
    coordinates: { lat: 11.9404, lng: 108.4583 },
    address: 'Thành phố Đà Lạt, Tỉnh Lâm Đồng',
    trustLabel: 'contributor',
    source: { type: 'user', userId: 'contributor_001' },
    status: 'published',
    rating: { average: 4.8, count: 4567, breakdown: { 5: 3289, 4: 934, 3: 234, 2: 78, 1: 32 } },
    tags: ['cao nguyên', 'hoa', 'kiến trúc pháp', 'mát mẻ', 'lãng mạn'],
    viewCount: 67890,
    likeCount: 5670,
    featured: true
  },
  {
    name: 'Mũi Né',
    slug: 'mui-ne',
    shortDescription: 'Bãi biển nhiệt đới với đồi cát đỏ và trắng độc đáo, lý tưởng cho lướt ván',
    description: 'Mũi Né là một trong những bãi biển đẹp nhất Việt Nam, nổi tiếng với đồi cát đỏ và đồi cát trắng kỳ thú. Với gió biển mạnh quanh năm, đây là thiên đường của những người yêu thích lướt ván diều và các môn thể thao biển.',
    region: 'nam-bo',
    province: 'Bình Thuận',
    provinceSlug: 'binh-thuan',
    type: 'bien',
    coordinates: { lat: 10.9334, lng: 108.2828 },
    address: 'Thành phố Phan Thiết, Tỉnh Bình Thuận',
    trustLabel: 'community',
    source: { type: 'user', userId: 'traveler_001' },
    status: 'published',
    rating: { average: 4.4, count: 1678, breakdown: { 5: 923, 4: 534, 3: 156, 2: 48, 1: 17 } },
    tags: ['bãi biển', 'đồi cát', 'lướt ván diều', 'thể thao biển', 'nhiệt đới'],
    viewCount: 28970,
    likeCount: 2340,
    featured: false
  }
];

async function seedVietnamPlaces() {
  try {
    console.log('🇻🇳 Seeding Vietnam tourist destinations...\n');
    
    const batch = db.batch();
    
    // Clear existing places first (optional)
    const existingPlaces = await db.collection('places').get();
    console.log(`Clearing ${existingPlaces.size} existing places...`);
    existingPlaces.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Add Vietnam places
    vietnamPlaces.forEach((place, index) => {
      const placeData = {
        ...place,
        createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(), // Spread over days
        updatedAt: new Date().toISOString(),
        publishedAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(),
        createdBy: place.source.userId || 'partner_001',
        reportCount: 0,
        images: [
          `https://images.unsplash.com/${place.slug}-1?w=800&h=600&fit=crop`,
          `https://images.unsplash.com/${place.slug}-2?w=800&h=600&fit=crop`,
          `https://images.unsplash.com/${place.slug}-3?w=800&h=600&fit=crop`
        ]
      };
      
      const docRef = db.collection('places').doc();
      batch.set(docRef, placeData);
    });
    
    await batch.commit();
    
    console.log(`✅ Successfully seeded ${vietnamPlaces.length} Vietnam tourist destinations`);
    
    // Verify the data
    const verifyQuery = await db.collection('places').where('status', '==', 'published').get();
    console.log(`📊 Total published places in database: ${verifyQuery.size}`);
    
    // Show breakdown by region
    const regions = {};
    const types = {};
    verifyQuery.forEach(doc => {
      const data = doc.data();
      regions[data.region] = (regions[data.region] || 0) + 1;
      types[data.type] = (types[data.type] || 0) + 1;
    });
    
    console.log('\n📍 Places by region:');
    Object.entries(regions).forEach(([region, count]) => {
      const regionNames = {
        'bac-bo': 'Bắc Bộ',
        'trung-bo': 'Trung Bộ', 
        'nam-bo': 'Nam Bộ'
      };
      console.log(`   ${regionNames[region]}: ${count} places`);
    });
    
    console.log('\n🏷️ Places by type:');
    Object.entries(types).forEach(([type, count]) => {
      const typeNames = {
        'bien': 'Biển',
        'nui': 'Núi',
        'van-hoa': 'Văn hóa',
        'am-thuc': 'Ẩm thực',
        'check-in': 'Check-in'
      };
      console.log(`   ${typeNames[type]}: ${count} places`);
    });
    
    console.log('\n🚀 Ready to test:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Visit: /places');
    console.log('3. Visit: / (homepage should show featured places)');
    console.log('4. Test contribute flow: /contribute/new-place');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Vietnam places:', error);
    process.exit(1);
  }
}

seedVietnamPlaces();