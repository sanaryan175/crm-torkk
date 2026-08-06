/**
 * All system permissions.
 * Format: resource.action
 * Stored in DB per organization — never hardcoded in middleware.
 */
export const PERMISSIONS = {
  // Contacts
  CONTACT_CREATE:  'contact.create',
  CONTACT_READ:    'contact.read',
  CONTACT_UPDATE:  'contact.update',
  CONTACT_DELETE:  'contact.delete',
  CONTACT_IMPORT:  'contact.import',

  // Deals
  DEAL_CREATE:     'deal.create',
  DEAL_READ:       'deal.read',
  DEAL_UPDATE:     'deal.update',
  DEAL_DELETE:     'deal.delete',

  // Activities
  ACTIVITY_CREATE: 'activity.create',
  ACTIVITY_READ:   'activity.read',
  ACTIVITY_UPDATE: 'activity.update',
  ACTIVITY_DELETE: 'activity.delete',

  // Users
  USER_INVITE:     'user.invite',
  USER_READ:       'user.read',
  USER_UPDATE:     'user.update',
  USER_REMOVE:     'user.remove',

  // Organization
  ORG_SETTINGS:    'org.settings',
  ORG_DELETE:      'org.delete',

  // Pipeline
  PIPELINE_MANAGE: 'pipeline.manage',

  // Reports
  REPORTS_VIEW:    'reports.view',

  // Billing
  BILLING_MANAGE:  'billing.manage',

  // Audit
  AUDIT_VIEW:      'audit.view',

  // Leads
  LEAD_CREATE:     'lead.create',
  LEAD_READ:       'lead.read',
  LEAD_UPDATE:     'lead.update',
  LEAD_DELETE:     'lead.delete',

  // Companies
  COMPANY_CREATE:  'company.create',
  COMPANY_READ:    'company.read',
  COMPANY_UPDATE:  'company.update',
  COMPANY_DELETE:  'company.delete',

  // Quotes
  QUOTE_CREATE:    'quote.create',
  QUOTE_READ:      'quote.read',
  QUOTE_UPDATE:    'quote.update',
  QUOTE_DELETE:    'quote.delete',

  // Invoices
  INVOICE_CREATE:  'invoice.create',
  INVOICE_READ:    'invoice.read',
  INVOICE_UPDATE:  'invoice.update',
  INVOICE_DELETE:  'invoice.delete',

  // Contracts
  CONTRACT_CREATE: 'contract.create',
  CONTRACT_READ:   'contract.read',
  CONTRACT_UPDATE: 'contract.update',
  CONTRACT_DELETE: 'contract.delete',

  // Sales (orders, targets, commissions)
  SALE_CREATE:     'sale.create',
  SALE_READ:       'sale.read',
  SALE_UPDATE:     'sale.update',
  SALE_DELETE:     'sale.delete',

  // Marketing (campaigns, coupons, referrals)
  MARKETING_CREATE: 'marketing.create',
  MARKETING_READ:   'marketing.read',
  MARKETING_UPDATE: 'marketing.update',
  MARKETING_DELETE: 'marketing.delete',

  // Customer support
  TICKET_CREATE:   'ticket.create',
  TICKET_READ:     'ticket.read',
  TICKET_UPDATE:   'ticket.update',
  TICKET_DELETE:   'ticket.delete',

  // Projects
  PROJECT_CREATE:  'project.create',
  PROJECT_READ:    'project.read',
  PROJECT_UPDATE:  'project.update',
  PROJECT_DELETE:  'project.delete',

  // HRMS
  HR_CREATE:       'hr.create',
  HR_READ:         'hr.read',
  HR_UPDATE:       'hr.update',
  HR_DELETE:       'hr.delete',

  // Finance
  FINANCE_CREATE:  'finance.create',
  FINANCE_READ:    'finance.read',
  FINANCE_UPDATE:  'finance.update',
  FINANCE_DELETE:  'finance.delete',

  // Inventory
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_READ:   'inventory.read',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_DELETE: 'inventory.delete',

  // Procurement
  PROCUREMENT_CREATE: 'procurement.create',
  PROCUREMENT_READ:   'procurement.read',
  PROCUREMENT_UPDATE: 'procurement.update',
  PROCUREMENT_DELETE: 'procurement.delete',

  // Assets
  ASSET_CREATE:    'asset.create',
  ASSET_READ:      'asset.read',
  ASSET_UPDATE:    'asset.update',
  ASSET_DELETE:    'asset.delete',

  // Documents
  DOCUMENT_CREATE: 'document.create',
  DOCUMENT_READ:   'document.read',
  DOCUMENT_UPDATE: 'document.update',
  DOCUMENT_DELETE: 'document.delete',

  // Calendar
  CALENDAR_CREATE: 'calendar.create',
  CALENDAR_READ:   'calendar.read',
  CALENDAR_UPDATE: 'calendar.update',
  CALENDAR_DELETE: 'calendar.delete',

  // Communication
  CHAT_CREATE:     'chat.create',
  CHAT_READ:       'chat.read',
  CHAT_DELETE:     'chat.delete',
  ANNOUNCEMENT_CREATE: 'announcement.create',
  ANNOUNCEMENT_READ:   'announcement.read',
  ANNOUNCEMENT_UPDATE: 'announcement.update',
  ANNOUNCEMENT_DELETE: 'announcement.delete',

  // Workflow
  WORKFLOW_CREATE: 'workflow.create',
  WORKFLOW_READ:   'workflow.read',
  WORKFLOW_UPDATE: 'workflow.update',
  WORKFLOW_DELETE: 'workflow.delete',

  // Security
  SECURITY_CREATE: 'security.create',
  SECURITY_READ:   'security.read',
  SECURITY_UPDATE: 'security.update',
  SECURITY_DELETE: 'security.delete',

  // Subscriptions / tenant
  SUBSCRIPTION_MANAGE: 'subscription.manage',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ─── Role definitions ─────────────────────────────────────────────────────────
// Which permissions each built-in role receives by default.
// These are seeded per organization on creation.

export const ROLE_DEFINITIONS = [
  {
    name: 'owner',
    displayName: 'Owner',
    description: 'Full access. Can manage billing and delete organization.',
    isSystem: true,
    permissions: Object.values(PERMISSIONS), // everything
  },
  {
    name: 'admin',
    displayName: 'Admin',
    description: 'Manages users, all modules and settings. Cannot delete org or manage billing.',
    isSystem: true,
    permissions: [
      PERMISSIONS.CONTACT_CREATE, PERMISSIONS.CONTACT_READ,
      PERMISSIONS.CONTACT_UPDATE, PERMISSIONS.CONTACT_DELETE,
      PERMISSIONS.CONTACT_IMPORT,
      PERMISSIONS.DEAL_CREATE, PERMISSIONS.DEAL_READ,
      PERMISSIONS.DEAL_UPDATE, PERMISSIONS.DEAL_DELETE,
      PERMISSIONS.ACTIVITY_CREATE, PERMISSIONS.ACTIVITY_READ,
      PERMISSIONS.ACTIVITY_UPDATE, PERMISSIONS.ACTIVITY_DELETE,
      PERMISSIONS.USER_INVITE, PERMISSIONS.USER_READ,
      PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_REMOVE,
      PERMISSIONS.ORG_SETTINGS,
      PERMISSIONS.PIPELINE_MANAGE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.AUDIT_VIEW,
      PERMISSIONS.LEAD_CREATE, PERMISSIONS.LEAD_READ,
      PERMISSIONS.LEAD_UPDATE, PERMISSIONS.LEAD_DELETE,
      PERMISSIONS.COMPANY_CREATE, PERMISSIONS.COMPANY_READ,
      PERMISSIONS.COMPANY_UPDATE, PERMISSIONS.COMPANY_DELETE,
      PERMISSIONS.QUOTE_CREATE, PERMISSIONS.QUOTE_READ,
      PERMISSIONS.QUOTE_UPDATE, PERMISSIONS.QUOTE_DELETE,
      PERMISSIONS.INVOICE_CREATE, PERMISSIONS.INVOICE_READ,
      PERMISSIONS.INVOICE_UPDATE, PERMISSIONS.INVOICE_DELETE,
      PERMISSIONS.CONTRACT_CREATE, PERMISSIONS.CONTRACT_READ,
      PERMISSIONS.CONTRACT_UPDATE, PERMISSIONS.CONTRACT_DELETE,
      PERMISSIONS.SALE_CREATE, PERMISSIONS.SALE_READ,
      PERMISSIONS.SALE_UPDATE, PERMISSIONS.SALE_DELETE,
      PERMISSIONS.MARKETING_CREATE, PERMISSIONS.MARKETING_READ,
      PERMISSIONS.MARKETING_UPDATE, PERMISSIONS.MARKETING_DELETE,
      PERMISSIONS.TICKET_CREATE, PERMISSIONS.TICKET_READ,
      PERMISSIONS.TICKET_UPDATE, PERMISSIONS.TICKET_DELETE,
      PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_READ,
      PERMISSIONS.PROJECT_UPDATE, PERMISSIONS.PROJECT_DELETE,
      PERMISSIONS.HR_CREATE, PERMISSIONS.HR_READ,
      PERMISSIONS.HR_UPDATE, PERMISSIONS.HR_DELETE,
      PERMISSIONS.FINANCE_CREATE, PERMISSIONS.FINANCE_READ,
      PERMISSIONS.FINANCE_UPDATE, PERMISSIONS.FINANCE_DELETE,
      PERMISSIONS.INVENTORY_CREATE, PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.INVENTORY_UPDATE, PERMISSIONS.INVENTORY_DELETE,
      PERMISSIONS.PROCUREMENT_CREATE, PERMISSIONS.PROCUREMENT_READ,
      PERMISSIONS.PROCUREMENT_UPDATE, PERMISSIONS.PROCUREMENT_DELETE,
      PERMISSIONS.ASSET_CREATE, PERMISSIONS.ASSET_READ,
      PERMISSIONS.ASSET_UPDATE, PERMISSIONS.ASSET_DELETE,
      PERMISSIONS.DOCUMENT_CREATE, PERMISSIONS.DOCUMENT_READ,
      PERMISSIONS.DOCUMENT_UPDATE, PERMISSIONS.DOCUMENT_DELETE,
      PERMISSIONS.CALENDAR_CREATE, PERMISSIONS.CALENDAR_READ,
      PERMISSIONS.CALENDAR_UPDATE, PERMISSIONS.CALENDAR_DELETE,
      PERMISSIONS.CHAT_CREATE, PERMISSIONS.CHAT_READ,
      PERMISSIONS.CHAT_DELETE,
      PERMISSIONS.ANNOUNCEMENT_CREATE, PERMISSIONS.ANNOUNCEMENT_READ,
      PERMISSIONS.ANNOUNCEMENT_UPDATE, PERMISSIONS.ANNOUNCEMENT_DELETE,
      PERMISSIONS.WORKFLOW_CREATE, PERMISSIONS.WORKFLOW_READ,
      PERMISSIONS.WORKFLOW_UPDATE, PERMISSIONS.WORKFLOW_DELETE,
      PERMISSIONS.SECURITY_CREATE, PERMISSIONS.SECURITY_READ,
      PERMISSIONS.SECURITY_UPDATE, PERMISSIONS.SECURITY_DELETE,
    ],
  },
  {
    name: 'sales_manager',
    displayName: 'Sales Manager',
    description: 'Manages team deals, contacts, leads, quotes and invoices.',
    isSystem: true,
    permissions: [
      PERMISSIONS.CONTACT_CREATE, PERMISSIONS.CONTACT_READ,
      PERMISSIONS.CONTACT_UPDATE, PERMISSIONS.CONTACT_DELETE,
      PERMISSIONS.DEAL_CREATE, PERMISSIONS.DEAL_READ,
      PERMISSIONS.DEAL_UPDATE, PERMISSIONS.DEAL_DELETE,
      PERMISSIONS.ACTIVITY_CREATE, PERMISSIONS.ACTIVITY_READ,
      PERMISSIONS.ACTIVITY_UPDATE, PERMISSIONS.ACTIVITY_DELETE,
      PERMISSIONS.USER_READ,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.LEAD_CREATE, PERMISSIONS.LEAD_READ,
      PERMISSIONS.LEAD_UPDATE, PERMISSIONS.LEAD_DELETE,
      PERMISSIONS.COMPANY_CREATE, PERMISSIONS.COMPANY_READ,
      PERMISSIONS.COMPANY_UPDATE,
      PERMISSIONS.QUOTE_CREATE, PERMISSIONS.QUOTE_READ,
      PERMISSIONS.QUOTE_UPDATE,
      PERMISSIONS.INVOICE_CREATE, PERMISSIONS.INVOICE_READ,
      PERMISSIONS.INVOICE_UPDATE,
      PERMISSIONS.CONTRACT_CREATE, PERMISSIONS.CONTRACT_READ,
      PERMISSIONS.CONTRACT_UPDATE,
      PERMISSIONS.SALE_CREATE, PERMISSIONS.SALE_READ,
      PERMISSIONS.SALE_UPDATE,
      PERMISSIONS.PROJECT_READ, PERMISSIONS.PROJECT_UPDATE,
      PERMISSIONS.DOCUMENT_CREATE, PERMISSIONS.DOCUMENT_READ,
      PERMISSIONS.CALENDAR_CREATE, PERMISSIONS.CALENDAR_READ,
      PERMISSIONS.CHAT_CREATE, PERMISSIONS.CHAT_READ,
      PERMISSIONS.ANNOUNCEMENT_READ,
      PERMISSIONS.TICKET_READ,
    ],
  },
  {
    name: 'sales_rep',
    displayName: 'Sales Representative',
    description: 'Creates and manages own leads, contacts, and deals.',
    isSystem: true,
    permissions: [
      PERMISSIONS.CONTACT_CREATE, PERMISSIONS.CONTACT_READ,
      PERMISSIONS.CONTACT_UPDATE,
      PERMISSIONS.DEAL_CREATE, PERMISSIONS.DEAL_READ,
      PERMISSIONS.DEAL_UPDATE,
      PERMISSIONS.ACTIVITY_CREATE, PERMISSIONS.ACTIVITY_READ,
      PERMISSIONS.ACTIVITY_UPDATE,
      PERMISSIONS.USER_READ,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.LEAD_CREATE, PERMISSIONS.LEAD_READ,
      PERMISSIONS.LEAD_UPDATE,
      PERMISSIONS.COMPANY_CREATE, PERMISSIONS.COMPANY_READ,
      PERMISSIONS.COMPANY_UPDATE,
      PERMISSIONS.QUOTE_CREATE, PERMISSIONS.QUOTE_READ,
      PERMISSIONS.QUOTE_UPDATE,
      PERMISSIONS.INVOICE_READ,
      PERMISSIONS.CONTRACT_READ,
      PERMISSIONS.SALE_READ,
      PERMISSIONS.CALENDAR_CREATE, PERMISSIONS.CALENDAR_READ,
      PERMISSIONS.CHAT_CREATE, PERMISSIONS.CHAT_READ,
      PERMISSIONS.DOCUMENT_READ,
    ],
  },
  {
    name: 'marketing',
    displayName: 'Marketing',
    description: 'Imports contacts, manages campaigns and analytics.',
    isSystem: true,
    permissions: [
      PERMISSIONS.CONTACT_CREATE, PERMISSIONS.CONTACT_READ,
      PERMISSIONS.CONTACT_UPDATE, PERMISSIONS.CONTACT_IMPORT,
      PERMISSIONS.DEAL_READ,
      PERMISSIONS.ACTIVITY_CREATE, PERMISSIONS.ACTIVITY_READ,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.USER_READ,
      PERMISSIONS.LEAD_CREATE, PERMISSIONS.LEAD_READ,
      PERMISSIONS.LEAD_UPDATE,
      PERMISSIONS.MARKETING_CREATE, PERMISSIONS.MARKETING_READ,
      PERMISSIONS.MARKETING_UPDATE,
      PERMISSIONS.ANNOUNCEMENT_CREATE, PERMISSIONS.ANNOUNCEMENT_READ,
      PERMISSIONS.CHAT_CREATE, PERMISSIONS.CHAT_READ,
      PERMISSIONS.CALENDAR_READ,
      PERMISSIONS.DOCUMENT_READ,
    ],
  },
  {
    name: 'support',
    displayName: 'Support',
    description: 'Views customer data, manages tickets and knowledge base.',
    isSystem: true,
    permissions: [
      PERMISSIONS.CONTACT_READ,
      PERMISSIONS.DEAL_READ,
      PERMISSIONS.ACTIVITY_CREATE, PERMISSIONS.ACTIVITY_READ,
      PERMISSIONS.ACTIVITY_UPDATE,
      PERMISSIONS.USER_READ,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.TICKET_CREATE, PERMISSIONS.TICKET_READ,
      PERMISSIONS.TICKET_UPDATE,
      PERMISSIONS.CHAT_CREATE, PERMISSIONS.CHAT_READ,
      PERMISSIONS.DOCUMENT_READ,
      PERMISSIONS.CALENDAR_READ,
    ],
  },
] as const;

// ─── Invitation hierarchy ─────────────────────────────────────────────────────
// Key = inviter role name, value = roles they are allowed to invite
export const INVITE_PERMISSIONS: Record<string, string[]> = {
  owner:         ['owner', 'admin', 'sales_manager', 'sales_rep', 'marketing', 'support'],
  admin:         ['sales_manager', 'sales_rep', 'marketing', 'support'],
  sales_manager: ['sales_rep'],
  sales_rep:     [],
  marketing:     [],
  support:       [],
};
