import DestinationCard, { type Destination } from './destination-card';

const destinations: Destination[] = [
  {
    id: 1,
    name: 'Vịnh Hạ Long',
    location: 'Quảng Ninh',
    description: 'Di sản Thế giới UNESCO nổi tiếng với vùng nước xanh ngọc và hàng nghìn đảo đá vôi cao chót vót.',
    image: 'https://placehold.co/600x400',
    'data-ai-hint': 'ha long bay',
    rating: 4.9,
    reviews: 2450,
    type: 'default',
  },
  {
    id: 2,
    name: 'Phố cổ Hội An',
    location: 'Quảng Nam',
    description: 'Thị trấn cổ được bảo tồn tốt, được biết đến với kiến trúc, những con kênh và đèn lồng đầy màu sắc.',
    image: 'https://placehold.co/600x400',
    'data-ai-hint': 'hoi an old town',
    rating: 4.8,
    reviews: 1890,
    type: 'verified',
  },
  {
    id: 3,
    name: 'Thành phố Hồ Chí Minh',
    location: 'Sài Gòn',
    description: 'Thành phố sôi động và nhộn nhịp, nổi tiếng với vai trò lịch sử và cuộc sống đường phố sôi động.',
    image: 'https://placehold.co/600x400',
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
    image: 'https://placehold.co/600x400',
    'data-ai-hint': 'hanoi city',
    rating: 4.8,
    reviews: 2800,
    type: 'default',
  },
  {
    id: 5,
    name: 'Sa Pa',
    location: 'Lào Cai',
    description: 'Một thị trấn miền núi đẹp như tranh vẽ, nổi tiếng với những ruộng bậc thang và những chuyến đi bộ đường dài.',
    image: 'https://placehold.co/600x400',
    'data-ai-hint': 'sapa landscape',
    rating: 4.9,
    reviews: 1500,
    type: 'verified',
  },
  {
    id: 6,
    name: 'Đồng bằng sông Cửu Long',
    location: 'Miền Nam Việt Nam',
    description: 'Một mạng lưới sông ngòi, đầm lầy và đảo rộng lớn, nơi có chợ nổi và chùa chiền Khmer.',
    image: 'https://placehold.co/600x400',
    'data-ai-hint': 'mekong delta',
    rating: 4.6,
    reviews: 980,
    type: 'default',
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
