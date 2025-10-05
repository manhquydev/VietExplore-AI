# Firebase Genkit Grounding: Hướng dẫn và So sánh với Firebase AI Logic

## Tổng quan

Tài liệu này phân tích khả năng grounding (trích nguồn) của Firebase Genkit so với Firebase AI Logic, dựa trên nghiên cứu từ documentation chính thức và GitHub issues.

## Tình trạng hiện tại

### Firebase AI Logic (Đã có sẵn)
- ✅ **Google Search Grounding**: Hoạt động với một dòng code
- ✅ **Rendered Content**: Search suggestions tự động
- ✅ **Grounding Metadata**: Citations với source links
- ✅ **Client-side**: Dễ implement

### Firebase Genkit (Hạn chế)
- ✅ **Vertex AI Search**: Grounding với datastores riêng
- ✅ **RAG**: Vector databases và custom retrievers  
- ❌ **Google Search**: Chưa được implement đầy đủ
- ⏳ **Đang phát triển**: Issues #547, #1901 vẫn mở

## So sánh Implementation

### Firebase AI Logic (Như video Firebase)

```javascript
// Client-side - Firebase AI Logic
import { ai } from '@google/ai-logic';

const model = ai.generativeModel({
  model: 'gemini-2.5-pro',
  tools: [{ googleSearch: {} }] // Chỉ cần 1 dòng
});

const result = await model.generateContent("Firebase Full Text Search history");

// Tự động có:
// - result.renderedContent: Search suggestions UI
// - result.groundingMetadata: Citations với links
```

### Firebase Genkit (Hiện tại)

#### 1. Vertex AI Search Grounding

```javascript
// Server-side - Firebase Genkit  
import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

const ai = genkit({
  plugins: [vertexAI({ location: 'us-central1' })],
});

const model = vertexAI.model('gemini-2.5-pro', {
  config: {
    vertexRetrieval: {
      datastore: {
        projectId: 'your-project-id',
        location: 'global', 
        dataStoreId: 'your-datastore-id'
      },
      disableAttribution: false
    }
  }
});

const response = await model.generate({
  prompt: "Your question here"
});
```

#### 2. Custom RAG Implementation

```javascript
// RAG với Vector Database
import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';

const ai = genkit({
  plugins: [vertexAI()],
});

// Custom retriever
const myRetriever = ai.defineRetriever('myRetriever', async (input) => {
  // Vector search logic here
  return retrievedDocuments;
});

const response = await ai.generate({
  model: vertexAI.model('gemini-2.5-pro'),
  prompt: 'Your question',
  context: await ai.retrieve({
    retriever: myRetriever,
    content: 'search query'
  })
});
```

## Vấn đề và Hạn chế

### Documentation Issues
**Issue #3067**: Code và documentation không khớp
- Documentation nói dùng `collection`, code thực tế cần `dataStoreId`
- Không có cách pass full datastore path
- Requirements về model versions không rõ

### Google Search Missing
**Issue #1901**: Yêu cầu expose `google_search` option
- Chưa có API trực tiếp như AI Logic
- Không có `renderedContent` cho search suggestions
- Không có `groundingMetadata` với citations

### Vertex AI Limitations
- Cần setup Vertex AI project và billing
- Phức tạp hơn so với AI Logic
- Chủ yếu server-side, không phù hợp client apps

## Workarounds hiện tại

### Option 1: Dùng Firebase AI Logic (Khuyến nghị)

Cho Google Search grounding, sử dụng Firebase AI Logic như video:

```javascript
// Đơn giản và hoạt động ngay
const model = ai.generativeModel({
  model: 'gemini-2.5-pro',
  tools: [{ googleSearch: {} }]
});
```

### Option 2: Vertex AI API trực tiếp

Ngoài Genkit, dùng Vertex AI SDK:

```python
# Python với Vertex AI SDK
import vertexai
from vertexai.generative_models import GenerativeModel

tools = [{
  "retrieval": {
    "google_search": {
      "dynamic_retrieval_config": {
        "mode": "MODE_DYNAMIC",
        "dynamic_threshold": 0.68
      }
    }
  }
}]

model = GenerativeModel("gemini-2.5-pro", tools=tools)
response = model.generate_content("Your question")
```

### Option 3: Hybrid Approach

Kết hợp AI Logic cho search, Genkit cho logic:

```javascript
// 1. Dùng AI Logic cho grounding
const searchResult = await aiLogicModel.generateContent(query);

// 2. Process với Genkit
const genkitFlow = ai.defineFlow('processWithSources', async (input) => {
  return await vertexModel.generate({
    prompt: `Based on this grounded information: ${searchResult.text}`,
    context: input
  });
});
```

## Kết luận

### Câu trả lời chính xác
**Firebase Genkit hiện tại KHÔNG THỂ thực hiện Google Search grounding như Firebase AI Logic.**

### Khuyến nghị sử dụng

| Use Case | Khuyến nghị | Lý do |
|----------|-------------|--------|
| Google Search grounding | Firebase AI Logic | Đơn giản, có sẵn, như video |
| Enterprise data grounding | Genkit + Vertex AI Search | Bảo mật, kiểm soát được |
| Custom RAG | Genkit + Vector DB | Linh hoạt cao |
| Prototype nhanh | Firebase AI Logic | Setup nhanh nhất |

### Timeline dự kiến
- **Q4 2024**: Có thể có Google Search support (dựa trên issues)
- **Hiện tại**: Sử dụng alternatives hoặc AI Logic
- **Tương lai**: Genkit sẽ có feature parity với AI Logic

## Tài liệu tham khảo

### GitHub Issues
- [Issue #547](https://github.com/firebase/genkit/issues/547): Support Vertex AI Gemini grounding
- [Issue #1901](https://github.com/firebase/genkit/issues/1901): Expose google_search option  
- [Issue #3067](https://github.com/firebase/genkit/issues/3067): Documentation mismatch

### Official Documentation
- [Firebase AI Logic Grounding](https://firebase.google.com/docs/ai-logic/grounding-google-search)
- [Genkit Vertex AI Plugin](https://firebase.google.com/docs/genkit/plugins/vertex-ai)
- [Genkit RAG](https://firebase.google.com/docs/genkit/rag)

---

*Cập nhật: Tháng 10, 2025*
*Nguồn: Firebase Documentation, GitHub Issues, Community Research*