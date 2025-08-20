import DestinationCard, { type Destination } from './destination-card';

const destinations: Destination[] = [
  {
    id: 1,
    name: 'Vịnh Hạ Long',
    location: 'Quảng Ninh',
    description: 'Di sản Thế giới UNESCO nổi tiếng với vùng nước xanh ngọc và hàng nghìn đảo đá vôi cao chót vót.',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=400&fit=crop&q=80',
    'data-ai-hint': 'ha long bay',
    rating: 4.9,
    reviews: 2450,
    type: 'verified',
  },
  {
    id: 2,
    name: 'Phố cổ Hội An',
    location: 'Quảng Nam',
    description: 'Thị trấn cổ được bảo tồn tốt, được biết đến với kiến trúc, những con kênh và đèn lồng đầy màu sắc.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&q=80',
    'data-ai-hint': 'hoi an old town',
    rating: 4.8,
    reviews: 1890,
    type: 'contributor',
  },
  {
    id: 3,
    name: 'Thành phố Hồ Chí Minh',
    location: 'Sài Gòn',
    description: 'Thành phố sôi động và nhộn nhịp, nổi tiếng với vai trò lịch sử và cuộc sống đường phố sôi động.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&q=80',
    'data-ai-hint': 'ho chi minh city',
    rating: 4.7,
    reviews: 3120,
    type: 'partner',
  },
  {
    id: 4,
    name: 'Hà Nội',
    location: 'Thủ đô Việt Nam',
    description: 'Thủ đô của Việt Nam, sự pha trộn quyến rũ giữa ảnh hưởng của Đông Nam Á, Trung Quốc và Pháp.',
    image: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=600&h=400&fit=crop&q=80',
    'data-ai-hint': 'hanoi city',
    rating: 4.8,
    reviews: 2800,
    type: 'contributor',
  },
  {
    id: 5,
    name: 'Sa Pa',
    location: 'Lào Cai',
    description: 'Một thị trấn miền núi đẹp như tranh vẽ, nổi tiếng với những ruộng bậc thang và những chuyến đi bộ đường dài.',
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=400&fit=crop&q=80',
    'data-ai-hint': 'sapa landscape',
    rating: 4.9,
    reviews: 1500,
    type: 'contributor',
  },
  {
    id: 6,
    name: 'Đồng bằng sông Cửu Long',
    location: 'Miền Nam Việt Nam',
    description: 'Một mạng lưới sông ngòi, đầm lầy và đảo rộng lớn, nơi có chợ nổi và chùa chiền Khmer.',
    image: 'https://images.unsplash.com/photo-1559291001-693fb9166cba?w=600&h=400&fit=crop&q=80',
    'data-ai-hint': 'mekong delta',
    rating: 4.6,
    reviews: 980,
    type: 'partner',
  },
];

export default function DestinationGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {destinations.map((destination) => (
        <DestinationCard key={destination.id} destination={destination} />
      ))}
    </div>
  );
}
