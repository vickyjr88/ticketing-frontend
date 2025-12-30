const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://3.225.246.72/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Events
  async getEvents(status) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/events${query}`);
  }

  async getEvent(id) {
    return this.request(`/events/${id}`);
  }

  async getMyEvents() {
    return this.request('/events/my-events');
  }

  async getEventTiers(eventId) {
    return this.request(`/events/${eventId}/tiers`);
  }

  // Admin methods
  async getAllEventsAdmin() {
    return this.request('/events/admin/all');
  }

  async updateEventStatus(eventId, status) {
    return this.request(`/events/admin/${eventId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteEventAdmin(eventId) {
    return this.request(`/events/admin/${eventId}`, {
      method: 'DELETE',
    });
  }

  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id, eventData) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async uploadEventImage(eventId, file) {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/events/${eventId}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl;
  }

  async deleteEvent(id) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async createTier(eventId, tierData) {
    return this.request(`/events/${eventId}/tiers`, {
      method: 'POST',
      body: JSON.stringify(tierData),
    });
  }

  async updateTier(eventId, tierId, tierData) {
    return this.request(`/events/${eventId}/tiers/${tierId}`, {
      method: 'PUT',
      body: JSON.stringify(tierData),
    });
  }

  async deleteTier(eventId, tierId) {
    return this.request(`/events/${eventId}/tiers/${tierId}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async checkout(checkoutData) {
    return this.request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  async adoptTickets(adoptData) {
    return this.request('/orders/adopt', {
      method: 'POST',
      body: JSON.stringify(adoptData),
    });
  }

  async getMyOrders() {
    return this.request('/orders/my-orders');
  }

  async getOrder(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  // Admin
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminOrders(params = {}) {
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== 'undefined')
    );
    const queryString = new URLSearchParams(cleanedParams).toString();
    return this.request(`/admin/orders?${queryString}`);
  }

  async getAdminUsers(params = {}) {
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== 'undefined')
    );
    const queryString = new URLSearchParams(cleanedParams).toString();
    return this.request(`/admin/users?${queryString}`);
  }

  async updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async updateUserStatus(userId, is_active) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    });
  }

  async updateUserGate(userId, gate) {
    return this.request(`/admin/users/${userId}/gate`, {
      method: 'PATCH',
      body: JSON.stringify({ gate }),
    });
  }

  // Payments
  async initiatePayment(orderId, paymentData) {
    return this.request(`/payments/initiate/${orderId}`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentStatus(orderId) {
    return this.request(`/payments/status/${orderId}`);
  }

  async verifyPaystack(reference) {
    return this.request(`/payments/paystack/verify/${reference}`);
  }

  // Tickets & Scanning
  async getMyTickets() {
    return this.request('/tickets/my-tickets');
  }

  async getTicket(ticketId) {
    return this.request(`/tickets/${ticketId}`);
  }

  async getTicketQRCode(ticketId) {
    return this.request(`/tickets/${ticketId}/qr-code`);
  }

  async transferTicket(ticketId, email) {
    return this.request(`/tickets/${ticketId}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async checkInTicket(qrHash) {
    return this.request('/tickets/check-in', {
      method: 'POST',
      body: JSON.stringify({ qrHash }),
    });
  }

  async getScannerStats() {
    return this.request('/tickets/scanner/stats');
  }

  async getGateStats(eventId) {
    return this.request(`/tickets/scanner/stats/${eventId}`);
  }

  // Lottery
  async enterLottery(eventId) {
    return this.request(`/lottery/enter/${eventId}`, {
      method: 'POST',
    });
  }

  async runLotteryDraw(eventId) {
    return this.request(`/lottery/draw/${eventId}`, {
      method: 'POST',
    });
  }

  async getLotteryWinners(eventId) {
    return this.request(`/lottery/event/${eventId}/winners`);
  }

  async getLotteryStats(eventId) {
    return this.request(`/lottery/event/${eventId}/stats`);
  }

  async getMyLotteryEntries() {
    return this.request('/lottery/my-entries');
  }

  async checkLotteryEligibility(eventId) {
    return this.request(`/lottery/eligible/${eventId}`);
  }

  async allocateTicket(eventId, email) {
    return this.request(`/lottery/allocate/${eventId}`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Waitlist
  async joinWaitlist(waitlistData) {
    return this.request('/waitlist', {
      method: 'POST',
      body: JSON.stringify(waitlistData),
    });
  }

  async getEventWaitlist(eventId) {
    return this.request(`/waitlist/event/${eventId}`);
  }

  // Users
  async getProfile() {
    return this.request('/users/me');
  }

  async updateProfile(profileData) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Promo Codes
  async getPromoCodes(includeInactive = false) {
    const query = includeInactive ? '?includeInactive=true' : '';
    return this.request(`/promo${query}`);
  }

  async getPromoCode(id) {
    return this.request(`/promo/${id}`);
  }

  async getPromoCodeStats(id) {
    return this.request(`/promo/${id}/stats`);
  }

  async createPromoCode(promoData) {
    return this.request('/promo', {
      method: 'POST',
      body: JSON.stringify(promoData),
    });
  }

  async updatePromoCode(id, promoData) {
    return this.request(`/promo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(promoData),
    });
  }

  async deletePromoCode(id) {
    return this.request(`/promo/${id}`, {
      method: 'DELETE',
    });
  }

  async validatePromoCode(code, eventId, subtotal) {
    return this.request('/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ code, eventId, subtotal }),
    });
  }

  // Analytics
  async getAnalyticsDashboard(days = 30, eventId = null) {
    const params = new URLSearchParams();
    if (days) params.append('days', days);
    if (eventId) params.append('eventId', eventId);
    return this.request(`/analytics/dashboard?${params}`);
  }

  async getSalesTimeSeries(days = 30, eventId = null) {
    const params = new URLSearchParams();
    if (days) params.append('days', days);
    if (eventId) params.append('eventId', eventId);
    return this.request(`/analytics/sales-timeseries?${params}`);
  }

  async getCheckInDistribution(eventId = null) {
    const query = eventId ? `?eventId=${eventId}` : '';
    return this.request(`/analytics/checkin-distribution${query}`);
  }

  async getActivityFeed(limit = 50) {
    return this.request(`/analytics/activity-feed?limit=${limit}`);
  }

  // Products
  async getProducts(eventId) {
    return this.request(`/products?eventId=${eventId}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    });
  }
  // Media Library
  async getMedia() {
    return this.request('/media');
  }

  async uploadMedia(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload media');
    }

    return response.json();
  }

  async deleteMedia(id) {
    return this.request(`/media/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();

export default api;
