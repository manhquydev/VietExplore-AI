// src/ai/utils/__tests__/conversation-helpers.test.ts
// Test cases for conversation helpers

import {
  detectIntent,
  detectEdgeCase,
  summarizeConversation,
  type ConversationIntent,
  type EdgeCase
} from '../conversation-helpers';

describe('Intent Detection', () => {
  test('detects explore intent', () => {
    expect(detectIntent('gợi ý địa điểm du lịch')).toBe('explore');
    expect(detectIntent('đề xuất 10 địa điểm nên đi ở việt nam')).toBe('explore');
    expect(detectIntent('nên đi đâu ở miền bắc')).toBe('explore');
  });

  test('detects plan intent', () => {
    expect(detectIntent('lập kế hoạch cho 5 ngày ở đà nẵng')).toBe('plan');
    expect(detectIntent('lịch trình chi tiết 3 ngày 2 đêm')).toBe('plan');
    expect(detectIntent('hành trình từng ngày')).toBe('plan');
  });

  test('detects budget intent', () => {
    expect(detectIntent('chi phí đi nha trang 3 ngày')).toBe('budget');
    expect(detectIntent('ngân sách 15 triệu có đủ không')).toBe('budget');
    expect(detectIntent('giá vé và khách sạn bao nhiêu')).toBe('budget');
  });

  test('detects timing intent', () => {
    expect(detectIntent('khi nào nên đi sapa')).toBe('timing');
    expect(detectIntent('mùa nào đẹp nhất ở đà lạt')).toBe('timing');
    expect(detectIntent('tháng mấy đi phú quốc tốt')).toBe('timing');
  });

  test('detects info intent', () => {
    expect(detectIntent('có gì ở hội an')).toBe('info');
    expect(detectIntent('làm gì ở vịnh hạ long')).toBe('info');
    expect(detectIntent('ăn gì ở huế')).toBe('info');
  });

  test('detects chitchat intent', () => {
    expect(detectIntent('xin chào')).toBe('chitchat');
    expect(detectIntent('cảm ơn bạn')).toBe('chitchat');
    expect(detectIntent('tạm biệt')).toBe('chitchat');
  });

  test('detects unclear intent', () => {
    expect(detectIntent('ừm')).toBe('unclear');
    expect(detectIntent('...')).toBe('unclear');
    expect(detectIntent('a')).toBe('unclear');
  });
});

describe('Edge Case Detection', () => {
  test('detects out of scope', () => {
    expect(detectEdgeCase('bầu cử tổng thống')).toBe('out_of_scope');
    expect(detectEdgeCase('cách chữa bệnh tiểu đường')).toBe('out_of_scope');
    expect(detectEdgeCase('đầu tư chứng khoán')).toBe('out_of_scope');
  });

  test('detects too vague', () => {
    expect(detectEdgeCase('đi')).toBe('too_vague');
    expect(detectEdgeCase('ok')).toBe('too_vague');
    expect(detectEdgeCase('ừ')).toBe('too_vague');
  });

  test('detects complex multi-part', () => {
    expect(detectEdgeCase('đi đâu? bao nhiêu tiền? khi nào đi? ở đâu?')).toBe('complex');
  });

  test('returns null for normal questions', () => {
    expect(detectEdgeCase('gợi ý địa điểm du lịch ở miền bắc')).toBeNull();
    expect(detectEdgeCase('lập kế hoạch 5 ngày ở đà nẵng')).toBeNull();
  });
});

describe('Conversation Summarization', () => {
  test('extracts budget', () => {
    const history = [
      { role: 'user', content: 'tôi có ngân sách 15 triệu' },
      { role: 'assistant', content: 'Tuyệt vời!' }
    ];
    const summary = summarizeConversation(history);
    expect(summary.preferences.budget).toContain('15');
    expect(summary.preferences.budget).toContain('triệu');
  });

  test('extracts duration', () => {
    const history = [
      { role: 'user', content: 'tôi muốn đi 5 ngày' },
      { role: 'assistant', content: 'OK' }
    ];
    const summary = summarizeConversation(history);
    expect(summary.preferences.duration).toContain('5');
    expect(summary.preferences.duration).toContain('ngày');
  });

  test('extracts interests', () => {
    const history = [
      { role: 'user', content: 'tôi thích biển và ẩm thực' },
      { role: 'assistant', content: 'Tuyệt!' }
    ];
    const summary = summarizeConversation(history);
    expect(summary.preferences.interests).toContain('biển');
    expect(summary.preferences.interests).toContain('ẩm thực');
  });

  test('extracts travel group', () => {
    const history = [
      { role: 'user', content: 'tôi đi cùng vợ chồng' },
      { role: 'assistant', content: 'OK' }
    ];
    const summary = summarizeConversation(history);
    expect(summary.preferences.group).toBe('cặp đôi');
  });

  test('extracts destinations', () => {
    const history = [
      { role: 'user', content: 'tôi muốn đi Nha Trang và Đà Lạt' },
      { role: 'assistant', content: 'Tuyệt!' }
    ];
    const summary = summarizeConversation(history);
    expect(summary.destinations).toContain('Nha Trang');
    expect(summary.destinations).toContain('Đà Lạt');
  });

  test('keeps only recent context', () => {
    const longHistory = Array.from({ length: 10 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`
    }));
    const summary = summarizeConversation(longHistory);
    // Should only keep last 3 messages
    expect(summary.recentContext.split('\n').length).toBeLessThanOrEqual(3);
  });

  test('handles empty history', () => {
    const summary = summarizeConversation([]);
    expect(summary.preferences.budget).toBeUndefined();
    expect(summary.preferences.duration).toBeUndefined();
    expect(summary.preferences.interests).toEqual([]);
    expect(summary.destinations).toEqual([]);
  });
});

describe('Integration Tests', () => {
  test('full conversation flow', () => {
    const conversation = [
      { role: 'user', content: 'tôi muốn đi du lịch' },
      { role: 'assistant', content: 'Bạn muốn đi đâu?' },
      { role: 'user', content: 'gợi ý cho tôi địa điểm ở miền trung' },
      { role: 'assistant', content: 'Bạn có bao nhiêu ngày?' },
      { role: 'user', content: 'tôi có 5 ngày và ngân sách 15 triệu' },
      { role: 'assistant', content: 'Tuyệt vời!' }
    ];

    const summary = summarizeConversation(conversation);

    expect(summary.preferences.duration).toContain('5');
    expect(summary.preferences.budget).toContain('15');
    expect(summary.lastIntent).toBe('budget'); // Last user message was about budget
  });
});
