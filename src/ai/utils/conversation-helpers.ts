// src/ai/utils/conversation-helpers.ts
// Utility functions for natural conversation flow

/**
 * Intent Detection - Simplified for reliability
 */
export type ConversationIntent =
  | 'explore'      // "Gợi ý địa điểm", "đề xuất", "nên đi đâu"
  | 'plan'         // "Lập kế hoạch", "lịch trình"
  | 'budget'       // "Chi phí", "giá cả", "bao nhiêu tiền"
  | 'timing'       // "Khi nào đi", "thời điểm", "mùa nào"
  | 'info'         // "Có gì", "làm gì", thông tin cụ thể
  | 'chitchat'     // Chào hỏi, tán gẫu
  | 'unclear';     // Không rõ ràng

/**
 * Edge Cases - Situations requiring special handling
 */
export type EdgeCase =
  | 'out_of_scope'     // Không liên quan du lịch (chính trị, y tế, etc.)
  | 'inappropriate'    // Nội dung không phù hợp
  | 'too_vague'        // Quá mơ hồ, thiếu context
  | 'complex'          // Phức tạp, cần chia nhỏ
  | null;

/**
 * Detect user intent from message
 */
export function detectIntent(message: string): ConversationIntent {
  const msg = message.toLowerCase().trim();

  // Chitchat patterns
  if (
    msg.match(/^(xin chào|chào|hello|hi|hey|helo)\b/i) ||
    msg.match(/\b(cảm ơn|thanks|thank you|cám ơn)\b/i) ||
    msg.match(/\b(tạm biệt|bye|goodbye)\b/i)
  ) {
    return 'chitchat';
  }

  // Explore patterns - user wants suggestions
  if (
    msg.includes('gợi ý') ||
    msg.includes('đề xuất') ||
    msg.includes('nên đi') ||
    msg.includes('địa điểm') ||
    msg.includes('nơi nào') ||
    msg.includes('đâu')
  ) {
    return 'explore';
  }

  // Planning patterns - detailed itinerary
  if (
    msg.includes('lịch trình') ||
    msg.includes('kế hoạch') ||
    msg.includes('chi tiết') ||
    msg.includes('từng ngày') ||
    msg.includes('hành trình')
  ) {
    return 'plan';
  }

  // Budget patterns
  if (
    msg.includes('giá') ||
    msg.includes('chi phí') ||
    msg.includes('ngân sách') ||
    msg.includes('bao nhiêu tiền') ||
    msg.includes('tốn') ||
    msg.match(/\d+\s*(triệu|tr|k|đồng)/i)
  ) {
    return 'budget';
  }

  // Timing patterns
  if (
    msg.includes('khi nào') ||
    msg.includes('thời điểm') ||
    msg.includes('mùa') ||
    msg.includes('tháng mấy') ||
    msg.includes('thời gian')
  ) {
    return 'timing';
  }

  // Information patterns - specific questions
  if (
    msg.includes('có gì') ||
    msg.includes('làm gì') ||
    msg.includes('chơi gì') ||
    msg.includes('ăn gì') ||
    msg.includes('như thế nào') ||
    msg.includes('có không')
  ) {
    return 'info';
  }

  // If very short or unclear
  if (msg.length < 5 || !msg.match(/[a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i)) {
    return 'unclear';
  }

  return 'unclear';
}

/**
 * Detect edge cases that need special handling
 */
export function detectEdgeCase(message: string): EdgeCase {
  const msg = message.toLowerCase();

  // Out of scope - non-travel topics
  const outOfScopeKeywords = [
    'chính trị', 'bầu cử', 'đảng',
    'bệnh', 'thuốc', 'y tế', 'covid',
    'đầu tư', 'chứng khoán', 'crypto',
    'pháp luật', 'tòa án', 'kiện',
    'tôn giáo', 'thờ cúng'
  ];

  if (outOfScopeKeywords.some(keyword => msg.includes(keyword))) {
    return 'out_of_scope';
  }

  // Too vague - single word or very short
  if (msg.length < 8 && !msg.match(/\d+/)) {
    return 'too_vague';
  }

  // Inappropriate content filters
  const inappropriatePatterns = [
    /\b(fuck|shit|damn|sex|porn)\b/i,
    // Add Vietnamese inappropriate terms if needed
  ];

  if (inappropriatePatterns.some(pattern => pattern.test(msg))) {
    return 'inappropriate';
  }

  // Complex multi-part questions
  if ((msg.match(/\?/g) || []).length > 2) {
    return 'complex';
  }

  return null;
}

/**
 * Generate intent-specific instructions for system prompt
 */
export function getIntentInstructions(intent: ConversationIntent): string {
  const instructions = {
    explore: `
TASK: Gợi ý địa điểm du lịch Việt Nam

STEPS:
1. Check context: Có đủ info (thời gian/sở thích/ngân sách) chưa?
   - Nếu THIẾU → Hỏi 1 câu cụ thể
   - Nếu ĐỦ → Tiến sang bước 2

2. Gợi ý 3-5 địa điểm phù hợp:
   Format: 🏖️ **Tên địa điểm** - [1 câu đặc điểm]

3. Thêm tips thực tế (thời điểm đẹp, chi phí ước tính)

4. End với: "Bạn muốn biết thêm về địa điểm nào?"

EXAMPLE OUTPUT:
"🏖️ **Phú Quốc** - Thiên đường biển với nước trong xanh
🏔️ **Sapa** - Ruộng bậc thang hùng vĩ
🏛️ **Hội An** - Phố cổ lãng mạn

💡 Mỗi địa điểm có trang chi tiết trên app với hình ảnh, đánh giá, và AI chat riêng. Bạn muốn khám phá thêm về nơi nào?"`,

    plan: `
TASK: Lập lịch trình du lịch tổng quan

STEPS:
1. Xác nhận thông tin: Địa điểm + Số ngày + Ngân sách
   - Nếu thiếu → Hỏi lại ngắn gọn

2. Gợi ý flow theo ngày (MAX 3 ngày/response):
   Format:
   📅 **Ngày X:** [Khu vực] - [Hoạt động chính]

3. Thêm notes quan trọng (thời tiết, di chuyển, chi phí)

4. Hướng dẫn: "Vào /explore để xem địa điểm chi tiết với giờ mở cửa, giá vé cập nhật"

EXAMPLE OUTPUT:
"📅 **Lịch trình 3 ngày Đà Nẵng:**

**Ngày 1:** Trung tâm - Cầu Rồng, Bãi biển Mỹ Khê
**Ngày 2:** Bà Nà Hills - Cáp treo, Cầu Vàng
**Ngày 3:** Hội An - Phố cổ, đèn lồng

💰 Ước tính: 5-7 triệu/người (ăn ở mid-range)

💡 Để biết giờ mở cửa, giá vé chính xác, hãy chat trực tiếp với từng địa điểm trên app nhé! Bạn muốn mình detail ngày nào thêm?"`,

    budget: `
TASK: Ước tính chi phí du lịch

STEPS:
1. Breakdown theo 4 mục chính:
   - Di chuyển (máy bay/xe)
   - Lưu trú (khách sạn/homestay)
   - Ăn uống
   - Vui chơi/tham quan

2. Tổng cộng + đánh giá khả thi
3. Tips tiết kiệm nếu budget thấp
4. Disclaimer: Giá thay đổi theo mùa

EXAMPLE OUTPUT:
"💰 **Chi phí 2 người, 3 ngày Phú Quốc:**
- ✈️ Vé máy bay: 3-4 triệu
- 🏨 Khách sạn: 2-3 triệu
- 🍜 Ăn uống: 1.5 triệu
- 🎫 Tham quan: 1 triệu
**Tổng: ~8-10 triệu**

💡 Giá tham khảo, có thể thay đổi. Bạn muốn mình gợi ý cách tiết kiệm không?"`,

    timing: `
TASK: Tư vấn thời điểm du lịch

Format ngắn gọn:
✅ **Nên đi:** [Tháng X-Y] - [Lý do: thời tiết/lễ hội]
❌ **Nên tránh:** [Tháng Z] - [Lý do: mưa/đông khách]

EXAMPLE: "✅ **Phú Quốc nên đi:** T11-T4 - Nắng đẹp, biển trong
❌ **Tránh:** T5-T10 - Mưa nhiều, sóng lớn"`,

    info: `
TASK: Trả lời thông tin cụ thể

STEPS:
1. Trả lời ngắn gọn (2-3 câu)
2. Thêm 1 tip liên quan
3. Suggest: "Hỏi thêm về [topic]?"

Keep it SHORT and CONVERSATIONAL.`,

    chitchat: `
TASK: Chào hỏi thân thiện

Response: 1 câu đáp lại + chuyển hướng du lịch

EXAMPLE: "Chào bạn! 👋 Mình là trợ lý Du Lịch Việt. Bạn đang muốn khám phá địa điểm nào?"`,

    unclear: `
TASK: Xử lý câu hỏi không rõ

Đưa menu options:
"Mình có thể giúp bạn:
🏖️ Gợi ý địa điểm
📅 Lập lịch trình
💰 Tính chi phí
Bạn quan tâm điều nào nhất?"`
  };

  return instructions[intent];
}

/**
 * Generate edge case response
 */
export function getEdgeCaseResponse(edgeCase: EdgeCase, message: string): string | null {
  if (!edgeCase) return null;

  const responses = {
    out_of_scope: `
Tôi là chuyên gia du lịch Việt Nam, nên không thể giúp về chủ đề này.

**Tôi có thể giúp bạn:**
→ Khám phá địa điểm đẹp ở Việt Nam
→ Lập kế hoạch chuyến đi chi tiết
→ Tư vấn ngân sách và timing

Bạn muốn hỏi về du lịch Việt Nam không? 😊`,

    too_vague: `
Để tôi gợi ý phù hợp nhất, bạn có thể cho tôi biết thêm:

→ Bạn muốn đi đâu? (miền Bắc/Trung/Nam, hoặc tỉnh cụ thể)
→ Hoặc loại địa điểm nào? (🏖️ biển, 🏔️ núi, 🏛️ văn hóa, 🍜 ẩm thực)

Hỏi tôi bất cứ điều gì về du lịch Việt Nam nhé!`,

    inappropriate: `
Xin lỗi, tôi không thể trả lời câu hỏi này.

**Tôi ở đây để giúp bạn:**
→ Khám phá Việt Nam
→ Lên kế hoạch du lịch
→ Tìm địa điểm phù hợp

Hãy hỏi tôi về chuyến đi tiếp theo của bạn! ✈️`,

    complex: `
Câu hỏi của bạn có nhiều phần. Hãy để tôi giúp bạn từng bước nhé!

**Chúng ta bắt đầu với phần nào trước?**
→ Chọn địa điểm
→ Lập lịch trình
→ Tính chi phí`
  };

  return responses[edgeCase];
}

/**
 * Build conversation summary for context (cost-effective)
 * Max 200 tokens regardless of conversation length
 */
interface ConversationSummary {
  preferences: {
    budget?: string;
    duration?: string;
    interests: string[];
    group?: string;
  };
  destinations: string[];
  lastIntent: ConversationIntent;
  recentContext: string;
}

export function summarizeConversation(
  history: Array<{role: string, content: string}>
): ConversationSummary {
  const allMessages = history.map(m => m.content).join(' ').toLowerCase();

  // Extract budget (first match only)
  let budget: string | undefined;
  const budgetMatch = allMessages.match(/(\d+)\s*(triệu|tr|million|k)/i);
  if (budgetMatch) {
    budget = `${budgetMatch[1]} ${budgetMatch[2]}`;
  }

  // Extract duration
  let duration: string | undefined;
  const durationMatch = allMessages.match(/(\d+)\s*(ngày|tuần|tháng|days?|weeks?)/i);
  if (durationMatch) {
    duration = `${durationMatch[1]} ${durationMatch[2]}`;
  }

  // Extract interests
  const interestKeywords = {
    'biển': ['biển', 'bơi', 'lặn', 'tắm biển', 'beach', 'sea'],
    'núi': ['núi', 'trekking', 'leo núi', 'mountain'],
    'văn hóa': ['văn hóa', 'lịch sử', 'di tích', 'culture', 'temple'],
    'ẩm thực': ['ăn', 'món', 'ẩm thực', 'quán', 'food'],
  };

  const interests = Object.keys(interestKeywords).filter(key =>
    interestKeywords[key as keyof typeof interestKeywords].some(keyword =>
      allMessages.includes(keyword)
    )
  );

  // Extract travel group
  let group: string | undefined;
  if (allMessages.match(/\b(một mình|solo|độc hành)\b/)) {
    group = 'một mình';
  } else if (allMessages.match(/\b(cặp đôi|vợ chồng|bạn trai|bạn gái|couple)\b/)) {
    group = 'cặp đôi';
  } else if (allMessages.match(/\b(gia đình|con cái|bố mẹ|family)\b/)) {
    group = 'gia đình';
  } else if (allMessages.match(/\b(bạn bè|nhóm|friends)\b/)) {
    group = 'bạn bè';
  }

  // Extract mentioned destinations (Vietnamese provinces/cities)
  const destinations: string[] = [];
  const vietnamLocations = [
    'Hà Nội', 'Sài Gòn', 'Hồ Chí Minh', 'Đà Nẵng', 'Huế', 'Hội An',
    'Nha Trang', 'Đà Lạt', 'Phú Quốc', 'Sapa', 'Sa Pa', 'Hạ Long',
    'Ninh Bình', 'Hải Phòng', 'Cần Thơ', 'Vũng Tàu', 'Phan Thiết',
    'Quy Nhơn', 'Mũi Né', 'Côn Đảo'
  ];

  vietnamLocations.forEach(location => {
    if (allMessages.includes(location.toLowerCase())) {
      destinations.push(location);
    }
  });

  // Last 2-3 messages for recent context
  const recentTurns = history.slice(-3).map(m =>
    `${m.role === 'user' ? 'User' : 'AI'}: ${m.content.substring(0, 100)}`
  );

  // Detect last intent
  const lastUserMessage = [...history].reverse().find(m => m.role === 'user');
  const lastIntent = lastUserMessage ? detectIntent(lastUserMessage.content) : 'unclear';

  return {
    preferences: {
      budget,
      duration,
      interests,
      group
    },
    destinations: [...new Set(destinations)], // Remove duplicates
    lastIntent,
    recentContext: recentTurns.join('\n')
  };
}

/**
 * Format conversation summary for system prompt
 */
export function formatConversationSummary(summary: ConversationSummary): string {
  const parts: string[] = [];

  if (Object.values(summary.preferences).some(v => v)) {
    parts.push('[KNOWN PREFERENCES]');
    if (summary.preferences.budget) {
      parts.push(`- Ngân sách: ${summary.preferences.budget}`);
    }
    if (summary.preferences.duration) {
      parts.push(`- Thời gian: ${summary.preferences.duration}`);
    }
    if (summary.preferences.interests.length > 0) {
      parts.push(`- Sở thích: ${summary.preferences.interests.join(', ')}`);
    }
    if (summary.preferences.group) {
      parts.push(`- Nhóm đi: ${summary.preferences.group}`);
    }
  }

  if (summary.destinations.length > 0) {
    parts.push('');
    parts.push('[DESTINATIONS DISCUSSED]');
    parts.push(summary.destinations.join(', '));
  }

  if (summary.recentContext) {
    parts.push('');
    parts.push('[RECENT CONVERSATION]');
    parts.push(summary.recentContext);
  }

  return parts.join('\n');
}
