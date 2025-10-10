# 06. Frontend Components & Hooks - React Architecture

> **Cập nhật:** 2025-10-10
> **Trạng thái:** Production Active

---

## Mục Lục

- [1. Custom Hooks Overview](#1-custom-hooks-overview)
- [2. Authentication Hooks](#2-authentication-hooks)
- [3. Data Fetching Hooks](#3-data-fetching-hooks)
- [4. Real-time & Notifications Hooks](#4-real-time--notifications-hooks)
- [5. Admin & Moderation Hooks](#5-admin--moderation-hooks)
- [6. UI & Utility Hooks](#6-ui--utility-hooks)
- [7. Key Components](#7-key-components)
- [8. Component Architecture](#8-component-architecture)
- [9. Best Practices](#9-best-practices)

---

## 1. Custom Hooks Overview

Dự án có **28 custom React hooks** được tổ chức trong `src/hooks/`:

| Category | Hooks | Purpose |
|----------|-------|---------|
| **Authentication** | useAuth, useFirebaseAuth | User authentication & management |
| **Data Fetching** | usePlaces, usePlace, useUserDrafts, useUserContributions, useUserCollections | Fetch places, drafts, user data |
| **Real-time** | useRealtimeNotifications, useUserPresence, useModeratorNotifications, useRealtimeAuditLogs, useAdminRealtime | Firebase Realtime DB subscriptions |
| **Admin** | useAdmin, useAdminPlaces, useAdminReports, useHomepageSettings | Admin management operations |
| **Reviews** | usePlaceReviews | Review data fetching |
| **Interactions** | usePlaceInteractions, usePlaceStats, usePlaceChat | User interactions với places |
| **Community** | useCommunityStats, useTopContributors | Public community data |
| **Notifications** | useNotificationPreferences | User notification settings |
| **UI** | useToast, useDebounce, useLocalStorage, useNetworkStatus | UI utilities |
| **Announcements** | useAnnouncements | System announcements |

**Total:** 28 hooks

---

## 2. Authentication Hooks

### 2.1. useAuth()

**File:** `src/hooks/useAuth.ts` (368 lines)

**Purpose:** Comprehensive authentication management với Firebase Auth

**Returns:**
```typescript
{
  user: AuthUser | null,         // Current authenticated user
  loading: boolean,              // Loading state
  error: string,                 // Error message (Vietnamese)
  setError: (error: string) => void,
  loginWithEmail: (data: LoginFormData) => Promise<boolean>,
  registerWithEmail: (data: RegisterFormData) => Promise<boolean>,
  loginWithGoogle: () => Promise<boolean>,
  resetPassword: (email: string) => Promise<boolean>,
  logout: () => Promise<void>
}
```

**Key Features:**
- ✅ Email/password authentication
- ✅ Google Sign-In (popup for desktop, redirect for mobile)
- ✅ Auto-detect mobile devices → use redirect flow
- ✅ Password reset
- ✅ Auto-create missing Firestore user documents
- ✅ Email verification handling
- ✅ Enhanced error handling với Toast notifications
- ✅ Firebase Auth state persistence

**Example Usage:**
```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { user, loading, loginWithEmail, loginWithGoogle } = useAuth();

  const handleLogin = async () => {
    const success = await loginWithEmail({
      email: 'user@example.com',
      password: 'password123'
    });

    if (success) {
      router.push('/');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.displayName}!</div>;

  return (
    <div>
      <button onClick={handleLogin}>Login with Email</button>
      <button onClick={loginWithGoogle}>Login with Google</button>
    </div>
  );
}
```

**Implementation Highlights:**

```typescript
// Mobile detection for Google Sign-In
const isMobile = isMobileDevice();

if (isMobile) {
  // Use redirect for mobile (more reliable)
  await signInWithRedirect(auth, googleProvider);
} else {
  // Use popup for desktop (better UX)
  const result = await signInWithPopup(auth, googleProvider);
}

// Auto-create missing user document
if (response.status === 401) {
  const createResponse = await fetch('/api/auth/create-missing-user', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}
```

**Error Handling:**
- `auth/user-not-found` → "Không tìm thấy tài khoản"
- `auth/wrong-password` → "Mật khẩu không chính xác"
- `auth/too-many-requests` → "Quá nhiều lần thử"
- `auth/popup-blocked` → "Popup bị chặn"
- All errors show Toast notifications

---

### 2.2. useFirebaseAuth()

**File:** `src/hooks/use-firebase-auth.ts`

**Purpose:** Lower-level Firebase Auth wrapper (alternative to useAuth)

**Usage:** Primarily used internally by AuthProvider

---

## 3. Data Fetching Hooks

### 3.1. usePlaces(filters)

**File:** `src/hooks/use-places.ts`

**Purpose:** Fetch published places with filters (public API)

**Parameters:**
```typescript
filters?: {
  region?: 'bac-bo' | 'trung-bo' | 'nam-bo',
  province?: string,
  type?: 'bien' | 'nui' | 'van-hoa' | 'am-thuc' | 'check-in',
  trustLabel?: 'community' | 'contributor' | 'partner' | 'verified',
  search?: string,
  sortBy?: 'newest' | 'oldest' | 'rating' | 'popular',
  limit?: number,
  offset?: number
}
```

**Returns:**
```typescript
{
  places: Place[],
  loading: boolean,
  error: string | null,
  refetch: () => Promise<void>
}
```

**Example Usage:**
```typescript
import { usePlaces } from '@/hooks/use-places';

function PlacesList() {
  const { places, loading, error, refetch } = usePlaces({
    region: 'bac-bo',
    type: 'bien',
    sortBy: 'popular',
    limit: 10
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {places.map(place => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}
```

**API Integration:**
```typescript
// Uses apiClient.places.list()
const result = await apiClient.places.list(filters);
```

---

### 3.2. usePlace(id)

**File:** `src/hooks/use-places.ts`

**Purpose:** Fetch single place by ID hoặc slug

**Parameters:**
```typescript
id: string  // Place ID hoặc slug
```

**Returns:**
```typescript
{
  place: Place | null,
  loading: boolean,
  error: string | null
}
```

**Example Usage:**
```typescript
function PlaceDetailPage({ placeId }: { placeId: string }) {
  const { place, loading, error } = usePlace(placeId);

  if (loading) return <LoadingSkeleton />;
  if (error) return <Error404 />;
  if (!place) return <NotFound />;

  return <PlaceDetailContent place={place} />;
}
```

**Side Effects:**
- Auto-increment view count (session-based, 1-hour TTL)
- Uses `ViewTracker.trackPlaceView()` internally

---

### 3.3. useUserDrafts(options)

**File:** `src/hooks/use-user-drafts.ts` (207 lines)

**Purpose:** Manage user's draft places (create, edit, delete, submit)

**Parameters:**
```typescript
options?: {
  status?: 'draft' | 'submitted' | 'in_review' | 'rejected',
  search?: string,
  autoRefresh?: boolean  // Auto-refresh every 30s
}
```

**Returns:**
```typescript
{
  drafts: UserDraft[],
  stats: {
    total: number,
    draft: number,
    submitted: number,
    in_review: number,
    published: number,
    rejected: number
  },
  loading: boolean,
  error: string | null,
  refetch: () => Promise<void>,
  deleteDraft: (draftId: string) => Promise<{success: boolean, error?: string}>,
  duplicateDraft: (draft: UserDraft) => Promise<{success: boolean, error?: string, data?: UserDraft}>,
  submitForReview: (draftId: string) => Promise<{success: boolean, error?: string}>
}
```

**Example Usage:**
```typescript
import { useUserDrafts } from '@/hooks/use-user-drafts';

function MyDraftsPage() {
  const {
    drafts,
    stats,
    loading,
    deleteDraft,
    submitForReview
  } = useUserDrafts({ autoRefresh: true });

  const handleSubmit = async (draftId: string) => {
    const result = await submitForReview(draftId);

    if (result.success) {
      toast.success('Đã gửi để kiểm duyệt');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      <DraftStats stats={stats} />
      {drafts.map(draft => (
        <DraftCard
          key={draft.id}
          draft={draft}
          onSubmit={() => handleSubmit(draft.id)}
          onDelete={() => deleteDraft(draft.id)}
        />
      ))}
    </div>
  );
}
```

**Key Methods:**

```typescript
// Delete draft
const { success, error } = await deleteDraft('draft-id');

// Duplicate draft (create copy)
const { success, data } = await duplicateDraft(existingDraft);
// Returns new draft với name: "{original} (Sao chép)"

// Submit for moderation
const { success, error } = await submitForReview('draft-id');
// Changes status: draft → submitted
```

**Auto-refresh Pattern:**
```typescript
// Enable auto-refresh every 30 seconds
const { drafts } = useUserDrafts({
  autoRefresh: true
});

// Useful for moderation status tracking
```

---

### 3.4. useUserContributions()

**File:** `src/hooks/use-user-contributions.ts`

**Purpose:** Fetch user's published places + drafts (combined view)

**Returns:**
```typescript
{
  published: Place[],
  drafts: UserDraft[],
  loading: boolean,
  error: string | null
}
```

**Example Usage:**
```typescript
function MyContributionsPage() {
  const { published, drafts, loading } = useUserContributions();

  return (
    <div>
      <section>
        <h2>Đã xuất bản ({published.length})</h2>
        {published.map(place => <PlaceCard key={place.id} place={place} />)}
      </section>

      <section>
        <h2>Bản nháp ({drafts.length})</h2>
        {drafts.map(draft => <DraftCard key={draft.id} draft={draft} />)}
      </section>
    </div>
  );
}
```

---

### 3.5. usePlaceReviews(placeId, options)

**File:** `src/hooks/use-place-reviews.ts`

**Purpose:** Fetch và manage reviews cho place

**Parameters:**
```typescript
placeId: string
options?: {
  sortBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful',
  limit?: number,
  autoRefresh?: boolean
}
```

**Returns:**
```typescript
{
  reviews: Review[],
  loading: boolean,
  error: string | null,
  totalReviews: number,
  averageRating: number,
  ratingBreakdown: {
    5: number,
    4: number,
    3: number,
    2: number,
    1: number
  },
  refetch: () => Promise<void>,
  createReview: (reviewData) => Promise<{success: boolean, error?: string}>
}
```

**Example Usage:**
```typescript
function PlaceReviews({ placeId }: { placeId: string }) {
  const {
    reviews,
    loading,
    averageRating,
    ratingBreakdown,
    createReview
  } = usePlaceReviews(placeId, { sortBy: 'most_helpful' });

  const handleSubmitReview = async (reviewData) => {
    const result = await createReview({
      rating: 5,
      title: 'Tuyệt vời!',
      content: 'Địa điểm rất đẹp...',
      images: [],
      visitDate: '2025-09-15',
      isAnonymous: false
    });

    if (result.success) {
      toast.success('Đánh giá đã được gửi');
    }
  };

  return (
    <div>
      <RatingSummary
        average={averageRating}
        breakdown={ratingBreakdown}
      />
      <ReviewList reviews={reviews} />
      <ReviewModal onSubmit={handleSubmitReview} />
    </div>
  );
}
```

---

### 3.6. useUserCollections()

**File:** `src/hooks/use-user-collections.ts`

**Purpose:** Fetch user's saved và favorited places

**Returns:**
```typescript
{
  savedPlaces: Place[],
  favoritedPlaces: Place[],
  loading: boolean,
  error: string | null
}
```

---

## 4. Real-time & Notifications Hooks

### 4.1. useRealtimeNotifications()

**File:** `src/hooks/use-realtime-notifications.ts` (294 lines)

**Purpose:** Real-time notification listener via Firebase Realtime DB

**Returns:**
```typescript
{
  notifications: RealtimeNotification[],
  unreadCount: number,
  isConnected: boolean,
  markAsRead: (notificationId: string) => Promise<void>,
  markAllAsRead: () => Promise<void>,
  sendNotification: (userId, type, title, message, data, priority) => Promise<void>
}
```

**Notification Types:** 30+ types including:
- `place_received`, `place_claimed`, `place_in_review`
- `place_approved`, `place_rejected`, `revision_requested`
- `new_moderation_item`, `moderation_escalated`
- `place_liked`, `place_saved`, `place_review_posted`
- `system_maintenance`, `security_alert`, `feature_update`

**Example Usage:**
```typescript
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';

function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead
  } = useRealtimeNotifications();

  return (
    <div>
      <Bell count={unreadCount} isOnline={isConnected} />

      <Dropdown>
        <button onClick={markAllAsRead}>Đánh dấu tất cả đã đọc</button>

        {notifications.slice(0, 10).map(notif => (
          <NotificationItem
            key={notif.id}
            notification={notif}
            onRead={() => markAsRead(notif.id)}
          />
        ))}
      </Dropdown>
    </div>
  );
}
```

**Real-time Features:**
- ✅ Auto-subscribe on user login
- ✅ Auto-show toast for high-priority notifications
- ✅ Moderator alerts (separate channel for moderator/admin)
- ✅ User presence tracking (update every 30s)
- ✅ Connection status monitoring

**Toast Integration:**
```typescript
// High-priority notifications auto-show toast
if (notification.priority === 'high' && !notification.read) {
  toast[type](notification.message, notification.title, {
    persistent: true,
    duration: 8000
  });
}
```

---

### 4.2. useUserPresence()

**File:** `src/hooks/use-realtime-notifications.ts`

**Purpose:** Track user online/offline status

**Returns:**
```typescript
{
  isOnline: boolean
}
```

**Example Usage:**
```typescript
function UserProfile() {
  const { isOnline } = useUserPresence();

  return (
    <div>
      <Avatar />
      <StatusIndicator online={isOnline} />
    </div>
  );
}
```

**Implementation:**
- Updates presence every 30 seconds when online
- Listens to `window.online/offline` events
- Listens to `document.visibilitychange`
- Writes to Firebase Realtime DB: `user_presence/{userId}`

---

### 4.3. useModeratorNotifications()

**File:** `src/hooks/use-realtime-notifications.ts`

**Purpose:** Real-time moderation queue updates (moderator/admin only)

**Returns:**
```typescript
{
  moderationUpdates: ModerationUpdate[],
  onlineModeratorCount: number
}
```

**Example Usage:**
```typescript
function ModeratorDashboard() {
  const { moderationUpdates, onlineModeratorCount } = useModeratorNotifications();

  return (
    <div>
      <div>Online moderators: {onlineModeratorCount}</div>

      <div>Recent updates ({moderationUpdates.length})</div>
      {moderationUpdates.map(update => (
        <UpdateCard key={update.id} update={update} />
      ))}
    </div>
  );
}
```

**Realtime Data Sources:**
- `moderation_queue_updates` → Recent queue actions
- `user_presence` → Online moderator count

---

### 4.4. useRealtimeAuditLogs()

**File:** `src/hooks/use-realtime-audit-logs.ts`

**Purpose:** Real-time admin audit log stream

**Returns:**
```typescript
{
  logs: AuditLog[],
  loading: boolean
}
```

---

## 5. Admin & Moderation Hooks

### 5.1. useAdmin()

**File:** `src/hooks/use-admin.ts` (large file with multiple admin functions)

**Purpose:** Centralized admin operations

**Returns:**
```typescript
{
  // User management
  fetchUsers: (filters) => Promise<User[]>,
  changeUserRole: (userId, newRole, reason) => Promise<boolean>,
  toggleUserStatus: (userId, disabled) => Promise<boolean>,

  // Settings
  fetchSettings: () => Promise<Settings>,
  updateSettings: (settings) => Promise<boolean>,

  // Analytics
  fetchAnalytics: () => Promise<Analytics>,

  // Homepage settings
  fetchHomepageSettings: () => Promise<HomepageSettings>,
  updateHomepageSettings: (settings) => Promise<boolean>,
  uploadRegionImage: (region, file) => Promise<string>
}
```

**Example Usage:**
```typescript
function AdminUsersPage() {
  const { fetchUsers, changeUserRole } = useAdmin();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers({ role: 'contributor' }).then(setUsers);
  }, []);

  const handleRoleChange = async (userId: string) => {
    const success = await changeUserRole(
      userId,
      'partner',
      'User đóng góp xuất sắc'
    );

    if (success) {
      toast.success('Đã cập nhật role');
      fetchUsers().then(setUsers); // Refresh
    }
  };

  return (
    <UserTable
      users={users}
      onRoleChange={handleRoleChange}
    />
  );
}
```

---

### 5.2. useAdminPlaces()

**File:** `src/hooks/use-admin-places-stable.ts`

**Purpose:** Admin view all places (all statuses)

**Parameters:**
```typescript
filters?: {
  status?: string,
  region?: string,
  type?: string,
  search?: string
}
```

**Returns:**
```typescript
{
  places: Place[],
  loading: boolean,
  error: string | null,
  total: number,
  refetch: () => Promise<void>
}
```

---

### 5.3. useAdminReports()

**File:** `src/hooks/use-admin-reports.ts`

**Purpose:** Manage user reports (places, reviews, users)

**Parameters:**
```typescript
filters?: {
  status?: 'pending' | 'investigating' | 'resolved' | 'dismissed',
  type?: 'place' | 'review' | 'user',
  priority?: 'urgent' | 'high' | 'medium' | 'low'
}
```

**Returns:**
```typescript
{
  reports: Report[],
  loading: boolean,
  error: string | null,
  total: number,
  refetch: () => Promise<void>,
  claimReport: (reportId: string) => Promise<boolean>,
  resolveReport: (reportId, action, notes) => Promise<boolean>
}
```

**Example Usage:**
```typescript
function ReportsManagement() {
  const {
    reports,
    loading,
    claimReport,
    resolveReport
  } = useAdminReports({ status: 'pending' });

  const handleClaim = async (reportId: string) => {
    const success = await claimReport(reportId);
    if (success) {
      toast.success('Đã tiếp nhận báo cáo');
    }
  };

  const handleResolve = async (reportId: string) => {
    const success = await resolveReport(reportId, 'hide_content', 'Nội dung vi phạm');
    if (success) {
      toast.success('Đã xử lý báo cáo');
    }
  };

  return (
    <ReportList
      reports={reports}
      onClaim={handleClaim}
      onResolve={handleResolve}
    />
  );
}
```

---

### 5.4. useHomepageSettings()

**File:** `src/hooks/use-homepage-settings.ts`

**Purpose:** Manage homepage carousel, featured content

**Returns:**
```typescript
{
  settings: HomepageSettings,
  loading: boolean,
  updateSettings: (settings) => Promise<boolean>,
  uploadImage: (region, file) => Promise<string>
}
```

---

## 6. UI & Utility Hooks

### 6.1. useToast()

**File:** `src/hooks/use-toast.ts`

**Purpose:** Trigger toast notifications

**Returns:**
```typescript
{
  toast: {
    success: (title: string, description?: string, options?) => void,
    error: (title: string, description?: string, options?) => void,
    warning: (title: string, description?: string, options?) => void,
    info: (title: string, description?: string, options?) => void
  }
}
```

**Example Usage:**
```typescript
import { useToast } from '@/hooks/use-toast';

function SaveButton() {
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Lưu thành công', 'Dữ liệu đã được cập nhật');
    } catch (error) {
      toast.error('Lưu thất bại', error.message);
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

**Toast Options:**
```typescript
toast.success('Title', 'Description', {
  duration: 5000,        // Auto-dismiss after 5s
  persistent: false,     // If true, no auto-dismiss
  position: 'top-right', // Position on screen
  action: {              // Optional action button
    label: 'Undo',
    onClick: () => {}
  }
});
```

---

### 6.2. useDebounce(value, delay)

**File:** `src/hooks/use-debounce.ts`

**Purpose:** Debounce giá trị input (reduce API calls)

**Parameters:**
```typescript
value: T           // Value to debounce
delay: number      // Delay in milliseconds
```

**Returns:** Debounced value

**Example Usage:**
```typescript
import { useDebounce } from '@/hooks/use-debounce';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      // Chỉ call API sau khi user ngừng gõ 500ms
      searchPlaces(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Tìm địa điểm..."
    />
  );
}
```

---

### 6.3. useLocalStorage(key, initialValue)

**File:** `src/hooks/use-local-storage.ts`

**Purpose:** Sync state với localStorage

**Parameters:**
```typescript
key: string        // localStorage key
initialValue: T    // Default value if key not found
```

**Returns:**
```typescript
[value: T, setValue: (value: T) => void]
```

**Example Usage:**
```typescript
import { useLocalStorage } from '@/hooks/use-local-storage';

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

**Features:**
- ✅ Auto-sync across tabs/windows
- ✅ SSR-safe (check `typeof window !== 'undefined'`)
- ✅ JSON serialization/deserialization
- ✅ Error handling for invalid JSON

---

### 6.4. useNetworkStatus()

**File:** `src/hooks/use-network-status.ts`

**Purpose:** Detect online/offline status

**Returns:**
```typescript
{
  isOnline: boolean
}
```

**Example Usage:**
```typescript
import { useNetworkStatus } from '@/hooks/use-network-status';

function App() {
  const { isOnline } = useNetworkStatus();

  return (
    <div>
      {!isOnline && (
        <Banner type="warning">
          Bạn đang offline. Một số tính năng có thể không khả dụng.
        </Banner>
      )}
      <MainContent />
    </div>
  );
}
```

---

### 6.5. usePlaceInteractions(placeId, initialLikeCount, initialSaveCount)

**File:** `src/hooks/use-place-interactions.ts` (242 lines)

**Purpose:** Manage place likes và saves với optimistic UI

**Parameters:**
```typescript
placeId: string
initialLikeCount?: number
initialSaveCount?: number
```

**Returns:**
```typescript
{
  interactions: {
    isLiked: boolean,
    isSaved: boolean,
    likeCount: number,
    saveCount: number
  },
  isLoading: boolean,
  toggleLike: () => Promise<void>,
  toggleSave: () => Promise<void>,
  error: string | null
}
```

**Example Usage:**
```typescript
import { usePlaceInteractions } from '@/hooks/use-place-interactions';

function PlaceActions({ placeId, initialLikes, initialSaves }) {
  const {
    interactions,
    isLoading,
    toggleLike,
    toggleSave
  } = usePlaceInteractions(placeId, initialLikes, initialSaves);

  return (
    <div>
      <button
        onClick={toggleLike}
        disabled={isLoading}
        className={interactions.isLiked ? 'active' : ''}
      >
        <Heart fill={interactions.isLiked} />
        {interactions.likeCount}
      </button>

      <button
        onClick={toggleSave}
        disabled={isLoading}
        className={interactions.isSaved ? 'active' : ''}
      >
        <Bookmark fill={interactions.isSaved} />
        {interactions.saveCount}
      </button>
    </div>
  );
}
```

**Features:**
- ✅ Optimistic UI updates (instant feedback)
- ✅ Rollback on error
- ✅ Real-time sync với Firestore + Realtime DB
- ✅ Session persistence
- ✅ Login required checks

---

### 6.6. usePlaceStats(placeId)

**File:** `src/hooks/use-place-stats.ts`

**Purpose:** Real-time place statistics (views, likes, saves)

**Parameters:**
```typescript
placeId: string
```

**Returns:**
```typescript
{
  stats: {
    views: number,
    likes: number,
    saves: number,
    reviews: number
  },
  loading: boolean
}
```

**Related Hooks:**
```typescript
// Compact number formatting (1.2K, 1.5M)
usePlaceStatsCompact(placeId)

// View count tracking with auto-increment
useViewTracking(placeId, initialViewCount)
```

---

### 6.7. usePlaceChat(placeId)

**File:** `src/hooks/use-place-chat.ts`

**Purpose:** AI chatbot for place-specific Q&A

**Parameters:**
```typescript
placeId: string
```

**Returns:**
```typescript
{
  messages: Message[],
  isLoading: boolean,
  error: string | null,
  sendMessage: (message: string) => Promise<void>,
  clearChat: () => void
}
```

**Example Usage:**
```typescript
import { usePlaceChat } from '@/hooks/use-place-chat';

function PlaceChatWidget({ placeId }) {
  const { messages, isLoading, sendMessage } = usePlaceChat(placeId);

  const handleSend = async (text: string) => {
    await sendMessage(text);
  };

  return (
    <ChatWidget>
      <MessageList messages={messages} />
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </ChatWidget>
  );
}
```

**Features:**
- ✅ Context-aware responses (place data injected)
- ✅ Session persistence (client-side storage)
- ✅ Rate limiting (10 Q&A per day per place per user)
- ✅ Quick question suggestions
- ✅ Cost: ~$0.00026 per turn (~650 VND)

---

## 7. Key Components

### 7.1. Header

**File:** `src/components/header.tsx`

**Purpose:** Main navigation bar

**Features:**
- ✅ Logo + navigation links
- ✅ Search bar
- ✅ Auth buttons (login/register/profile)
- ✅ Notification bell
- ✅ Mobile responsive menu

**Usage:**
```tsx
import { Header } from '@/components/header';

function Layout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

**IMPORTANT:** All user-facing pages MUST include `<Header />` (root layout does NOT include it)

---

### 7.2. PlaceCard

**File:** `src/components/place-card.tsx`

**Purpose:** Display place trong grid/list

**Props:**
```typescript
{
  place: Place,
  variant?: 'compact' | 'detailed',
  showStats?: boolean
}
```

**Example:**
```tsx
<PlaceCard
  place={place}
  variant="detailed"
  showStats={true}
/>
```

---

### 7.3. PlaceDetailContent

**File:** `src/components/place-detail-content.tsx`

**Purpose:** Full place detail page content

**Props:**
```typescript
{
  place: Place,
  initialReviews?: Review[]
}
```

**Features:**
- ✅ Image gallery with lightbox
- ✅ Place information tabs
- ✅ Reviews section với pagination
- ✅ Like/Save buttons
- ✅ Report button
- ✅ AI chatbot widget
- ✅ Share buttons

---

### 7.4. AuthProvider

**File:** `src/components/auth/auth-provider.tsx`

**Purpose:** Context provider for authentication

**Usage:**
```tsx
// In app/layout.tsx
import { AuthProvider } from '@/components/auth/auth-provider';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

**Provides:**
```typescript
{
  user: User | null,
  loading: boolean,
  isAuthenticated: boolean,
  login: (email, password) => Promise<boolean>,
  logout: () => Promise<void>,
  // ... other auth methods
}
```

---

### 7.5. NotificationBell

**File:** `src/components/notifications/notification-bell.tsx`

**Purpose:** Real-time notification dropdown

**Features:**
- ✅ Unread count badge
- ✅ Dropdown với last 10 notifications
- ✅ Mark as read on click
- ✅ "Xem tất cả" link to `/notifications`

**Usage:**
```tsx
import { NotificationBell } from '@/components/notifications/notification-bell';

function Header() {
  return (
    <header>
      <Logo />
      <Nav />
      <NotificationBell />
      <UserMenu />
    </header>
  );
}
```

---

### 7.6. ReviewModal

**File:** `src/components/modals/review-modal.tsx`

**Purpose:** Modal form để tạo review

**Props:**
```typescript
{
  placeId: string,
  onSuccess?: () => void,
  onClose: () => void
}
```

**Features:**
- ✅ Star rating selector
- ✅ Title + content fields
- ✅ Image upload (max 4)
- ✅ Visit date picker
- ✅ Anonymous checkbox
- ✅ Form validation

---

### 7.7. ReportModal

**File:** `src/components/modals/report-modal.tsx`

**Purpose:** Modal form để báo cáo content

**Props:**
```typescript
{
  contentType: 'place' | 'review' | 'user',
  contentId: string,
  onSuccess?: () => void,
  onClose: () => void
}
```

---

### 7.8. ImageUpload

**File:** `src/components/image-upload.tsx`

**Purpose:** Reusable image upload với preview

**Props:**
```typescript
{
  images: PlaceImage[],
  onChange: (images: PlaceImage[]) => void,
  maxImages?: number,
  acceptUrl?: boolean  // Allow URL input
}
```

**Features:**
- ✅ Drag & drop
- ✅ File upload (JPG, PNG, WebP)
- ✅ URL input (optional)
- ✅ Preview với reorder
- ✅ Set primary image
- ✅ Max size: 5MB per image
- ✅ Auto-resize to 1200x800px

---

### 7.9. RichTextEditor

**File:** `src/components/editor/rich-text-editor.tsx`

**Purpose:** WYSIWYG editor for descriptions

**Props:**
```typescript
{
  value: string,
  onChange: (value: string) => void,
  placeholder?: string
}
```

**Features:**
- ✅ Bold, italic, underline
- ✅ Headings (H1-H3)
- ✅ Lists (ordered, unordered)
- ✅ Links
- ✅ Code blocks
- ✅ Markdown support

---

### 7.10. ErrorBoundary

**File:** `src/components/error-boundary.tsx`

**Purpose:** Catch React errors và show fallback UI

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/error-boundary';

function App() {
  return (
    <ErrorBoundary>
      <SomeComponent />
    </ErrorBoundary>
  );
}
```

---

## 8. Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── admin/                    # Admin-specific components
│   │   ├── admin-layout.tsx
│   │   ├── admin-sidebar.tsx
│   │   └── modern-metric-card.tsx
│   ├── auth/                     # Authentication components
│   │   ├── auth-provider.tsx
│   │   ├── login-modal.tsx
│   │   └── register-modal.tsx
│   ├── modals/                   # Modal dialogs
│   │   ├── review-modal.tsx
│   │   └── report-modal.tsx
│   ├── notifications/            # Notification components
│   │   ├── notification-bell.tsx
│   │   └── notification-preferences.tsx
│   ├── ui/                       # Base UI components (Radix UI)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown.tsx
│   │   └── toast.tsx
│   ├── pwa/                      # PWA components
│   │   ├── install-prompt.tsx
│   │   └── service-worker-registration.tsx
│   ├── header.tsx                # Main navigation
│   ├── footer.tsx                # Footer
│   ├── place-card.tsx            # Place card
│   ├── place-detail-content.tsx  # Place detail page
│   └── ...
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── use-places.ts
│   ├── use-realtime-notifications.ts
│   └── ...
└── lib/
    ├── client/                   # Client-side libraries
    │   └── api.ts                # API client wrapper
    ├── server/                   # Server-side libraries
    │   ├── firebaseAdmin.ts
    │   └── auth-middleware.ts
    └── types/                    # TypeScript types
        ├── auth.ts
        ├── places.ts
        └── ...
```

### Component Hierarchy (Example: Place Detail Page)

```
PlaceDetailPage (Server Component)
└── PlaceDetailContent (Client Component)
    ├── ImageGallery
    │   └── Lightbox
    ├── PlaceInfo
    │   ├── RatingDisplay
    │   ├── LocationMap
    │   └── FacilitiesList
    ├── PlaceActions
    │   ├── LikeButton (usePlaceInteractions)
    │   ├── SaveButton (usePlaceInteractions)
    │   └── ShareButton
    ├── TabNavigation
    │   ├── OverviewTab
    │   ├── ReviewsTab
    │   │   ├── ReviewList (usePlaceReviews)
    │   │   ├── ReviewItem
    │   │   │   ├── HelpfulButton
    │   │   │   └── ReportButton
    │   │   └── ReviewModal
    │   └── ChatTab
    │       └── PlaceChatWidget (usePlaceChat)
    └── ReportModal
```

---

## 9. Best Practices

### 9.1. Hook Usage Rules

**✅ DO:**
```typescript
// 1. Call hooks at top level
function Component() {
  const { user } = useAuth();
  const { places } = usePlaces();

  return <div>...</div>;
}

// 2. Use custom hooks for logic reuse
function usePlaceWithStats(placeId: string) {
  const { place } = usePlace(placeId);
  const { stats } = usePlaceStats(placeId);

  return { place, stats };
}

// 3. Combine hooks for complex features
function PlaceInteractionButtons({ placeId }) {
  const { isAuthenticated } = useAuth();
  const { toggleLike, toggleSave } = usePlaceInteractions(placeId);
  const { toast } = useToast();

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    await toggleLike();
  };

  return <button onClick={handleLike}>Like</button>;
}
```

**❌ DON'T:**
```typescript
// 1. NEVER call hooks in loops
reviews.map(review => {
  const [state, setState] = useState(); // ❌ ERROR!
  return <div>...</div>;
});

// 2. NEVER call hooks conditionally
if (condition) {
  const { user } = useAuth(); // ❌ ERROR!
}

// 3. NEVER call hooks in callbacks
function handleClick() {
  const { user } = useAuth(); // ❌ ERROR!
}
```

**Solution:** Extract to separate component
```typescript
// ✅ CORRECT
const ReviewItem = ({ review }) => {
  const [state, setState] = useState();
  return <div>...</div>;
};

reviews.map(review => <ReviewItem key={review.id} review={review} />);
```

---

### 9.2. API Call Patterns

**✅ Use callApi or apiClient:**
```typescript
import { callApi, apiClient } from '@/lib/client/api';

// Option 1: Using apiClient (recommended)
const result = await apiClient.places.list({ region: 'bac-bo' });

// Option 2: Using callApi directly
const result = await callApi('/places', {
  method: 'GET'
});
```

**❌ DON'T manually implement fetch:**
```typescript
// ❌ BAD - Missing auth header, error handling
const response = await fetch('/api/places');
```

---

### 9.3. Error Handling

**✅ Always handle errors:**
```typescript
const { places, loading, error } = usePlaces();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage>{error}</ErrorMessage>;

return <PlacesList places={places} />;
```

**✅ Show user-friendly error messages:**
```typescript
try {
  await submitForReview(draftId);
  toast.success('Đã gửi để kiểm duyệt');
} catch (error) {
  toast.error('Có lỗi xảy ra', error.message || 'Vui lòng thử lại');
}
```

---

### 9.4. Loading States

**✅ Provide visual feedback:**
```typescript
function PlacesList() {
  const { places, loading } = usePlaces();

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PlaceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {places.map(place => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}
```

---

### 9.5. Optimistic UI Updates

**✅ Instant feedback for user actions:**
```typescript
const { toggleLike } = usePlaceInteractions(placeId);

// Hook internally does:
const handleLike = async () => {
  // 1. Optimistically update UI
  setIsLiked(!isLiked);
  setLikeCount(prev => prev + (isLiked ? -1 : 1));

  try {
    // 2. Call API
    await callApi(`/places/${placeId}/favorite`, { method: 'POST' });
  } catch (error) {
    // 3. Rollback on error
    setIsLiked(isLiked);
    setLikeCount(prev => prev + (isLiked ? 1 : -1));
    toast.error('Có lỗi xảy ra');
  }
};
```

---

### 9.6. Real-time Data Sync

**✅ Subscribe to real-time updates:**
```typescript
function PlaceStats({ placeId }) {
  const { stats } = usePlaceStats(placeId);
  // Hook subscribes to Firebase Realtime DB
  // Auto-updates when data changes

  return (
    <div>
      <div>{stats.views} lượt xem</div>
      <div>{stats.likes} lượt thích</div>
      <div>{stats.saves} lượt lưu</div>
    </div>
  );
}
```

---

### 9.7. Component Import Rule

**✅ ALWAYS import components before using:**
```typescript
// ✅ CORRECT
import { PlaceCard } from '@/components/place-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function PlacesList() {
  return (
    <>
      <LoadingSpinner />
      <PlaceCard place={place} />
    </>
  );
}
```

**❌ Using component without import:**
```typescript
// ❌ ERROR - Runtime error
function PlacesList() {
  return <PlaceCard place={place} />; // ← PlaceCard not imported!
}
```

**Rule:** Every time you type `<ComponentName />`, check imports first!

---

### 9.8. Type Safety

**✅ Use TypeScript types:**
```typescript
import { Place } from '@/lib/types/places';
import { User } from '@/lib/types/auth';

interface PlaceCardProps {
  place: Place;
  variant?: 'compact' | 'detailed';
}

function PlaceCard({ place, variant = 'compact' }: PlaceCardProps) {
  // TypeScript ensures place has correct shape
  return <div>{place.name}</div>;
}
```

---

### 9.9. Memoization

**✅ Use useMemo for expensive computations:**
```typescript
import { useMemo } from 'react';

function ReviewStats({ reviews }) {
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  return <div>Average: {averageRating.toFixed(1)}</div>;
}
```

**✅ Use useCallback for stable function references:**
```typescript
import { useCallback } from 'react';

function PlacesList() {
  const { refetch } = usePlaces();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return <RefreshButton onClick={handleRefresh} />;
}
```

---

## 10. Common Patterns

### Pattern 1: Authentication Check

```typescript
function ProtectedButton() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    // Proceed with action
    performAction();
  };

  return <button onClick={handleClick}>Action</button>;
}
```

### Pattern 2: Permission Check

```typescript
import { hasPermission } from '@/lib/auth/permissions';

function AdminButton() {
  const { user } = useAuth();

  if (!user || !hasPermission(user, 'manage_users')) {
    return null; // Don't render
  }

  return <button>Manage Users</button>;
}
```

### Pattern 3: Data Fetching với Loading & Error

```typescript
function DataComponent() {
  const { data, loading, error, refetch } = useSomeData();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data || data.length === 0) return <EmptyState />;

  return <DataList data={data} />;
}
```

### Pattern 4: Form Submission

```typescript
function FormComponent() {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitData(formData);

      if (result.success) {
        toast.success('Gửi thành công');
        router.push('/success');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={(e) => setFormData({...formData, field: e.target.value})} />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang gửi...' : 'Gửi'}
      </button>
    </form>
  );
}
```

---

**END OF FRONTEND COMPONENTS & HOOKS DOCUMENTATION**

**Total Hooks Documented:** 28+
**Total Components:** 50+ key components
**Last Updated:** 2025-10-10
