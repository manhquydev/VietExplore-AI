import { auth } from '@/lib/firebase'; // Assuming you have a central firebase init file

/**
 * A generic helper function to make authenticated API calls to the Next.js backend.
 * It automatically includes the Firebase Auth ID token in the headers.
 *
 * @param endpoint The API endpoint to call (e.g., 'admin/role').
 * @param method The HTTP method to use (e.g., 'POST', 'GET').
 * @param data The data to send in the request body for POST/PUT requests.
 * @returns A promise that resolves with the JSON response from the API.
 * @throws {Error} If the user is not authenticated or if the API call fails.
 */
export async function callApi<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
  data?: object
): Promise<T> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Authentication required. Please sign in.');
  }

  const token = await user.getIdToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`/api/${endpoint}`, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: 'An unknown error occurred.' };
    }
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  // Handle cases with no content in response
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return response.json();
  } else {
    return Promise.resolve({} as T);
  }
}
