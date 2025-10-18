'use server'
import axios from 'axios';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const baseUrl = process.env.API_BASE_URL;

const AxiosInterceptor = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
});

AxiosInterceptor.interceptors.request.use(async (config) => {
  console.log('==========URL==========================');
  console.log(config.url);
  console.log('=========URL===========================');
  const token = await getAuthTokenServer();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

AxiosInterceptor.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error('API error:',error );

    if (error.response?.status === 401 || error.response?.status === 422) {
      const getRefreshToken = await getRefreshTokenServer();
      if (getRefreshToken) {

        await refreshAuthTokenServer();
      }else{
        throw new Error('Unauthorized');
      }

    }
    return error;
  }
);

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: string;
  accessible_dealers: string[];
  permissions: Record<string, string[]>;
}

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user_id: string; 
};

/**
 * Get authentication token from cookies (server-side)
 */
export async function getAuthTokenServer(): Promise<string | null> {

  try {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value || null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticatedServer(): Promise<boolean> {
  const token = await getAuthTokenServer();
  return token !== null;
}

/**
 * Redirect user if not authenticated
 */
const redirectUser = async () => {
     redirect('/');

};

/**
 * Get current user from server-side token
 */
export async function getCurrentUserServer(): Promise<any> {
  
  try {
    const profileUrl = `/v1/auth/profile`;
    const response = await AxiosInterceptor.get(profileUrl);
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get dealers list
 */
export async function getDealers(): Promise<any> {
  try {
    const dealersUrl = `/v1/dealer/main-list`;
    const response = await AxiosInterceptor.get(dealersUrl);

    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get session history
 */
export async function getSessionHistory({ session_id, dealerId }: { session_id: string, dealerId: string }): Promise<any> {
  try {
    const response = await AxiosInterceptor.get(`/v1/history/${session_id}`, {
      headers: {
        'main-dealer-id': dealerId,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch session list
 */
export async function fetchSessionList({ dealerId }: { dealerId: string }): Promise<any> {
  const isAuthenticated = await isAuthenticatedServer();
  if (!isAuthenticated) {
    return null;
  }

  try {
    const response = await AxiosInterceptor.get('/v1/session', {
      headers: {
        'main-dealer-id': dealerId,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Refresh authentication token
 */

let id = null;
export async function refreshAuthTokenServer(): Promise<AuthResponse> {
  try {
    const sectRefreshToken = await getRefreshTokenServer();
    const response = await AxiosInterceptor.post(`/v1/auth/refresh`, {
      refresh_token: sectRefreshToken
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
   if (response.data.access_token && response.data.refresh_token) {
    id=1
     await setAuthTokenServer(response.data.access_token);
     await setRefreshTokenServer(response.data.refresh_token);
   }
    return response.data;
  } catch (error) {
    throw error;
  }
} 

/**
 * Get messages by session ID
 */
export async function getMessagesBySessionId({ id, dealerId }: { id: string; dealerId?: string }): Promise<any[] | null> {
  const isAuthenticated = await isAuthenticatedServer();
  if (!isAuthenticated || !id) {
    return null;
  }
  
  try {
    const headers: Record<string, string> = {
      'accept': 'application/json',
    };
    
    if (dealerId) {
      headers['main-dealer-id'] = dealerId;
    }
    
    const response = await AxiosInterceptor.get(`/v1/history/${id}`, {
      headers,
    });
    
    return response.data || [];
  } catch (error) {
    return [];
  }
}

/**
 * Set authentication token in cookies (server-side)
 */
export async function setAuthTokenServer(token: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    
    cookieStore.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    
    return true;
  } catch (error) {
    console.error('Failed to set auth token:', error);
    return false;
  }
}

/**
 * Set refresh token in cookies (server-side)
 */
export async function setRefreshTokenServer(refreshToken: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });
    
    return true;
  } catch (error) {
    console.error('Failed to set refresh token:', error);
    return false;
  }
}

/**
 * Get refresh token from cookies (server-side)
 */
export async function getRefreshTokenServer(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('refresh_token')?.value || null;
  } catch (error) {
    return null;
  }
}

/**
 * Remove authentication tokens (logout)
 */
export async function removeAuthTokensServer(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    
    return true;
  } catch (error) {
    console.error('Failed to remove auth tokens:', error);
    return false;
  }
}

/**
 * Set both access and refresh tokens
 */
export async function setAuthTokensServer(accessToken: string, refreshToken: string): Promise<boolean> {
  try {
    const accessSuccess = await setAuthTokenServer(accessToken);
    const refreshSuccess = await setRefreshTokenServer(refreshToken);
    
    return accessSuccess && refreshSuccess;
  } catch (error) {
    console.error('Failed to set auth tokens:', error);
    return false;
  }
}

/**
 * Get dealer ID from cookies
 */
export async function getDealerIdServer(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('main-dealer-id')?.value || null;
  } catch (error) {
    return null;
  }
}

/**
 * Set dealer ID in cookies
 */
export async function setDealerIdServer(dealerId: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    
    cookieStore.set('main-dealer-id', dealerId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });
    
    return true;
  } catch (error) {
    console.error('Failed to set dealer ID:', error);
    return false;
  }
}

/**
 * Remove dealer ID from cookies
 */
export async function removeDealerIdServer(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    
    cookieStore.delete('main-dealer-id');
    
    return true;
  } catch (error) {
    console.error('Failed to remove dealer ID:', error);
    return false;
  }
}

/**
 * Logout action - clears all auth data and redirects
 */
export async function logoutAction(): Promise<void> {
  await removeAuthTokensServer();
  await removeDealerIdServer();
  redirect('/login');
}

/**
 * Login action
 */
export async function loginAction({ username, password }: { username: string, password: string }): Promise<any> {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axios.post(`${baseUrl}/v1/auth/login`, formData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export const getUserAndDealersImproved = async () => {
  try {
    const [user, dealerResponses] = await Promise.all([
      getCurrentUserServer(),
      getDealers()
    ]);


    
    
    return { user, dealerResponses };
  } catch (error) {
   throw error;
  }
};
