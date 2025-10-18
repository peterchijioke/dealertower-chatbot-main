'use client';

import {  useDealerStore } from '@/stores/dealer-store';
import {  useSessionStore } from '@/stores/session-store';
import { fetchSessionList, getAuthTokenServer, loginAction, logoutAction, setAuthTokensServer } from './auth-server';
import { useMessagesStore } from '@/stores/messages-store';
import { redirect } from 'next/navigation';




/**
 * Clear all client-side stores and data
 */


async function clearAllClientData() {
  if (typeof window === 'undefined') return;
  useDealerStore.getState().clearAllUserData();
  useSessionStore.getState().clearSession();
}

export { clearAllClientData };

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

export interface DealerResponse {
  id: string;
  name: string;
}

export interface ChatSessionResponse {
  id: string;
  title: string;
}

/**
 * Get authentication token from cookies (client-side)
 */
export async function getAuthToken(): Promise<string> {
 const token = await getAuthTokenServer()||"";
 return token;
}

/**
 * Set authentication token in cookies (client-side)
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Set cookie with secure options
  document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
}

/**
 * Set refresh token in cookies (client-side)
 */
export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Set cookie with secure options
  document.cookie = `refresh_token=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
}

/**
 * Remove authentication token from cookies (client-side)
 */


/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return token !== null;
}

/**
 * Refresh authentication token
 */


/**
 * Login user with username and password
 */
export async function loginUser(username: string, password: string, captchaToken?: string): Promise<{ success: boolean; access_token?: string; refresh_token?: string; user_id?: string; message?: string }> {

  
  try {
    const requestBody = {
      username,
      password
    };

    const response = await loginAction(requestBody);

    if (response.access_token && response.refresh_token && response.user_id) {
      await setAuthTokensServer(response.access_token, response.refresh_token);

      // Store both tokens  
      setAuthToken(response.access_token);
      setRefreshToken(response.refresh_token);

      return {
        success: true,
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        user_id: response.user_id,
      };
    }

    return { 
      success: false, 
      message: 'Invalid response format'
    };
  } catch (error) {
     console.log('====================================')
  //  console.log(error.message)
   console.log('====================================')
    // Extract error message from response if available
    const errorMessage = error instanceof Error && 'response' in error 
      ? (error as any).response?.data?.message || 'Login failed. Please try again.'
      : 'Network error. Please check your connection.';
    
    return { 
      success: false, 
      message: errorMessage 
    };
  }
}



/**
 * Check token and auto-refresh if needed
 */


/**
 * Start automatic token refresh timer

/**
 * Get dealer list from backend
 */

/**
 * Get chat session list for a specific dealer
 */
export async function getChatSessions(dealerId: string): Promise<ChatSessionResponse[] | null> {

  try {
    const response = await fetchSessionList({ dealerId });
    return response;
  } catch (error) {
    console.log('❌ Chat sessions fetch failed:', error);
    return null;
  }
}
export const logout = async () => {
                  try {
                    useSessionStore.getState().setMounted(true);
                    await logoutAction();
                  } catch (error) {
                   }
                  
};


export const clearState = () => {
  useSessionStore.getState().setNewChatSessionId(null);
                  clearAllClientData();
                  useMessagesStore.getState().setMessages([]);
                    useSessionStore.getState().setMounted(false);

};