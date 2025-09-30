export type ReportType = 'incorrect_info' | 'inappropriate_content' | 'spam' | 'duplicate' | 'other';
export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';
export type EditSuggestionStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface PlaceReport {
  id: string;
  placeId: string;
  placeName: string;
  reportType: ReportType;
  reason: string;
  description?: string;
  reportedBy: string; // User ID
  reporterInfo: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  resolution?: string;
  // Optional fields for claimed reports
  claimedAt?: string;
  reviewerInfo?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface EditSuggestion {
  id: string;
  placeId: string;
  placeName: string;
  suggestedBy: string; // User ID
  suggesterInfo: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  changes: {
    field: string;
    currentValue: any;
    suggestedValue: any;
    reason?: string;
  }[];
  description?: string;
  status: EditSuggestionStatus;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface ReportFormData {
  placeId: string;
  reportType: ReportType;
  reason: string;
  description?: string;
}

export interface EditSuggestionFormData {
  placeId: string;
  changes: {
    field: string;
    currentValue: any;
    suggestedValue: any;
    reason?: string;
  }[];
  description?: string;
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  incorrect_info: 'Thông tin sai lệch',
  inappropriate_content: 'Nội dung không phù hợp',
  spam: 'Spam/Rác',
  duplicate: 'Trùng lặp',
  other: 'Khác'
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Chờ xử lý',
  under_review: 'Đang xem xét',
  resolved: 'Đã giải quyết',
  dismissed: 'Đã bác bỏ'
};

export const EDIT_SUGGESTION_STATUS_LABELS: Record<EditSuggestionStatus, string> = {
  pending: 'Chờ xem xét',
  under_review: 'Đang xem xét', 
  approved: 'Đã phê duyệt',
  rejected: 'Đã từ chối'
};