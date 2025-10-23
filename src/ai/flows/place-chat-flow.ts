// src/ai/flows/place-chat-flow.ts
'use server';

import { ai } from '../genkit';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

const PlaceChatInputSchema = z.object({
  placeId: z.string().min(1, 'Place ID is required'),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).default([])
});

const CitationSchema = z.object({
  sources: z.array(z.object({
    index: z.number(),
    title: z.string(),
    url: z.string(),
    snippet: z.string().optional()
  })),
  searchQueries: z.array(z.string()),
  supports: z.array(z.any()).optional()
});

const PlaceChatOutputSchema = z.object({
  response: z.string(),
  source: z.enum(['database', 'web_search']).default('database'),
  citations: CitationSchema.nullable().optional(),
  tokensUsed: z.object({
    input: z.number(),
    output: z.number()
  }).optional(),
  placeInfo: z.object({
    id: z.string(),
    name: z.string()
  }).optional()
});

export type PlaceChatInput = z.infer<typeof PlaceChatInputSchema>;
export type PlaceChatOutput = z.infer<typeof PlaceChatOutputSchema>;

/**
 * Place-specific chat flow with context awareness
 * - Fetches place data from Firestore
 * - Builds context-rich prompt
 * - Uses Gemini 2.5 Flash for factual responses
 * - Logs tokens for cost tracking
 */
export const placeChatFlow = ai.defineFlow(
  {
    name: 'placeChatFlow',
    inputSchema: PlaceChatInputSchema,
    outputSchema: PlaceChatOutputSchema,
  },
  async (input) => {
    try {
      console.log('[PLACE-CHAT] Processing request:', { placeId: input.placeId, messageLength: input.message.length });

      // 1. Fetch place data from Firestore
      const placeDoc = await adminDb.collection('places').doc(input.placeId).get();

      if (!placeDoc.exists) {
        console.warn('[PLACE-CHAT] Place not found:', input.placeId);
        return {
          response: "Xin lỗi, tôi không tìm thấy thông tin về địa điểm này. Vui lòng thử lại sau.",
          placeInfo: undefined
        };
      }

      const place = placeDoc.data();

      // 2. Build context-aware prompt
      const placeContext = buildPlaceContext(place);
      const conversationHistory = buildConversationHistory(input.history);

      const systemPrompt = `Bạn là trợ lý AI chuyên về địa điểm du lịch "${place.name}" tại Việt Nam.

${placeContext}

QUY TẮC TRẢ LỜI:
1. Dựa vào thông tin trên để trả lời. KHÔNG bịa đặt hoặc đoán mò.
2. Nếu thông tin = "Chưa cập nhật" hoặc thiếu:
   - Với câu hỏi quan trọng (giá, giờ, thời gian): Khuyên kiểm tra nguồn chính thức
   - Với câu hỏi khác: Trả lời dựa trên mô tả chung và đưa gợi ý hữu ích
3. Trả lời ngắn gọn (2-4 câu), thân thiện, bằng tiếng Việt.
4. Đề xuất hoạt động phù hợp dựa trên loại địa điểm:
   - Biển: bơi lội, lặn, chèo thuyền
   - Núi: trekking, ngắm cảnh, camping
   - Văn hóa: tham quan, tìm hiểu lịch sử, chụp ảnh
   - Ẩm thực: thử món đặc sản địa phương
   - Check-in: chụp ảnh, trải nghiệm độc đáo
5. Luôn lịch sự và hữu ích. Tận dụng mô tả chi tiết để đưa câu trả lời có giá trị.

${conversationHistory}

CÂU HỎI MỚI CỦA NGƯỜI DÙNG: ${input.message}`;

      // 3. Decide: Database-only or Web Search path
      console.log('[PLACE-CHAT] Question:', input.message);
      console.log('[PLACE-CHAT] Place fields:', {
        bestTimeToVisit: place.bestTimeToVisit,
        bestSeason: place.bestSeason,
        openingHours: place.openingHours,
        entryFee: place.entryFee,
        facilities: place.facilities?.length || 0,
        activities: place.activities?.length || 0,
        transportation: place.transportation
      });

      const shouldSearchWeb = needsWebSearch(place, input.message);
      console.log('[PLACE-CHAT] Should use web search?', shouldSearchWeb);

      if (!shouldSearchWeb) {
        // PATH 1: Database-only (current behavior)
        console.log('[PLACE-CHAT] Using database context only');

        const { text, usage } = await ai.generate({
          model: 'googleai/gemini-2.5-flash',
          prompt: systemPrompt,
          config: {
            temperature: 0.3,
            maxOutputTokens: 500,
            topP: 0.8,
            topK: 40,
          }
        });

        const responseText = text || 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau.';

        const inputTokens = estimateTokens(systemPrompt);
        const outputTokens = estimateTokens(responseText);

        console.log('[PLACE-CHAT] Success (database):', {
          placeId: input.placeId,
          placeName: place.name,
          inputTokens,
          outputTokens,
          cost: calculateCost(inputTokens, outputTokens)
        });

        return {
          response: responseText,
          source: 'database' as const,
          citations: null,
          tokensUsed: {
            input: inputTokens,
            output: outputTokens
          },
          placeInfo: {
            id: input.placeId,
            name: place.name
          }
        };
      }

      // PATH 2: Web Search with Grounding
      console.log('[PLACE-CHAT] Using web search for missing data');

      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_AI_API_KEY not configured for web search');
      }

      const genAI = new GoogleGenAI({ apiKey });

      const searchPrompt = `Bạn là trợ lý AI chuyên về du lịch Việt Nam.

THÔNG TIN ĐỊA ĐIỂM:
${placeContext}

${conversationHistory}

NHIỆM VỤ:
Trả lời câu hỏi sau về "${place.name}" tại ${place.province}, Việt Nam.
Sử dụng Google Search để tìm thông tin cập nhật và chính xác.
Trả lời ngắn gọn (2-4 câu), thân thiện, bằng tiếng Việt.

CÂU HỎI: ${input.message}`;

      const searchResult = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.3,
          maxOutputTokens: 500
        }
      });

      const responseText = searchResult.text || 'Xin lỗi, tôi không thể tìm thấy thông tin này lúc này.';
      const citations = extractCitations(searchResult.groundingMetadata);

      const inputTokens = estimateTokens(searchPrompt);
      const outputTokens = estimateTokens(responseText);

      console.log('[PLACE-CHAT] Success (web search):', {
        placeId: input.placeId,
        placeName: place.name,
        inputTokens,
        outputTokens,
        cost: calculateCost(inputTokens, outputTokens),
        citationsFound: citations?.sources.length || 0
      });

      return {
        response: responseText,
        source: 'web_search' as const,
        citations,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens
        },
        placeInfo: {
          id: input.placeId,
          name: place.name
        }
      };

    } catch (error) {
      console.error('[PLACE-CHAT] Error:', error);

      // Handle specific errors
      if (error.message?.includes('PERMISSION_DENIED')) {
        return {
          response: "Xin lỗi, dịch vụ AI tạm thời gặp vấn đề về quyền truy cập. Vui lòng thử lại sau.",
        };
      }

      if (error.message?.includes('RATE_LIMIT')) {
        return {
          response: "Bạn đã đạt giới hạn số câu hỏi. Vui lòng thử lại sau ít phút.",
        };
      }

      // Generic error
      return {
        response: "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại.",
      };
    }
  }
);

/**
 * Build structured place context for AI
 */
function buildPlaceContext(place: any): string {
  const sections = [];

  // Basic info
  sections.push(`THÔNG TIN CƠ BẢN:
- Tên: ${place.name}
- Mô tả ngắn: ${place.shortDescription || 'Chưa có mô tả'}
- Loại: ${getPlaceTypeLabel(place.type)}
- Vùng: ${getRegionLabel(place.region)}
- Tỉnh/Thành: ${place.province || 'Không rõ'}
- Địa chỉ: ${place.vietnamAddress?.fullAddress || place.address || 'Chưa cập nhật'}`);

  // Operational info
  if (place.openingHours || place.entryFee || place.bestTimeToVisit) {
    sections.push(`\nTHÔNG TIN VẬN HÀNH:
- Giờ mở cửa: ${place.openingHours || 'Chưa cập nhật'}
- Giá vé: ${place.entryFee || 'Chưa cập nhật'}
- Thời điểm tốt nhất: ${place.bestTimeToVisit || 'Quanh năm'}`);
  }

  // Facilities
  if (place.facilities && place.facilities.length > 0) {
    sections.push(`\nTIỆN ÍCH:
${place.facilities.map((f: string) => `- ${f}`).join('\n')}`);
  }

  // Rating
  if (place.rating?.average) {
    sections.push(`\nĐÁNH GIÁ:
- Điểm trung bình: ${place.rating.average.toFixed(1)}/5
- Số lượt đánh giá: ${place.rating.count || 0}`);
  }

  // Detailed description
  if (place.description) {
    sections.push(`\nMÔ TẢ CHI TIẾT:
${place.description.substring(0, 800)}${place.description.length > 800 ? '...' : ''}`);
  }

  return sections.join('\n');
}

/**
 * Build conversation history context
 */
function buildConversationHistory(history: Array<{role: string, content: string}>): string {
  if (!history || history.length === 0) {
    return 'LỊCH SỬ HỘI THOẠI: (Đây là tin nhắn đầu tiên)';
  }

  // Limit to last 5 messages to avoid token bloat
  const recentHistory = history.slice(-5);
  const historyText = recentHistory
    .map(msg => `${msg.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${msg.content}`)
    .join('\n');

  return `LỊCH SỬ HỘI THOẠI (${recentHistory.length} tin nhắn gần nhất):\n${historyText}`;
}

/**
 * Get Vietnamese label for place type
 */
function getPlaceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'bien': 'Biển',
    'nui': 'Núi',
    'van-hoa': 'Văn hóa',
    'am-thuc': 'Ẩm thực',
    'check-in': 'Điểm check-in'
  };
  return labels[type] || type;
}

/**
 * Get Vietnamese label for region
 */
function getRegionLabel(region: string): string {
  const labels: Record<string, string> = {
    'bac-bo': 'Bắc Bộ',
    'trung-bo': 'Trung Bộ',
    'nam-bo': 'Nam Bộ'
  };
  return labels[region] || region;
}

/**
 * Detect if question needs web search based on missing data fields
 * ENHANCED: More flexible detection - prioritizes web search for critical missing data
 */
function needsWebSearch(place: any, question: string): boolean {
  const questionLower = question.toLowerCase();

  // === CRITICAL DATA POINTS - Always search if missing ===

  // Opening hours questions - HIGH PRIORITY
  if (questionLower.includes('giờ') || questionLower.includes('mở cửa') || questionLower.includes('mở') || questionLower.includes('đóng cửa')) {
    if (!place.openingHours || place.openingHours === 'Chưa cập nhật') {
      console.log('[NEED-WEB-SEARCH] Opening hours - DB missing/outdated');
      return true;
    }
  }

  // Price questions - HIGH PRIORITY
  if (questionLower.includes('giá') || questionLower.includes('vé') || questionLower.includes('tiền') || questionLower.includes('phí') || questionLower.includes('chi phí')) {
    if (!place.entryFee || place.entryFee === 'Chưa cập nhật') {
      console.log('[NEED-WEB-SEARCH] Entry fee - DB missing/outdated');
      return true;
    }
  }

  // Best time to visit / Timing questions - HIGH PRIORITY
  if (questionLower.includes('thời gian') || questionLower.includes('thời điểm') || questionLower.includes('bao giờ')
      || questionLower.includes('nên đi') || questionLower.includes('tốt nhất') || questionLower.includes('đẹp nhất')
      || questionLower.includes('chụp ảnh') || questionLower.includes('mùa') || questionLower.includes('tháng')) {
    if (!place.bestTimeToVisit && !place.bestSeason) {
      console.log('[NEED-WEB-SEARCH] Best time/season - DB missing');
      return true;
    }
  }

  // === SECONDARY DATA POINTS - Search if question is specific ===

  // Crowd/Peak season questions
  if (questionLower.includes('đông khách') || questionLower.includes('vắng khách') || questionLower.includes('cao điểm') || questionLower.includes('đông người')) {
    console.log('[NEED-WEB-SEARCH] Crowd/peak season info - specific question');
    return true;
  }

  // Facilities/Services questions
  if ((questionLower.includes('tiện ích') || questionLower.includes('dịch vụ') || questionLower.includes('có gì')
      || questionLower.includes('có không') || questionLower.includes('phòng') || questionLower.includes('wc')
      || questionLower.includes('nhà vệ sinh') || questionLower.includes('đậu xe'))
      && (!place.facilities || place.facilities.length === 0)) {
    console.log('[NEED-WEB-SEARCH] Facilities - DB missing');
    return true;
  }

  // Activities/What to do questions
  if ((questionLower.includes('hoạt động') || questionLower.includes('làm gì') || questionLower.includes('chơi gì')
      || questionLower.includes('trải nghiệm') || questionLower.includes('vui chơi'))
      && (!place.activities || place.activities.length === 0)) {
    console.log('[NEED-WEB-SEARCH] Activities - DB missing');
    return true;
  }

  // Transportation/How to get there questions
  if ((questionLower.includes('đến') || questionLower.includes('đi') || questionLower.includes('phương tiện')
      || questionLower.includes('xe') || questionLower.includes('di chuyển') || questionLower.includes('tới'))
      && !place.transportation) {
    console.log('[NEED-WEB-SEARCH] Transportation - DB missing');
    return true;
  }

  // === NEW: Additional flexible triggers ===

  // Detailed itinerary/schedule questions
  if (questionLower.includes('lịch trình') || questionLower.includes('chi tiết') || questionLower.includes('từng ngày')
      || questionLower.includes('kế hoạch') || questionLower.includes('hành trình')) {
    console.log('[NEED-WEB-SEARCH] Detailed itinerary/schedule - complex query');
    return true;
  }

  // Contact/Booking questions
  if (questionLower.includes('liên hệ') || questionLower.includes('số điện thoại') || questionLower.includes('đặt chỗ')
      || questionLower.includes('đặt vé') || questionLower.includes('website') || questionLower.includes('booking')) {
    console.log('[NEED-WEB-SEARCH] Contact/booking info - practical query');
    return true;
  }

  // Food/Restaurant nearby questions
  if (questionLower.includes('ăn') || questionLower.includes('quán') || questionLower.includes('nhà hàng')
      || questionLower.includes('món') || questionLower.includes('đặc sản')) {
    if (place.type !== 'am-thuc') { // Only search if place itself is not a restaurant
      console.log('[NEED-WEB-SEARCH] Food/restaurants nearby');
      return true;
    }
  }

  // Accommodation nearby questions
  if (questionLower.includes('khách sạn') || questionLower.includes('chỗ ở') || questionLower.includes('homestay')
      || questionLower.includes('resort') || questionLower.includes('lưu trú')) {
    console.log('[NEED-WEB-SEARCH] Accommodation nearby');
    return true;
  }

  // Weather-specific questions (always search for real-time data)
  if (questionLower.includes('thời tiết') || questionLower.includes('nắng') || questionLower.includes('mưa')
      || questionLower.includes('nhiệt độ')) {
    console.log('[NEED-WEB-SEARCH] Weather info - real-time data needed');
    return true;
  }

  // Events/Festivals questions
  if (questionLower.includes('sự kiện') || questionLower.includes('lễ hội') || questionLower.includes('festival')
      || questionLower.includes('tổ chức')) {
    console.log('[NEED-WEB-SEARCH] Events/festivals - time-sensitive data');
    return true;
  }

  // General "how" questions often need web search
  if (questionLower.startsWith('làm sao') || questionLower.startsWith('làm thế nào')
      || questionLower.includes('cách nào')) {
    console.log('[NEED-WEB-SEARCH] "How-to" question - likely needs external info');
    return true;
  }

  console.log('[NO-WEB-SEARCH] Database has sufficient data for this question');
  return false;
}

/**
 * Extract citations from Google Search grounding metadata
 */
function extractCitations(metadata: any): { sources: any[], searchQueries: string[], supports?: any[] } | null {
  if (!metadata?.groundingChunks || metadata.groundingChunks.length === 0) {
    return null;
  }

  return {
    sources: metadata.groundingChunks.map((chunk: any, index: number) => ({
      index: index + 1,
      title: chunk.web?.title || 'Nguồn không rõ',
      url: chunk.web?.uri || '#',
      snippet: chunk.web?.snippet || ''
    })),
    searchQueries: metadata.webSearchQueries || [],
    supports: metadata.groundingSupports || []
  };
}

/**
 * Estimate token count (rough approximation)
 * ~1 token per 4 characters for Vietnamese
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate cost based on token usage
 * Gemini 2.5 Flash: $0.15/1M input, $0.60/1M output
 */
function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * 0.15;
  const outputCost = (outputTokens / 1_000_000) * 0.60;
  return inputCost + outputCost;
}
