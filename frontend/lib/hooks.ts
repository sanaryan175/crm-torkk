import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './api';
import type {
  Contact, Deal, Activity, DashboardMetrics, Organization, User, Invitation, Role,
  Lead, Company, FollowUp, CustomerTimeline, EmailTracking,
  Quote, Invoice, Payment, Contract,
  SalesOrder, SalesTarget, Commission,
  Campaign, Coupon, Referral,
  Ticket, KnowledgeArticle, SlaPolicy,
  Project, ProjectTask, TimeEntry,
  Department, Employee, Attendance, Leave, PayrollRun, JobPosting, JobApplication,
  Interview, OfferLetter, PerformanceReview, Promotion, Training, EmployeeDocument, EmployeeExit,
  Expense, Income, Budget, BankAccount, TaxRate,
  Product, ProductCategory, Warehouse, StockMovement,
  Vendor, PurchaseRequest, Rfq, PurchaseOrder, VendorPayment,
  CompanyAsset, AssetMaintenance, Document,
  CalendarEvent, ChatMessage, Announcement, AppNotification,
  ApprovalFlow, ApprovalRequest, ScheduledJob, BusinessRule,
  ApiKey, AuditLogEntry, LoginHistoryEntry, Brand, Branch, Subscription,
} from './types';

// Simple event synchronization map for keeping multiple hook consumers in sync
const listeners = new Map<string, Set<() => void>>();

export const triggerRefresh = (keyPrefix: string) => {
  listeners.forEach((cbs, key) => {
    if (key === keyPrefix || key.startsWith(`${keyPrefix}?`) || key.startsWith(`${keyPrefix}/`)) {
      cbs.forEach((cb) => cb());
    }
  });
};

function useQuery<T>(key: string, url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetcher = useCallback(async () => {
    try {
      const res = await apiFetch(url);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetcher();

    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    listeners.get(key)!.add(fetcher);

    return () => {
      listeners.get(key)?.delete(fetcher);
    };
  }, [key, fetcher]);

  return { data, isLoading, error, refetch: fetcher };
}

// Contacts Hook
// Contacts Hook
export const useContacts = (filters: { status?: string; source?: string; search?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.status) query.append('status', filters.status);
  if (filters.source) query.append('source', filters.source);
  if (filters.search) query.append('q', filters.search);

  const queryString = query.toString();
  const cacheKey = `contacts?${queryString}`;

  const { data, isLoading, error } = useQuery<Contact[]>(cacheKey, `/contacts?${queryString}`);

  const createContact = async (contactData: Partial<Contact>) => {
    const response = await apiFetch('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
    triggerRefresh('contacts');
    triggerRefresh('dashboard');
    return response;
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const response = await apiFetch(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    triggerRefresh('contacts');
    triggerRefresh('dashboard');
    return response;
  };

  const deleteContact = async (id: string) => {
    const response = await apiFetch(`/contacts/${id}`, {
      method: 'DELETE',
    });
    triggerRefresh('contacts');
    triggerRefresh('dashboard');
    return response;
  };

  const bulkAction = async (action: 'assign' | 'tag' | 'delete', ids: string[], additionalData?: any) => {
    const response = await apiFetch('/contacts/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, ids, data: additionalData }),
    });
    triggerRefresh('contacts');
    triggerRefresh('dashboard');
    return response;
  };

  return {
    contacts: data || [],
    isLoading,
    error,
    createContact,
    updateContact,
    deleteContact,
    bulkAction,
  };
};

// Deals Hook
// Deals Hook
export const useDeals = (filters: { stage?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.stage) query.append('stage', filters.stage);

  const queryString = query.toString();
  const cacheKey = `deals?${queryString}`;
  const { data, isLoading, error } = useQuery<Deal[]>(cacheKey, `/deals?${queryString}`);

  const createDeal = async (dealData: Partial<Deal>) => {
    const response = await apiFetch('/deals', {
      method: 'POST',
      body: JSON.stringify(dealData),
    });
    triggerRefresh('deals');
    triggerRefresh('dashboard');
    return response;
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    const response = await apiFetch(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    triggerRefresh('deals');
    triggerRefresh('dashboard');
    return response;
  };

  const updateDealStage = async (id: string, stage: string, closeReason?: string) => {
    const response = await apiFetch(`/deals/${id}/stage`, {
      method: 'PUT',
      body: JSON.stringify({ stage, closeReason }),
    });
    triggerRefresh('deals');
    triggerRefresh('dashboard');
    return response;
  };

  const deleteDeal = async (id: string) => {
    const response = await apiFetch(`/deals/${id}`, {
      method: 'DELETE',
    });
    triggerRefresh('deals');
    triggerRefresh('dashboard');
    return response;
  };

  return {
    deals: data || [],
    isLoading,
    error,
    createDeal,
    updateDeal,
    updateDealStage,
    deleteDeal,
  };
};

// Activities Hook
// Activities Hook
export const useActivities = (filters: { contactId?: string; dealId?: string; type?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.contactId) query.append('contactId', filters.contactId);
  if (filters.dealId) query.append('dealId', filters.dealId);
  if (filters.type) query.append('type', filters.type);

  const queryString = query.toString();
  const cacheKey = `activities?${queryString}`;
  const { data, isLoading, error } = useQuery<Activity[]>(cacheKey, `/activities?${queryString}`);

  const createActivity = async (activityData: Partial<Activity>) => {
    const response = await apiFetch('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
    triggerRefresh('activities');
    triggerRefresh('dashboard');
    return response;
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    const response = await apiFetch(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    triggerRefresh('activities');
    triggerRefresh('dashboard');
    return response;
  };

  const completeActivity = async (id: string, completed: boolean) => {
    const response = await apiFetch(`/activities/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ completed }),
    });
    triggerRefresh('activities');
    triggerRefresh('dashboard');
    return response;
  };

  const deleteActivity = async (id: string) => {
    const response = await apiFetch(`/activities/${id}`, {
      method: 'DELETE',
    });
    triggerRefresh('activities');
    triggerRefresh('dashboard');
    return response;
  };

  return {
    activities: data || [],
    isLoading,
    error,
    createActivity,
    updateActivity,
    completeActivity,
    deleteActivity,
  };
};

// Dashboard Metrics Hook
export const useDashboardMetrics = () => {
  const { data, isLoading, error } = useQuery<DashboardMetrics>('dashboard', '/dashboard/metrics');

  return {
    metrics: data,
    isLoading,
    error,
  };
};

// Organization Hook
export const useOrganization = () => {
  const { data, isLoading, error, refetch } = useQuery<Organization>('organization', '/organization');

  const updateOrganization = async (updates: { name?: string; country?: string; currency?: string; timezone?: string; dateFormat?: string; timeFormat?: string; website?: string; phone?: string; address?: string }) => {
    const response = await apiFetch('/organization', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    triggerRefresh('organization');
    return response;
  };

  return {
    organization: data,
    isLoading,
    error,
    refetch,
    updateOrganization,
  };
};

// Team Members Hook
export const useTeamMembers = () => {
  const { data, isLoading, error, refetch } = useQuery<User[]>('users', '/users');

  const changeRole = async (userId: string, roleId: string) => {
    const response = await apiFetch(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ roleId }),
    });
    triggerRefresh('users');
    return response;
  };

  const deactivateUser = async (userId: string) => {
    const response = await apiFetch(`/users/${userId}`, { method: 'DELETE' });
    triggerRefresh('users');
    return response;
  };

  return {
    members: data || [],
    isLoading,
    error,
    refetch,
    changeRole,
    deactivateUser,
  };
};

// Invitations Hook
export const useInvitations = () => {
  const { data, isLoading, error, refetch } = useQuery<Invitation[]>('invitations', '/invitations');

  const sendInvitation = async (email: string, roleId: string) => {
    const response = await apiFetch('/invitations', {
      method: 'POST',
      body: JSON.stringify({ email, roleId }),
    });
    triggerRefresh('invitations');
    if (response && response.emailSent === false) {
      throw new Error('Invitation created but email delivery failed. Share the invite link manually.');
    }
    return response;
  };

  const revokeInvitation = async (id: string) => {
    const response = await apiFetch(`/invitations/${id}`, { method: 'DELETE' });
    triggerRefresh('invitations');
    return response;
  };

  const resendInvitation = async (id: string) => {
    const response = await apiFetch(`/invitations/${id}/resend`, { method: 'POST' });
    triggerRefresh('invitations');
    if (response && response.emailSent === false) {
      throw new Error('Invitation resent but email delivery failed. Share the invite link manually.');
    }
    return response;
  };

  return {
    invitations: data || [],
    isLoading,
    error,
    refetch,
    sendInvitation,
    revokeInvitation,
    resendInvitation,
  };
};

// Roles Hook
export const useRoles = () => {
  const { data, isLoading, error } = useQuery<Role[]>('roles', '/organization/roles');
  return { roles: data || [], isLoading, error };
};

// ─── CRM Extensions Hooks ─────────────────────────────────────────────────────
export const useLeads = (filters: { status?: string; source?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.status) query.append('status', filters.status);
  if (filters.source) query.append('source', filters.source);
  const qs = query.toString();
  const cacheKey = `leads?${qs}`;
  const { data, isLoading, error } = useQuery<Lead[]>(cacheKey, `/leads?${qs}`);

  const createLead = async (d: Partial<Lead>) => {
    const r = await apiFetch('/leads', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('leads'); return r;
  };
  const updateLead = async (id: string, d: Partial<Lead>) => {
    const r = await apiFetch(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('leads'); return r;
  };
  const convertLead = async (id: string, d: Partial<Lead>) => {
    const r = await apiFetch(`/leads/${id}/convert`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('leads'); triggerRefresh('contacts'); triggerRefresh('deals'); return r;
  };
  const deleteLead = async (id: string) => {
    const r = await apiFetch(`/leads/${id}`, { method: 'DELETE' });
    triggerRefresh('leads'); return r;
  };
  return { leads: data || [], isLoading, error, createLead, updateLead, convertLead, deleteLead };
};

export const useCompanies = (filters: { q?: string } = {}) => {
  const qs = filters.q ? `?q=${encodeURIComponent(filters.q)}` : '';
  const cacheKey = `companies${qs}`;
  const { data, isLoading, error } = useQuery<Company[]>(cacheKey, `/companies${qs}`);
  const createCompany = async (d: Partial<Company>) => {
    const r = await apiFetch('/companies', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('companies'); return r;
  };
  const updateCompany = async (id: string, d: Partial<Company>) => {
    const r = await apiFetch(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('companies'); return r;
  };
  const deleteCompany = async (id: string) => {
    const r = await apiFetch(`/companies/${id}`, { method: 'DELETE' });
    triggerRefresh('companies'); return r;
  };
  return { companies: data || [], isLoading, error, createCompany, updateCompany, deleteCompany };
};

export const useFollowUps = (filters: { status?: string; contactId?: string; dealId?: string; leadId?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.status) query.append('status', filters.status);
  if (filters.contactId) query.append('contactId', filters.contactId);
  if (filters.dealId) query.append('dealId', filters.dealId);
  if (filters.leadId) query.append('leadId', filters.leadId);
  const qs = query.toString();
  const cacheKey = `followups?${qs}`;
  const { data, isLoading, error } = useQuery<FollowUp[]>(cacheKey, `/follow-ups?${qs}`);
  const createFollowUp = async (d: Partial<FollowUp>) => {
    const r = await apiFetch('/follow-ups', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('followups'); return r;
  };
  const updateFollowUp = async (id: string, d: Partial<FollowUp>) => {
    const r = await apiFetch(`/follow-ups/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('followups'); return r;
  };
  const completeFollowUp = async (id: string, notes?: string) => {
    const r = await apiFetch(`/follow-ups/${id}/complete`, { method: 'PUT', body: JSON.stringify({ notes }) });
    triggerRefresh('followups'); return r;
  };
  const deleteFollowUp = async (id: string) => {
    const r = await apiFetch(`/follow-ups/${id}`, { method: 'DELETE' });
    triggerRefresh('followups'); return r;
  };
  return { followUps: data || [], isLoading, error, createFollowUp, updateFollowUp, completeFollowUp, deleteFollowUp };
};

export const useTimeline = (filters: { contactId?: string; dealId?: string; companyId?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.contactId) query.append('contactId', filters.contactId);
  if (filters.dealId) query.append('dealId', filters.dealId);
  if (filters.companyId) query.append('companyId', filters.companyId);
  const qs = query.toString();
  const cacheKey = `timeline?${qs}`;
  const { data, isLoading, error } = useQuery<CustomerTimeline[]>(cacheKey, `/timeline?${qs}`);
  const addEntry = async (d: Partial<CustomerTimeline>) => {
    const r = await apiFetch('/timeline', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('timeline'); return r;
  };
  const deleteEntry = async (id: string) => {
    const r = await apiFetch(`/timeline/${id}`, { method: 'DELETE' });
    triggerRefresh('timeline'); return r;
  };
  return { timeline: data || [], isLoading, error, addEntry, deleteEntry };
};

export const useEmailTracking = (filters: { activityId?: string; toEmail?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.activityId) query.append('activityId', filters.activityId);
  if (filters.toEmail) query.append('toEmail', filters.toEmail);
  const qs = query.toString();
  const cacheKey = `emailtracking?${qs}`;
  const { data, isLoading, error } = useQuery<EmailTracking[]>(cacheKey, `/email-trackings?${qs}`);
  const createTracking = async (d: Partial<EmailTracking>) => {
    const r = await apiFetch('/email-trackings', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('emailtracking'); return r;
  };
  return { trackings: data || [], isLoading, error, createTracking };
};

// ─── Quotes / Invoices / Contracts Hooks ──────────────────────────────────────
export const useQuotes = () => {
  const { data, isLoading, error } = useQuery<Quote[]>('quotes', '/quotes');
  const createQuote = async (d: Partial<Quote> & { items?: any[] }) => {
    const r = await apiFetch('/quotes', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('quotes'); triggerRefresh('dashboard'); return r;
  };
  const updateQuote = async (id: string, d: any) => {
    const r = await apiFetch(`/quotes/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('quotes'); return r;
  };
  const convertQuote = async (id: string) => {
    const r = await apiFetch(`/quotes/${id}/convert`, { method: 'POST', body: JSON.stringify({}) });
    triggerRefresh('quotes'); triggerRefresh('invoices'); return r;
  };
  const deleteQuote = async (id: string) => {
    const r = await apiFetch(`/quotes/${id}`, { method: 'DELETE' });
    triggerRefresh('quotes'); return r;
  };
  return { quotes: data || [], isLoading, error, createQuote, updateQuote, convertQuote, deleteQuote };
};

export const useInvoices = () => {
  const { data, isLoading, error } = useQuery<Invoice[]>('invoices', '/invoices');
  const createInvoice = async (d: Partial<Invoice> & { items?: any[] }) => {
    const r = await apiFetch('/invoices', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('invoices'); triggerRefresh('dashboard'); return r;
  };
  const updateInvoice = async (id: string, d: any) => {
    const r = await apiFetch(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('invoices'); return r;
  };
  const sendInvoice = async (id: string) => {
    const r = await apiFetch(`/invoices/${id}/send`, { method: 'PUT', body: JSON.stringify({}) });
    triggerRefresh('invoices'); return r;
  };
  const recordPayment = async (id: string, d: Partial<Payment>) => {
    const r = await apiFetch(`/invoices/${id}/payments`, { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('invoices'); triggerRefresh('payments'); return r;
  };
  const deleteInvoice = async (id: string) => {
    const r = await apiFetch(`/invoices/${id}`, { method: 'DELETE' });
    triggerRefresh('invoices'); return r;
  };
  return { invoices: data || [], isLoading, error, createInvoice, updateInvoice, sendInvoice, recordPayment, deleteInvoice };
};

export const usePayments = () => {
  const { data, isLoading, error } = useQuery<Payment[]>('payments', '/payments');
  return { payments: data || [], isLoading, error };
};

export const useContracts = () => {
  const { data, isLoading, error } = useQuery<Contract[]>('contracts', '/contracts');
  const createContract = async (d: Partial<Contract>) => {
    const r = await apiFetch('/contracts', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('contracts'); return r;
  };
  const updateContract = async (id: string, d: Partial<Contract>) => {
    const r = await apiFetch(`/contracts/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('contracts'); return r;
  };
  const signContract = async (id: string, signedByName: string) => {
    const r = await apiFetch(`/contracts/${id}/sign`, { method: 'PUT', body: JSON.stringify({ signedByName }) });
    triggerRefresh('contracts'); return r;
  };
  const deleteContract = async (id: string) => {
    const r = await apiFetch(`/contracts/${id}`, { method: 'DELETE' });
    triggerRefresh('contracts'); return r;
  };
  return { contracts: data || [], isLoading, error, createContract, updateContract, signContract, deleteContract };
};

// ─── Sales Hooks ──────────────────────────────────────────────────────────────
export const useSalesOrders = () => {
  const { data, isLoading, error } = useQuery<SalesOrder[]>('salesorders', '/sales-orders');
  const createOrder = async (d: any) => {
    const r = await apiFetch('/sales-orders', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('salesorders'); triggerRefresh('dashboard'); return r;
  };
  const updateOrder = async (id: string, d: any) => {
    const r = await apiFetch(`/sales-orders/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('salesorders'); return r;
  };
  const deleteOrder = async (id: string) => {
    const r = await apiFetch(`/sales-orders/${id}`, { method: 'DELETE' });
    triggerRefresh('salesorders'); return r;
  };
  return { orders: data || [], isLoading, error, createOrder, updateOrder, deleteOrder };
};

export const useSalesTargets = () => {
  const { data, isLoading, error } = useQuery<SalesTarget[]>('salestargets', '/sales-targets');
  const createTarget = async (d: Partial<SalesTarget>) => {
    const r = await apiFetch('/sales-targets', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('salestargets'); return r;
  };
  const updateTarget = async (id: string, d: Partial<SalesTarget>) => {
    const r = await apiFetch(`/sales-targets/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('salestargets'); return r;
  };
  const deleteTarget = async (id: string) => {
    const r = await apiFetch(`/sales-targets/${id}`, { method: 'DELETE' });
    triggerRefresh('salestargets'); return r;
  };
  return { targets: data || [], isLoading, error, createTarget, updateTarget, deleteTarget };
};

export const useCommissions = () => {
  const { data, isLoading, error } = useQuery<Commission[]>('commissions', '/commissions');
  return { commissions: data || [], isLoading, error };
};

// ─── Marketing Hooks ──────────────────────────────────────────────────────────
export const useCampaigns = () => {
  const { data, isLoading, error } = useQuery<Campaign[]>('campaigns', '/campaigns');
  const createCampaign = async (d: Partial<Campaign>) => {
    const r = await apiFetch('/campaigns', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('campaigns'); return r;
  };
  const updateCampaign = async (id: string, d: Partial<Campaign>) => {
    const r = await apiFetch(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('campaigns'); return r;
  };
  const sendCampaign = async (id: string, recipients: any[]) => {
    const r = await apiFetch(`/campaigns/${id}/send`, { method: 'POST', body: JSON.stringify({ recipients }) });
    triggerRefresh('campaigns'); return r;
  };
  const deleteCampaign = async (id: string) => {
    const r = await apiFetch(`/campaigns/${id}`, { method: 'DELETE' });
    triggerRefresh('campaigns'); return r;
  };
  return { campaigns: data || [], isLoading, error, createCampaign, updateCampaign, sendCampaign, deleteCampaign };
};

export const useCoupons = () => {
  const { data, isLoading, error } = useQuery<Coupon[]>('coupons', '/coupons');
  const createCoupon = async (d: Partial<Coupon>) => {
    const r = await apiFetch('/coupons', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('coupons'); return r;
  };
  const updateCoupon = async (id: string, d: Partial<Coupon>) => {
    const r = await apiFetch(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('coupons'); return r;
  };
  const deleteCoupon = async (id: string) => {
    const r = await apiFetch(`/coupons/${id}`, { method: 'DELETE' });
    triggerRefresh('coupons'); return r;
  };
  return { coupons: data || [], isLoading, error, createCoupon, updateCoupon, deleteCoupon };
};

export const useReferrals = () => {
  const { data, isLoading, error } = useQuery<Referral[]>('referrals', '/referrals');
  const createReferral = async (d: Partial<Referral>) => {
    const r = await apiFetch('/referrals', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('referrals'); return r;
  };
  const updateReferral = async (id: string, d: Partial<Referral>) => {
    const r = await apiFetch(`/referrals/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('referrals'); return r;
  };
  const deleteReferral = async (id: string) => {
    const r = await apiFetch(`/referrals/${id}`, { method: 'DELETE' });
    triggerRefresh('referrals'); return r;
  };
  return { referrals: data || [], isLoading, error, createReferral, updateReferral, deleteReferral };
};

// ─── Support Hooks ────────────────────────────────────────────────────────────
export const useTickets = (filters: { status?: string; priority?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.status) query.append('status', filters.status);
  if (filters.priority) query.append('priority', filters.priority);
  const qs = query.toString();
  const cacheKey = `tickets?${qs}`;
  const { data, isLoading, error } = useQuery<Ticket[]>(cacheKey, `/tickets?${qs}`);
  const createTicket = async (d: Partial<Ticket>) => {
    const r = await apiFetch('/tickets', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('tickets'); return r;
  };
  const updateTicket = async (id: string, d: Partial<Ticket>) => {
    const r = await apiFetch(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('tickets'); return r;
  };
  const addComment = async (id: string, body: string, isInternal?: boolean) => {
    const r = await apiFetch(`/tickets/${id}/comments`, { method: 'POST', body: JSON.stringify({ body, isInternal }) });
    triggerRefresh('tickets'); return r;
  };
  const deleteTicket = async (id: string) => {
    const r = await apiFetch(`/tickets/${id}`, { method: 'DELETE' });
    triggerRefresh('tickets'); return r;
  };
  return { tickets: data || [], isLoading, error, createTicket, updateTicket, addComment, deleteTicket };
};

export const useKnowledgeArticles = () => {
  const { data, isLoading, error } = useQuery<KnowledgeArticle[]>('knowledge', '/knowledge-articles');
  const createArticle = async (d: Partial<KnowledgeArticle>) => {
    const r = await apiFetch('/knowledge-articles', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('knowledge'); return r;
  };
  const updateArticle = async (id: string, d: Partial<KnowledgeArticle>) => {
    const r = await apiFetch(`/knowledge-articles/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('knowledge'); return r;
  };
  const deleteArticle = async (id: string) => {
    const r = await apiFetch(`/knowledge-articles/${id}`, { method: 'DELETE' });
    triggerRefresh('knowledge'); return r;
  };
  return { articles: data || [], isLoading, error, createArticle, updateArticle, deleteArticle };
};

export const useSlaPolicies = () => {
  const { data, isLoading, error } = useQuery<SlaPolicy[]>('sla', '/sla-policies');
  const createPolicy = async (d: Partial<SlaPolicy>) => {
    const r = await apiFetch('/sla-policies', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('sla'); return r;
  };
  const updatePolicy = async (id: string, d: Partial<SlaPolicy>) => {
    const r = await apiFetch(`/sla-policies/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('sla'); return r;
  };
  const deletePolicy = async (id: string) => {
    const r = await apiFetch(`/sla-policies/${id}`, { method: 'DELETE' });
    triggerRefresh('sla'); return r;
  };
  return { policies: data || [], isLoading, error, createPolicy, updatePolicy, deletePolicy };
};

// ─── Projects Hooks ───────────────────────────────────────────────────────────
export const useProjects = () => {
  const { data, isLoading, error } = useQuery<Project[]>('projects', '/projects');
  const createProject = async (d: Partial<Project>) => {
    const r = await apiFetch('/projects', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('projects'); return r;
  };
  const updateProject = async (id: string, d: Partial<Project>) => {
    const r = await apiFetch(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('projects'); return r;
  };
  const deleteProject = async (id: string) => {
    const r = await apiFetch(`/projects/${id}`, { method: 'DELETE' });
    triggerRefresh('projects'); return r;
  };
  return { projects: data || [], isLoading, error, createProject, updateProject, deleteProject };
};

export const useProjectTasks = (filters: { projectId?: string; status?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.projectId) query.append('projectId', filters.projectId);
  if (filters.status) query.append('status', filters.status);
  const qs = query.toString();
  const cacheKey = `projecttasks?${qs}`;
  const { data, isLoading, error } = useQuery<ProjectTask[]>(cacheKey, `/project-tasks?${qs}`);
  const createTask = async (d: Partial<ProjectTask>) => {
    const r = await apiFetch('/project-tasks', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('projecttasks'); return r;
  };
  const updateTask = async (id: string, d: Partial<ProjectTask>) => {
    const r = await apiFetch(`/project-tasks/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('projecttasks'); return r;
  };
  const updateTaskStatus = async (id: string, status: string) => {
    const r = await apiFetch(`/project-tasks/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    triggerRefresh('projecttasks'); return r;
  };
  const deleteTask = async (id: string) => {
    const r = await apiFetch(`/project-tasks/${id}`, { method: 'DELETE' });
    triggerRefresh('projecttasks'); return r;
  };
  return { tasks: data || [], isLoading, error, createTask, updateTask, updateTaskStatus, deleteTask };
};

export const useTimeEntries = () => {
  const { data, isLoading, error } = useQuery<TimeEntry[]>('timeentries', '/time-entries');
  const createEntry = async (d: Partial<TimeEntry>) => {
    const r = await apiFetch('/time-entries', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('timeentries'); return r;
  };
  const updateEntry = async (id: string, d: Partial<TimeEntry>) => {
    const r = await apiFetch(`/time-entries/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('timeentries'); return r;
  };
  const deleteEntry = async (id: string) => {
    const r = await apiFetch(`/time-entries/${id}`, { method: 'DELETE' });
    triggerRefresh('timeentries'); return r;
  };
  return { entries: data || [], isLoading, error, createEntry, updateEntry, deleteEntry };
};

// ─── HRMS Hooks ───────────────────────────────────────────────────────────────
export const useDepartments = () => {
  const { data, isLoading, error } = useQuery<Department[]>('departments', '/departments');
  const createDepartment = async (d: Partial<Department>) => {
    const r = await apiFetch('/departments', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('departments'); return r;
  };
  const updateDepartment = async (id: string, d: Partial<Department>) => {
    const r = await apiFetch(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('departments'); return r;
  };
  const deleteDepartment = async (id: string) => {
    const r = await apiFetch(`/departments/${id}`, { method: 'DELETE' });
    triggerRefresh('departments'); return r;
  };
  return { departments: data || [], isLoading, error, createDepartment, updateDepartment, deleteDepartment };
};

export const useEmployees = (filters: { departmentId?: string; status?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.departmentId) query.append('departmentId', filters.departmentId);
  if (filters.status) query.append('status', filters.status);
  const qs = query.toString();
  const cacheKey = `employees?${qs}`;
  const { data, isLoading, error } = useQuery<Employee[]>(cacheKey, `/employees?${qs}`);
  const createEmployee = async (d: Partial<Employee>) => {
    const r = await apiFetch('/employees', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('employees'); return r;
  };
  const updateEmployee = async (id: string, d: Partial<Employee>) => {
    const r = await apiFetch(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('employees'); return r;
  };
  const deleteEmployee = async (id: string) => {
    const r = await apiFetch(`/employees/${id}`, { method: 'DELETE' });
    triggerRefresh('employees'); return r;
  };
  return { employees: data || [], isLoading, error, createEmployee, updateEmployee, deleteEmployee };
};

export const useAttendance = (filters: { employeeId?: string; from?: string; to?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.employeeId) query.append('employeeId', filters.employeeId);
  if (filters.from) query.append('from', filters.from);
  if (filters.to) query.append('to', filters.to);
  const qs = query.toString();
  const cacheKey = `attendance?${qs}`;
  const { data, isLoading, error } = useQuery<Attendance[]>(cacheKey, `/attendance?${qs}`);
  const createAttendance = async (d: Partial<Attendance>) => {
    const r = await apiFetch('/attendance', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('attendance'); return r;
  };
  const updateAttendance = async (id: string, d: Partial<Attendance>) => {
    const r = await apiFetch(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('attendance'); return r;
  };
  const deleteAttendance = async (id: string) => {
    const r = await apiFetch(`/attendance/${id}`, { method: 'DELETE' });
    triggerRefresh('attendance'); return r;
  };
  return { records: data || [], isLoading, error, createAttendance, updateAttendance, deleteAttendance };
};

export const useLeaves = (filters: { employeeId?: string; status?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.employeeId) query.append('employeeId', filters.employeeId);
  if (filters.status) query.append('status', filters.status);
  const qs = query.toString();
  const cacheKey = `leaves?${qs}`;
  const { data, isLoading, error } = useQuery<Leave[]>(cacheKey, `/leaves?${qs}`);
  const createLeave = async (d: Partial<Leave>) => {
    const r = await apiFetch('/leaves', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('leaves'); return r;
  };
  const updateLeaveStatus = async (id: string, status: string) => {
    const r = await apiFetch(`/leaves/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    triggerRefresh('leaves'); return r;
  };
  const deleteLeave = async (id: string) => {
    const r = await apiFetch(`/leaves/${id}`, { method: 'DELETE' });
    triggerRefresh('leaves'); return r;
  };
  return { leaves: data || [], isLoading, error, createLeave, updateLeaveStatus, deleteLeave };
};

export const usePayroll = () => {
  const { data, isLoading, error } = useQuery<PayrollRun[]>('payroll', '/payroll');
  const createRun = async (d: any) => {
    const r = await apiFetch('/payroll', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('payroll'); return r;
  };
  const updateRunStatus = async (id: string, status: string) => {
    const r = await apiFetch(`/payroll/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    triggerRefresh('payroll'); return r;
  };
  const deleteRun = async (id: string) => {
    const r = await apiFetch(`/payroll/${id}`, { method: 'DELETE' });
    triggerRefresh('payroll'); return r;
  };
  return { runs: data || [], isLoading, error, createRun, updateRunStatus, deleteRun };
};

export const useJobPostings = () => {
  const { data, isLoading, error } = useQuery<JobPosting[]>('jobpostings', '/job-postings');
  const createPosting = async (d: Partial<JobPosting>) => {
    const r = await apiFetch('/job-postings', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('jobpostings'); return r;
  };
  const updatePosting = async (id: string, d: Partial<JobPosting>) => {
    const r = await apiFetch(`/job-postings/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('jobpostings'); return r;
  };
  const publishPosting = async (id: string) => {
    const r = await apiFetch(`/job-postings/${id}/publish`, { method: 'PUT', body: JSON.stringify({}) });
    triggerRefresh('jobpostings'); return r;
  };
  const deletePosting = async (id: string) => {
    const r = await apiFetch(`/job-postings/${id}`, { method: 'DELETE' });
    triggerRefresh('jobpostings'); return r;
  };
  return { postings: data || [], isLoading, error, createPosting, updatePosting, publishPosting, deletePosting };
};

export const useApplications = (filters: { jobPostingId?: string } = {}) => {
  const qs = filters.jobPostingId ? `?jobPostingId=${filters.jobPostingId}` : '';
  const cacheKey = `applications${qs}`;
  const { data, isLoading, error } = useQuery<JobApplication[]>(cacheKey, `/applications${qs}`);
  const createApplication = async (d: Partial<JobApplication>) => {
    const r = await apiFetch('/applications', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('applications'); return r;
  };
  const updateApplicationStatus = async (id: string, status: string) => {
    const r = await apiFetch(`/applications/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    triggerRefresh('applications'); return r;
  };
  const deleteApplication = async (id: string) => {
    const r = await apiFetch(`/applications/${id}`, { method: 'DELETE' });
    triggerRefresh('applications'); return r;
  };
  return { applications: data || [], isLoading, error, createApplication, updateApplicationStatus, deleteApplication };
};

export const useInterviews = () => {
  const { data, isLoading, error } = useQuery<Interview[]>('interviews', '/interviews');
  const createInterview = async (d: Partial<Interview>) => {
    const r = await apiFetch('/interviews', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('interviews'); return r;
  };
  const updateInterview = async (id: string, d: Partial<Interview>) => {
    const r = await apiFetch(`/interviews/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('interviews'); return r;
  };
  const setInterviewResult = async (id: string, result: string) => {
    const r = await apiFetch(`/interviews/${id}/result`, { method: 'PUT', body: JSON.stringify({ result }) });
    triggerRefresh('interviews'); return r;
  };
  const deleteInterview = async (id: string) => {
    const r = await apiFetch(`/interviews/${id}`, { method: 'DELETE' });
    triggerRefresh('interviews'); return r;
  };
  return { interviews: data || [], isLoading, error, createInterview, updateInterview, setInterviewResult, deleteInterview };
};

export const useOfferLetters = () => {
  const { data, isLoading, error } = useQuery<OfferLetter[]>('offerletters', '/offer-letters');
  const createOffer = async (d: Partial<OfferLetter>) => {
    const r = await apiFetch('/offer-letters', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('offerletters'); return r;
  };
  const updateOfferStatus = async (id: string, status: string) => {
    const r = await apiFetch(`/offer-letters/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    triggerRefresh('offerletters'); return r;
  };
  const deleteOffer = async (id: string) => {
    const r = await apiFetch(`/offer-letters/${id}`, { method: 'DELETE' });
    triggerRefresh('offerletters'); return r;
  };
  return { offers: data || [], isLoading, error, createOffer, updateOfferStatus, deleteOffer };
};

export const usePerformanceReviews = () => {
  const { data, isLoading, error } = useQuery<PerformanceReview[]>('performance', '/performance-reviews');
  const createReview = async (d: Partial<PerformanceReview>) => {
    const r = await apiFetch('/performance-reviews', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('performance'); return r;
  };
  const updateReview = async (id: string, d: Partial<PerformanceReview>) => {
    const r = await apiFetch(`/performance-reviews/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('performance'); return r;
  };
  const submitReview = async (id: string) => {
    const r = await apiFetch(`/performance-reviews/${id}/submit`, { method: 'PUT', body: JSON.stringify({}) });
    triggerRefresh('performance'); return r;
  };
  const deleteReview = async (id: string) => {
    const r = await apiFetch(`/performance-reviews/${id}`, { method: 'DELETE' });
    triggerRefresh('performance'); return r;
  };
  return { reviews: data || [], isLoading, error, createReview, updateReview, submitReview, deleteReview };
};

export const usePromotions = () => {
  const { data, isLoading, error } = useQuery<Promotion[]>('promotions', '/promotions');
  const createPromotion = async (d: Partial<Promotion>) => {
    const r = await apiFetch('/promotions', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('promotions'); return r;
  };
  const deletePromotion = async (id: string) => {
    const r = await apiFetch(`/promotions/${id}`, { method: 'DELETE' });
    triggerRefresh('promotions'); return r;
  };
  return { promotions: data || [], isLoading, error, createPromotion, deletePromotion };
};

export const useTraining = () => {
  const { data, isLoading, error } = useQuery<Training[]>('training', '/training');
  const createTraining = async (d: Partial<Training>) => {
    const r = await apiFetch('/training', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('training'); return r;
  };
  const updateTraining = async (id: string, d: Partial<Training>) => {
    const r = await apiFetch(`/training/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('training'); return r;
  };
  const enrollEmployee = async (id: string, employeeId: string) => {
    const r = await apiFetch(`/training/${id}/enroll`, { method: 'POST', body: JSON.stringify({ employeeId }) });
    triggerRefresh('training'); return r;
  };
  const deleteTraining = async (id: string) => {
    const r = await apiFetch(`/training/${id}`, { method: 'DELETE' });
    triggerRefresh('training'); return r;
  };
  return { trainings: data || [], isLoading, error, createTraining, updateTraining, enrollEmployee, deleteTraining };
};

export const useEmployeeDocuments = (employeeId?: string) => {
  const qs = employeeId ? `?employeeId=${employeeId}` : '';
  const cacheKey = `employeedocuments${qs}`;
  const { data, isLoading, error } = useQuery<EmployeeDocument[]>(cacheKey, `/employee-documents${qs}`);
  const createDocument = async (d: Partial<EmployeeDocument>) => {
    const r = await apiFetch('/employee-documents', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('employeedocuments'); return r;
  };
  const deleteDocument = async (id: string) => {
    const r = await apiFetch(`/employee-documents/${id}`, { method: 'DELETE' });
    triggerRefresh('employeedocuments'); return r;
  };
  return { documents: data || [], isLoading, error, createDocument, deleteDocument };
};

export const useEmployeeExits = () => {
  const { data, isLoading, error } = useQuery<EmployeeExit[]>('employeeexits', '/employee-exits');
  const createExit = async (d: Partial<EmployeeExit>) => {
    const r = await apiFetch('/employee-exits', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('employeeexits'); return r;
  };
  const updateExit = async (id: string, d: Partial<EmployeeExit>) => {
    const r = await apiFetch(`/employee-exits/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('employeeexits'); return r;
  };
  const deleteExit = async (id: string) => {
    const r = await apiFetch(`/employee-exits/${id}`, { method: 'DELETE' });
    triggerRefresh('employeeexits'); return r;
  };
  return { exits: data || [], isLoading, error, createExit, updateExit, deleteExit };
};

// ─── Finance Hooks ────────────────────────────────────────────────────────────
export const useExpenses = () => {
  const { data, isLoading, error } = useQuery<Expense[]>('expenses', '/expenses');
  const createExpense = async (d: Partial<Expense>) => {
    const r = await apiFetch('/expenses', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('expenses'); return r;
  };
  const updateExpense = async (id: string, d: Partial<Expense>) => {
    const r = await apiFetch(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('expenses'); return r;
  };
  const approveExpense = async (id: string) => {
    const r = await apiFetch(`/expenses/${id}/approve`, { method: 'PUT', body: JSON.stringify({}) });
    triggerRefresh('expenses'); return r;
  };
  const deleteExpense = async (id: string) => {
    const r = await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
    triggerRefresh('expenses'); return r;
  };
  return { expenses: data || [], isLoading, error, createExpense, updateExpense, approveExpense, deleteExpense };
};

export const useIncomes = () => {
  const { data, isLoading, error } = useQuery<Income[]>('incomes', '/incomes');
  const createIncome = async (d: Partial<Income>) => {
    const r = await apiFetch('/incomes', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('incomes'); return r;
  };
  const updateIncome = async (id: string, d: Partial<Income>) => {
    const r = await apiFetch(`/incomes/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('incomes'); return r;
  };
  const deleteIncome = async (id: string) => {
    const r = await apiFetch(`/incomes/${id}`, { method: 'DELETE' });
    triggerRefresh('incomes'); return r;
  };
  return { incomes: data || [], isLoading, error, createIncome, updateIncome, deleteIncome };
};

export const useBudgets = () => {
  const { data, isLoading, error } = useQuery<Budget[]>('budgets', '/budgets');
  const createBudget = async (d: Partial<Budget>) => {
    const r = await apiFetch('/budgets', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('budgets'); return r;
  };
  const updateBudget = async (id: string, d: Partial<Budget>) => {
    const r = await apiFetch(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('budgets'); return r;
  };
  const deleteBudget = async (id: string) => {
    const r = await apiFetch(`/budgets/${id}`, { method: 'DELETE' });
    triggerRefresh('budgets'); return r;
  };
  return { budgets: data || [], isLoading, error, createBudget, updateBudget, deleteBudget };
};

export const useBankAccounts = () => {
  const { data, isLoading, error } = useQuery<BankAccount[]>('bankaccounts', '/bank-accounts');
  const createAccount = async (d: Partial<BankAccount>) => {
    const r = await apiFetch('/bank-accounts', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('bankaccounts'); return r;
  };
  const updateAccount = async (id: string, d: Partial<BankAccount>) => {
    const r = await apiFetch(`/bank-accounts/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('bankaccounts'); return r;
  };
  const deleteAccount = async (id: string) => {
    const r = await apiFetch(`/bank-accounts/${id}`, { method: 'DELETE' });
    triggerRefresh('bankaccounts'); return r;
  };
  return { accounts: data || [], isLoading, error, createAccount, updateAccount, deleteAccount };
};

export const useTaxRates = () => {
  const { data, isLoading, error } = useQuery<TaxRate[]>('taxrates', '/tax-rates');
  const createRate = async (d: Partial<TaxRate>) => {
    const r = await apiFetch('/tax-rates', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('taxrates'); return r;
  };
  const updateRate = async (id: string, d: Partial<TaxRate>) => {
    const r = await apiFetch(`/tax-rates/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('taxrates'); return r;
  };
  const deleteRate = async (id: string) => {
    const r = await apiFetch(`/tax-rates/${id}`, { method: 'DELETE' });
    triggerRefresh('taxrates'); return r;
  };
  return { taxRates: data || [], isLoading, error, createRate, updateRate, deleteRate };
};

// ─── Inventory Hooks ──────────────────────────────────────────────────────────
export const useProducts = () => {
  const { data, isLoading, error } = useQuery<Product[]>('products', '/products');
  const createProduct = async (d: Partial<Product>) => {
    const r = await apiFetch('/products', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('products'); return r;
  };
  const updateProduct = async (id: string, d: Partial<Product>) => {
    const r = await apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('products'); return r;
  };
  const deleteProduct = async (id: string) => {
    const r = await apiFetch(`/products/${id}`, { method: 'DELETE' });
    triggerRefresh('products'); return r;
  };
  return { products: data || [], isLoading, error, createProduct, updateProduct, deleteProduct };
};

export const useProductCategories = () => {
  const { data, isLoading, error } = useQuery<ProductCategory[]>('productcategories', '/product-categories');
  const createCategory = async (d: Partial<ProductCategory>) => {
    const r = await apiFetch('/product-categories', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('productcategories'); return r;
  };
  const deleteCategory = async (id: string) => {
    const r = await apiFetch(`/product-categories/${id}`, { method: 'DELETE' });
    triggerRefresh('productcategories'); return r;
  };
  return { categories: data || [], isLoading, error, createCategory, deleteCategory };
};

export const useWarehouses = () => {
  const { data, isLoading, error } = useQuery<Warehouse[]>('warehouses', '/warehouses');
  const createWarehouse = async (d: Partial<Warehouse>) => {
    const r = await apiFetch('/warehouses', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('warehouses'); return r;
  };
  const updateWarehouse = async (id: string, d: Partial<Warehouse>) => {
    const r = await apiFetch(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('warehouses'); return r;
  };
  const deleteWarehouse = async (id: string) => {
    const r = await apiFetch(`/warehouses/${id}`, { method: 'DELETE' });
    triggerRefresh('warehouses'); return r;
  };
  return { warehouses: data || [], isLoading, error, createWarehouse, updateWarehouse, deleteWarehouse };
};

export const useStockMovements = () => {
  const { data, isLoading, error } = useQuery<StockMovement[]>('stockmovements', '/stock-movements');
  const createMovement = async (d: Partial<StockMovement>) => {
    const r = await apiFetch('/stock-movements', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('stockmovements'); triggerRefresh('products'); return r;
  };
  const deleteMovement = async (id: string) => {
    const r = await apiFetch(`/stock-movements/${id}`, { method: 'DELETE' });
    triggerRefresh('stockmovements'); triggerRefresh('products'); return r;
  };
  return { movements: data || [], isLoading, error, createMovement, deleteMovement };
};

// ─── Procurement Hooks ────────────────────────────────────────────────────────
export const useVendors = () => {
  const { data, isLoading, error } = useQuery<Vendor[]>('vendors', '/vendors');
  const createVendor = async (d: Partial<Vendor>) => {
    const r = await apiFetch('/vendors', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('vendors'); return r;
  };
  const updateVendor = async (id: string, d: Partial<Vendor>) => {
    const r = await apiFetch(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('vendors'); return r;
  };
  const deleteVendor = async (id: string) => {
    const r = await apiFetch(`/vendors/${id}`, { method: 'DELETE' });
    triggerRefresh('vendors'); return r;
  };
  return { vendors: data || [], isLoading, error, createVendor, updateVendor, deleteVendor };
};

export const usePurchaseRequests = () => {
  const { data, isLoading, error } = useQuery<PurchaseRequest[]>('purchaserequests', '/purchase-requests');
  const createRequest = async (d: Partial<PurchaseRequest>) => {
    const r = await apiFetch('/purchase-requests', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('purchaserequests'); return r;
  };
  const updateRequest = async (id: string, d: Partial<PurchaseRequest>) => {
    const r = await apiFetch(`/purchase-requests/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('purchaserequests'); return r;
  };
  const approveRequest = async (id: string) => {
    const r = await apiFetch(`/purchase-requests/${id}/approve`, { method: 'PUT', body: JSON.stringify({}) });
    triggerRefresh('purchaserequests'); return r;
  };
  const deleteRequest = async (id: string) => {
    const r = await apiFetch(`/purchase-requests/${id}`, { method: 'DELETE' });
    triggerRefresh('purchaserequests'); return r;
  };
  return { requests: data || [], isLoading, error, createRequest, updateRequest, approveRequest, deleteRequest };
};

export const useRfqs = () => {
  const { data, isLoading, error } = useQuery<Rfq[]>('rfqs', '/rfqs');
  const createRfq = async (d: Partial<Rfq>) => {
    const r = await apiFetch('/rfqs', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('rfqs'); return r;
  };
  const updateRfq = async (id: string, d: Partial<Rfq>) => {
    const r = await apiFetch(`/rfqs/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('rfqs'); return r;
  };
  const deleteRfq = async (id: string) => {
    const r = await apiFetch(`/rfqs/${id}`, { method: 'DELETE' });
    triggerRefresh('rfqs'); return r;
  };
  return { rfqs: data || [], isLoading, error, createRfq, updateRfq, deleteRfq };
};

export const usePurchaseOrders = () => {
  const { data, isLoading, error } = useQuery<PurchaseOrder[]>('purchaseorders', '/purchase-orders');
  const createOrder = async (d: any) => {
    const r = await apiFetch('/purchase-orders', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('purchaseorders'); return r;
  };
  const updateOrderStatus = async (id: string, status: string) => {
    const r = await apiFetch(`/purchase-orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    triggerRefresh('purchaseorders'); return r;
  };
  const recordVendorPayment = async (id: string, d: Partial<VendorPayment>) => {
    const r = await apiFetch(`/purchase-orders/${id}/payments`, { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('purchaseorders'); return r;
  };
  const deleteOrder = async (id: string) => {
    const r = await apiFetch(`/purchase-orders/${id}`, { method: 'DELETE' });
    triggerRefresh('purchaseorders'); return r;
  };
  return { orders: data || [], isLoading, error, createOrder, updateOrderStatus, recordVendorPayment, deleteOrder };
};

// ─── Assets Hooks ─────────────────────────────────────────────────────────────
export const useAssets = () => {
  const { data, isLoading, error } = useQuery<CompanyAsset[]>('assets', '/assets');
  const createAsset = async (d: Partial<CompanyAsset>) => {
    const r = await apiFetch('/assets', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('assets'); return r;
  };
  const updateAsset = async (id: string, d: Partial<CompanyAsset>) => {
    const r = await apiFetch(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('assets'); return r;
  };
  const deleteAsset = async (id: string) => {
    const r = await apiFetch(`/assets/${id}`, { method: 'DELETE' });
    triggerRefresh('assets'); return r;
  };
  return { assets: data || [], isLoading, error, createAsset, updateAsset, deleteAsset };
};

export const useAssetMaintenance = () => {
  const { data, isLoading, error } = useQuery<AssetMaintenance[]>('assetmaintenance', '/asset-maintenance');
  const createMaintenance = async (d: Partial<AssetMaintenance>) => {
    const r = await apiFetch('/asset-maintenance', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('assetmaintenance'); return r;
  };
  const updateMaintenance = async (id: string, d: Partial<AssetMaintenance>) => {
    const r = await apiFetch(`/asset-maintenance/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('assetmaintenance'); return r;
  };
  const deleteMaintenance = async (id: string) => {
    const r = await apiFetch(`/asset-maintenance/${id}`, { method: 'DELETE' });
    triggerRefresh('assetmaintenance'); return r;
  };
  return { maintenance: data || [], isLoading, error, createMaintenance, updateMaintenance, deleteMaintenance };
};

// ─── Documents Hooks ──────────────────────────────────────────────────────────
export const useDocuments = () => {
  const { data, isLoading, error } = useQuery<Document[]>('documents', '/documents');
  const createDocument = async (d: Partial<Document>) => {
    const r = await apiFetch('/documents', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('documents'); return r;
  };
  const updateDocument = async (id: string, d: Partial<Document>) => {
    const r = await apiFetch(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('documents'); return r;
  };
  const deleteDocument = async (id: string) => {
    const r = await apiFetch(`/documents/${id}`, { method: 'DELETE' });
    triggerRefresh('documents'); return r;
  };
  return { documents: data || [], isLoading, error, createDocument, updateDocument, deleteDocument };
};

// ─── Calendar Hooks ───────────────────────────────────────────────────────────
export const useCalendarEvents = (filters: { from?: string; to?: string } = {}) => {
  const query = new URLSearchParams();
  if (filters.from) query.append('from', filters.from);
  if (filters.to) query.append('to', filters.to);
  const qs = query.toString();
  const cacheKey = `calendarevents?${qs}`;
  const { data, isLoading, error } = useQuery<CalendarEvent[]>(cacheKey, `/calendar-events?${qs}`);
  const createEvent = async (d: Partial<CalendarEvent>) => {
    const r = await apiFetch('/calendar-events', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('calendarevents'); return r;
  };
  const updateEvent = async (id: string, d: Partial<CalendarEvent>) => {
    const r = await apiFetch(`/calendar-events/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('calendarevents'); return r;
  };
  const deleteEvent = async (id: string) => {
    const r = await apiFetch(`/calendar-events/${id}`, { method: 'DELETE' });
    triggerRefresh('calendarevents'); return r;
  };
  return { events: data || [], isLoading, error, createEvent, updateEvent, deleteEvent };
};

// ─── Communication Hooks ──────────────────────────────────────────────────────
export const useChat = () => {
  const { data, isLoading, error, refetch } = useQuery<ChatMessage[]>('chat', '/chat');
  const sendMessage = async (d: { receiverId: string; content: string }) => {
    const r = await apiFetch('/chat', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('chat'); return r;
  };
  return { messages: data || [], isLoading, error, refetch, sendMessage };
};

export const useAnnouncements = () => {
  const { data, isLoading, error } = useQuery<Announcement[]>('announcements', '/announcements');
  const createAnnouncement = async (d: Partial<Announcement>) => {
    const r = await apiFetch('/announcements', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('announcements'); return r;
  };
  const updateAnnouncement = async (id: string, d: Partial<Announcement>) => {
    const r = await apiFetch(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('announcements'); return r;
  };
  const deleteAnnouncement = async (id: string) => {
    const r = await apiFetch(`/announcements/${id}`, { method: 'DELETE' });
    triggerRefresh('announcements'); return r;
  };
  return { announcements: data || [], isLoading, error, createAnnouncement, updateAnnouncement, deleteAnnouncement };
};

export const useAppNotifications = () => {
  const { data, isLoading, error, refetch } = useQuery<AppNotification[]>('appnotifications', '/app-notifications');
  const markRead = async (id?: string) => {
    const r = await apiFetch('/app-notifications/mark-read', { method: 'POST', body: JSON.stringify(id ? { id } : { all: true }) });
    triggerRefresh('appnotifications'); return r;
  };
  return { notifications: data || [], isLoading, error, refetch, markRead };
};

// ─── Workflow Hooks ───────────────────────────────────────────────────────────
export const useApprovalFlows = () => {
  const { data, isLoading, error } = useQuery<ApprovalFlow[]>('approvalflows', '/approval-flows');
  const createFlow = async (d: Partial<ApprovalFlow>) => {
    const r = await apiFetch('/approval-flows', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('approvalflows'); return r;
  };
  const updateFlow = async (id: string, d: Partial<ApprovalFlow>) => {
    const r = await apiFetch(`/approval-flows/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('approvalflows'); return r;
  };
  const deleteFlow = async (id: string) => {
    const r = await apiFetch(`/approval-flows/${id}`, { method: 'DELETE' });
    triggerRefresh('approvalflows'); return r;
  };
  return { flows: data || [], isLoading, error, createFlow, updateFlow, deleteFlow };
};

export const useApprovalRequests = () => {
  const { data, isLoading, error } = useQuery<ApprovalRequest[]>('approvals', '/approvals');
  const createRequest = async (d: Partial<ApprovalRequest>) => {
    const r = await apiFetch('/approvals', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('approvals'); return r;
  };
  const decideRequest = async (id: string, decision: string, comment?: string) => {
    const r = await apiFetch(`/approvals/${id}/decide`, { method: 'PUT', body: JSON.stringify({ decision, comment }) });
    triggerRefresh('approvals'); return r;
  };
  return { requests: data || [], isLoading, error, createRequest, decideRequest };
};

export const useScheduledJobs = () => {
  const { data, isLoading, error } = useQuery<ScheduledJob[]>('scheduledjobs', '/scheduled-jobs');
  const createJob = async (d: Partial<ScheduledJob>) => {
    const r = await apiFetch('/scheduled-jobs', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('scheduledjobs'); return r;
  };
  const updateJob = async (id: string, d: Partial<ScheduledJob>) => {
    const r = await apiFetch(`/scheduled-jobs/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('scheduledjobs'); return r;
  };
  const deleteJob = async (id: string) => {
    const r = await apiFetch(`/scheduled-jobs/${id}`, { method: 'DELETE' });
    triggerRefresh('scheduledjobs'); return r;
  };
  return { jobs: data || [], isLoading, error, createJob, updateJob, deleteJob };
};

export const useBusinessRules = () => {
  const { data, isLoading, error } = useQuery<BusinessRule[]>('businessrules', '/business-rules');
  const createRule = async (d: Partial<BusinessRule>) => {
    const r = await apiFetch('/business-rules', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('businessrules'); return r;
  };
  const updateRule = async (id: string, d: Partial<BusinessRule>) => {
    const r = await apiFetch(`/business-rules/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('businessrules'); return r;
  };
  const deleteRule = async (id: string) => {
    const r = await apiFetch(`/business-rules/${id}`, { method: 'DELETE' });
    triggerRefresh('businessrules'); return r;
  };
  return { rules: data || [], isLoading, error, createRule, updateRule, deleteRule };
};

// ─── Security & Branding Hooks ────────────────────────────────────────────────
export const useApiKeys = () => {
  const { data, isLoading, error } = useQuery<ApiKey[]>('apikeys', '/security/api-keys');
  const createKey = async (d: { name: string }) => {
    const r = await apiFetch('/security/api-keys', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('apikeys'); return r;
  };
  const deleteKey = async (id: string) => {
    const r = await apiFetch(`/security/api-keys/${id}`, { method: 'DELETE' });
    triggerRefresh('apikeys'); return r;
  };
  return { keys: data || [], isLoading, error, createKey, deleteKey };
};

export const useAuditLogs = () => {
  const { data, isLoading, error } = useQuery<AuditLogEntry[]>('auditlogs', '/audit-logs');
  return { logs: data || [], isLoading, error };
};

export const useLoginHistory = () => {
  const { data, isLoading, error } = useQuery<LoginHistoryEntry[]>('loginhistory', '/security/login-history');
  return { history: data || [], isLoading, error };
};

export const useBrands = () => {
  const { data, isLoading, error } = useQuery<Brand[]>('brands', '/brands');
  const createBrand = async (d: Partial<Brand>) => {
    const r = await apiFetch('/brands', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('brands'); return r;
  };
  const updateBrand = async (id: string, d: Partial<Brand>) => {
    const r = await apiFetch(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('brands'); return r;
  };
  const deleteBrand = async (id: string) => {
    const r = await apiFetch(`/brands/${id}`, { method: 'DELETE' });
    triggerRefresh('brands'); return r;
  };
  return { brands: data || [], isLoading, error, createBrand, updateBrand, deleteBrand };
};

export const useBranches = () => {
  const { data, isLoading, error } = useQuery<Branch[]>('branches', '/branches');
  const createBranch = async (d: Partial<Branch>) => {
    const r = await apiFetch('/branches', { method: 'POST', body: JSON.stringify(d) });
    triggerRefresh('branches'); return r;
  };
  const updateBranch = async (id: string, d: Partial<Branch>) => {
    const r = await apiFetch(`/branches/${id}`, { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('branches'); return r;
  };
  const deleteBranch = async (id: string) => {
    const r = await apiFetch(`/branches/${id}`, { method: 'DELETE' });
    triggerRefresh('branches'); return r;
  };
  return { branches: data || [], isLoading, error, createBranch, updateBranch, deleteBranch };
};

export const useSubscription = () => {
  const { data, isLoading, error, refetch } = useQuery<Subscription | null>('subscription', '/subscription');
  const updateSubscription = async (d: Partial<Subscription>) => {
    const r = await apiFetch('/subscription', { method: 'PUT', body: JSON.stringify(d) });
    triggerRefresh('subscription'); return r;
  };
  return { subscription: data, isLoading, error, refetch, updateSubscription };
};
