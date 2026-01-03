/**
 * Authentication Utility Functions
 * Handles token and user data storage/retrieval
 */

/**
 * Save authentication token to localStorage
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Get authentication token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Save user data to localStorage
 */
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Check if user has specific role
 */
export const hasRole = (role) => {
  const user = getUser();
  return user?.role === role;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roles) => {
  const user = getUser();
  return user && roles.includes(user.role);
};

/**
 * Logout user
 */
export const logout = () => {
  removeToken();
  window.location.href = '/login';
};

