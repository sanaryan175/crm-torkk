// Organization Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  country: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  fiscalYear: number;
  companySize?: string;
  setupComplete: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// RBAC Types
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isSystem: boolean;
}

export interface Permission {
  name: string;
  resource: string;
  action: string;
}

// User Types
export type UserRole = 'owner' | 'admin' | 'sales_manager' | 'sales_rep' | 'marketing' | 'support';

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  isOwner: boolean;
  onboardingComplete: boolean;
  profileCompleted: boolean;
  timezone: string;
  language: string;
  phone?: string;
  jobTitle?: string;
  emailNotifications: boolean;
  taskReminders: boolean;
  meetingReminders: boolean;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  avatar?: string;
  lastLoginAt?: Date | string;
  createdAt: Date | string;
  organization?: Pick<Organization, 'id' | 'name' | 'country' | 'currency' | 'setupComplete' | 'timezone' | 'dateFormat' | 'timeFormat'>;
}

// Contact Types
export type ContactStatus = 'active' | 'inactive' | 'blocked';
export type ContactSource = 'website' | 'referral' | 'cold_outreach' | 'event' | 'partner' | 'other';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status: ContactStatus;
  source: ContactSource;
  tags: string[];
  assignedTo?: string | {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  } | null;
  notes?: string;
  createdBy: string; // User ID
  createdAt: Date | string;
  updatedAt: Date | string;
  _links?: {
    dealsCount: number;
    activitiesCount: number;
  };
}

// Deal Types
export type DealStage = 'new' | 'contacted' | 'demo_scheduled' | 'proposal_sent' | 'negotiation' | 'closed_won' | 'closed_lost';
export type DealPriority = 'low' | 'medium' | 'high';
export type DealCloseReason = 'won' | 'lost' | 'no_decision' | 'cancelled' | '';

export const DEAL_STAGES: Record<DealStage, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-gray-500' },
  contacted: { label: 'Contacted', color: 'bg-blue-500' },
  demo_scheduled: { label: 'Demo Scheduled', color: 'bg-cyan-500' },
  proposal_sent: { label: 'Proposal Sent', color: 'bg-purple-500' },
  negotiation: { label: 'Negotiation', color: 'bg-orange-500' },
  closed_won: { label: 'Closed Won', color: 'bg-green-500' },
  closed_lost: { label: 'Closed Lost', color: 'bg-red-500' },
};

export interface Deal {
  id: string;
  title: string;
  contactId?: string;
  company?: string;
  value: number;
  stage: DealStage;
  priority: DealPriority;
  expectedCloseDate?: Date | string;
  assignedTo?: string | {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  } | null;
  notes?: string;
  closeReason?: DealCloseReason;
  closedAt?: Date | string;
  createdBy: string; // User ID
  createdAt: Date | string;
  updatedAt: Date | string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
    email: string;
  } | null;
}

// Activity Types
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task';

export const ACTIVITY_TYPES: Record<ActivityType, { label: string; icon: string; color: string }> = {
  call: { label: 'Call', icon: 'Phone', color: 'bg-blue-500' },
  email: { label: 'Email', icon: 'Mail', color: 'bg-purple-500' },
  meeting: { label: 'Meeting', icon: 'Calendar', color: 'bg-green-500' },
  note: { label: 'Note', icon: 'FileText', color: 'bg-gray-500' },
  task: { label: 'Task', icon: 'CheckSquare', color: 'bg-orange-500' },
};

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description?: string;
  contactId?: string;
  dealId?: string;
  assignedTo?: string | {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  } | null;
  dueDate?: Date | string;
  completed: boolean;
  completedAt?: Date | string;
  createdBy: string; // User ID
  createdAt: Date | string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
  } | null;
  deal?: {
    id: string;
    title: string;
    value: number;
  } | null;
}

// Invitation Types
export interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expiresAt: Date | string;
  createdAt: Date | string;
  role: { name: string; displayName: string };
  invitedBy: { name: string; email: string };
}

// Dashboard Types
export interface DashboardTrends {
  contacts: number;
  pipeline: number;
  conversion: number;
  closed: number;
}

export interface DashboardMetrics {
  totalContacts: number;
  totalDeals: number;
  pipelineValue: number;
  closedWonThisMonth: number;
  conversionRate: number;
  averageDealSize: number;
  overdueTasks: number;
  thisWeekActivities: number;
  trends: DashboardTrends;
}

export interface PipelineMetrics {
  stageName: DealStage;
  count: number;
  value: number;
  avgValue: number;
}

// File Entry Types
export interface FileEntry {
  id: string;
  organizationId: string;
  uploadedById: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  folder: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface FileStructure {
  folders: string[];
  files: FileEntry[];
  tree: Record<string, FileEntry[]>;
}

// ─── Shared ───────────────────────────────────────────────────────────────────
export interface UserRef {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

// ─── CRM Extensions ───────────────────────────────────────────────────────────
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  source: string;
  status: LeadStatus;
  tags: string[];
  value?: number | null;
  notes?: string | null;
  assignedTo?: UserRef | null;
  convertedContactId?: string | null;
  convertedDealId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  size?: string | null;
  tags: string[];
  description?: string | null;
  owner?: UserRef | null;
  notes?: string | null;
  _count?: { contacts: number; deals: number };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type FollowUpStatus = 'pending' | 'done' | 'cancelled';

export interface FollowUp {
  id: string;
  contactId?: string | null;
  dealId?: string | null;
  leadId?: string | null;
  title: string;
  notes?: string | null;
  scheduledAt: Date | string;
  status: FollowUpStatus;
  assignedTo?: UserRef | null;
  completedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface CustomerTimeline {
  id: string;
  contactId?: string | null;
  dealId?: string | null;
  companyId?: string | null;
  type: string;
  title: string;
  content?: string | null;
  metadata?: any;
  createdById: string;
  createdAt: Date | string;
}

export interface EmailTracking {
  id: string;
  activityId?: string | null;
  toEmail: string;
  subject?: string | null;
  sentAt: Date | string;
  openedAt?: Date | string | null;
  openedCount: number;
  clickedCount: number;
  metadata?: any;
}

// ─── Quotes / Invoices / Contracts ────────────────────────────────────────────
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface QuoteItem {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
  sortOrder: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
  title: string;
  status: QuoteStatus;
  issueDate: Date | string;
  expiryDate?: Date | string | null;
  currency: string;
  taxRate: number;
  discount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string | null;
  items: QuoteItem[];
  createdAt: Date | string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'partial_paid' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
  sortOrder: number;
}

export interface Payment {
  id: string;
  invoiceId?: string | null;
  amount: number;
  method: string;
  reference?: string | null;
  paidAt: Date | string;
  status: string;
  notes?: string | null;
  createdAt: Date | string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quoteId?: string | null;
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
  status: InvoiceStatus;
  issueDate: Date | string;
  dueDate?: Date | string | null;
  paidAt?: Date | string | null;
  currency: string;
  taxRate: number;
  discount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  notes?: string | null;
  items: InvoiceItem[];
  payments?: Payment[];
  createdAt: Date | string;
}

export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated';

export interface Contract {
  id: string;
  title: string;
  contractNumber: string;
  type?: string | null;
  status: ContractStatus;
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  renewalDate?: Date | string | null;
  value: number;
  terms?: string | null;
  fileId?: string | null;
  signedAt?: Date | string | null;
  signedByName?: string | null;
  createdAt: Date | string;
}

// ─── Sales ────────────────────────────────────────────────────────────────────
export type SalesOrderStatus = 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface SalesOrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  invoiceId?: string | null;
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
  status: SalesOrderStatus;
  orderDate: Date | string;
  deliveryDate?: Date | string | null;
  currency: string;
  taxRate: number;
  discount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string | null;
  items: SalesOrderItem[];
  createdAt: Date | string;
}

export interface SalesTarget {
  id: string;
  userId?: string | null;
  period: string;
  amount: number;
  achieved?: number;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  createdAt: Date | string;
}

export interface CommissionRule {
  id: string;
  name: string;
  minDealValue?: number | null;
  maxDealValue?: number | null;
  rate: number;
  isActive?: boolean;
  createdAt: Date | string;
}

export interface Commission {
  id: string;
  dealId?: string | null;
  userId?: string | null;
  amount: number;
  rate?: number | null;
  status: string;
  createdAt: Date | string;
  user?: UserRef | null;
}

// ─── Marketing ────────────────────────────────────────────────────────────────
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'completed' | 'cancelled';

export interface Campaign {
  id: string;
  name: string;
  type: string;
  subject?: string | null;
  content?: string | null;
  status: CampaignStatus;
  scheduledAt?: Date | string | null;
  sentAt?: Date | string | null;
  audience?: any;
  sentCount?: number;
  openCount?: number;
  clickCount?: number;
  _count?: { recipients: number };
  createdAt: Date | string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  validFrom?: Date | string | null;
  validTo?: Date | string | null;
  usageLimit: number;
  usedCount?: number;
  status: string;
  createdAt: Date | string;
}

export interface Referral {
  id: string;
  referrerName?: string | null;
  referredName?: string | null;
  referrerEmail?: string | null;
  referredEmail?: string | null;
  status: string;
  rewardAmount?: number;
  rewardType?: string | null;
  createdAt: Date | string;
}

// ─── Customer Support ─────────────────────────────────────────────────────────
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed' | 'reopened';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description?: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  contactId?: string | null;
  assignedTo?: UserRef | null;
  customerName?: string | null;
  customerEmail?: string | null;
  tags: string[];
  dueDate?: Date | string | null;
  createdAt: Date | string;
  comments?: TicketComment[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  body: string;
  isInternal?: boolean;
  authorId: string;
  createdAt: Date | string;
}

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  category?: string | null;
  tags: string[];
  status: string;
  publishedAt?: Date | string | null;
  authorId?: string | null;
  createdAt: Date | string;
}

export interface SlaPolicy {
  id: string;
  name: string;
  responseHours?: number | null;
  resolutionHours?: number | null;
  priority?: string | null;
  isDefault?: boolean;
  createdAt?: Date | string;
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  status: ProjectStatus;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  budget?: number | null;
  progress: number;
  manager?: UserRef | null;
  members?: any[];
  milestones?: ProjectMilestone[];
  _count?: { tasks: number };
  createdAt: Date | string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId?: string | null;
  role?: string | null;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  dueDate?: Date | string | null;
  status: string;
  completedAt?: Date | string | null;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  milestoneId?: string | null;
  assignedTo?: UserRef | null;
  dueDate?: Date | string | null;
  estimatedHours?: number | null;
  completedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string | null;
  entryDate: Date | string;
  hours: number;
  description?: string | null;
  billable: boolean;
  createdAt: Date | string;
}

// ─── HRMS ─────────────────────────────────────────────────────────────────────
export interface Department {
  id: string;
  name: string;
  headId?: string | null;
  createdAt: Date | string;
}

export interface Employee {
  id: string;
  userId?: string | null;
  employeeCode?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  departmentId?: string | null;
  designation?: string | null;
  employmentType?: string | null;
  joinDate?: Date | string | null;
  exitDate?: Date | string | null;
  status: string;
  managerId?: string | null;
  salary?: number | null;
  currency?: string | null;
  manager?: Employee | null;
  department?: Pick<Department, 'id' | 'name'> | null;
  createdAt: Date | string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date | string;
  status: string;
  checkIn?: Date | string | null;
  checkOut?: Date | string | null;
  hours?: number | null;
  overtime?: number | null;
  notes?: string | null;
  createdAt: Date | string;
}

export interface Leave {
  id: string;
  employeeId: string;
  type: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  days?: number | null;
  reason?: string | null;
  reviewNotes?: string | null;
  reviewedById?: string | null;
  approvedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface PayrollRun {
  id: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  status: string;
  totalAmount?: number;
  processedById?: string | null;
  processedAt?: Date | string | null;
  entries?: PayrollEntry[];
  createdAt: Date | string;
}

export interface PayrollEntry {
  id: string;
  runId: string;
  employeeId: string;
  basicPay?: number;
  allowances?: number;
  deductions?: number;
  tax?: number;
  netPay?: number;
  status?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department?: string | null;
  location?: string | null;
  type?: string | null;
  description?: string | null;
  requirements?: string | null;
  salaryRange?: string | null;
  status: string;
  postedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface JobApplication {
  id: string;
  jobPostingId: string;
  candidateName: string;
  candidateEmail: string;
  phone?: string | null;
  resumeUrl?: string | null;
  coverLetter?: string | null;
  status: string;
  source?: string | null;
  notes?: string | null;
  createdAt: Date | string;
}

export interface Interview {
  id: string;
  applicationId?: string | null;
  jobPostingId?: string | null;
  candidateName: string;
  candidateEmail: string;
  scheduledAt?: Date | string | null;
  duration?: number | null;
  type?: string | null;
  interviewer?: UserRef | null;
  status: string;
  notes?: string | null;
  rating?: number | null;
  createdAt: Date | string;
}

export interface OfferLetter {
  id: string;
  applicationId?: string | null;
  candidateName: string;
  candidateEmail: string;
  position?: string | null;
  salary?: number | null;
  joiningDate?: Date | string | null;
  status: string;
  documentId?: string | null;
  sentAt?: Date | string | null;
  acceptedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewer?: UserRef | null;
  periodStart?: Date | string | null;
  periodEnd?: Date | string | null;
  overallRating?: number | null;
  strengths?: string | null;
  improvements?: string | null;
  goals?: string | null;
  status: string;
  submittedAt?: Date | string | null;
  completedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface Promotion {
  id: string;
  employeeId: string;
  fromDesignation?: string | null;
  toDesignation: string;
  effectiveDate?: Date | string | null;
  reason?: string | null;
  oldSalary?: number | null;
  newSalary?: number | null;
  createdAt: Date | string;
}

export interface Training {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  status: string;
  enrollments?: TrainingEnrollment[];
  createdAt: Date | string;
}

export interface TrainingEnrollment {
  id: string;
  trainingId: string;
  employeeId: string;
  status: string;
  completionDate?: Date | string | null;
  score?: number | null;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  name: string;
  type: string;
  fileId?: string | null;
  uploadedById?: string | null;
  createdAt: Date | string;
}

export interface EmployeeExit {
  id: string;
  employeeId: string;
  resignDate?: Date | string | null;
  lastWorkingDay?: Date | string | null;
  reason?: string | null;
  exitInterview?: string | null;
  status: string;
  approvedById?: string | null;
  createdAt: Date | string;
}

// ─── Finance ──────────────────────────────────────────────────────────────────
export interface Expense {
  id: string;
  title: string;
  category?: string | null;
  amount: number;
  expenseDate: Date | string;
  method?: string | null;
  paidBy?: UserRef | null;
  vendorName?: string | null;
  receiptFileId?: string | null;
  status: string;
  notes?: string | null;
  createdAt: Date | string;
}

export interface Income {
  id: string;
  title: string;
  category?: string | null;
  amount: number;
  incomeDate: Date | string;
  method?: string | null;
  source?: string | null;
  notes?: string | null;
  createdAt: Date | string;
}

export interface Budget {
  id: string;
  name: string;
  category?: string | null;
  amount: number;
  periodStart?: Date | string | null;
  periodEnd?: Date | string | null;
  status: string;
  createdAt: Date | string;
}

export interface BankAccount {
  id: string;
  name: string;
  bankName?: string | null;
  accountNumber?: string | null;
  accountType?: string | null;
  ifsc?: string | null;
  branch?: string | null;
  openingBalance?: number | null;
  balance: number;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt: Date | string;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  type?: string | null;
  amount: number;
  date?: Date | string | null;
  description?: string | null;
  reference?: string | null;
  createdAt: Date | string;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type?: string | null;
  cgst?: number | null;
  sgst?: number | null;
  igst?: number | null;
  isDefault?: boolean;
  isActive?: boolean;
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  categoryId?: string | null;
  description?: string | null;
  unit?: string | null;
  price: number;
  cost?: number | null;
  taxRate?: number | null;
  reorderLevel?: number | null;
  status: string;
  stock?: number;
  createdAt: Date | string;
}

export interface ProductCategory {
  id: string;
  name: string;
  parentId?: string | null;
  description?: string | null;
  createdAt: Date | string;
}

export interface Warehouse {
  id: string;
  name: string;
  code?: string | null;
  address?: string | null;
  managerId?: string | null;
  isActive?: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId?: string | null;
  type: string;
  quantity: number;
  unitCost?: number | null;
  reference?: string | null;
  note?: string | null;
  movedById?: string | null;
  createdAt: Date | string;
}

// ─── Procurement ──────────────────────────────────────────────────────────────
export interface Vendor {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  status?: string | null;
  createdAt: Date | string;
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  title: string;
  department?: string | null;
  requestedById?: string | null;
  requestedDate?: Date | string | null;
  neededDate?: Date | string | null;
  status: string;
  items?: any;
  approvedById?: string | null;
  approvedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface Rfq {
  id: string;
  rfqNumber: string;
  vendorId?: string | null;
  title: string;
  status: string;
  issuedDate?: Date | string | null;
  dueDate?: Date | string | null;
  items?: any;
  createdAt: Date | string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId?: string | null;
  status: string;
  orderDate?: Date | string | null;
  expectedDate?: Date | string | null;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  receivedAt?: Date | string | null;
  items?: any[];
  vendor?: Pick<Vendor, 'id' | 'name'> | null;
  createdAt: Date | string;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  poId?: string | null;
  amount: number;
  method?: string | null;
  status?: string | null;
  reference?: string | null;
  paidAt?: Date | string | null;
  createdAt: Date | string;
}

// ─── Assets ───────────────────────────────────────────────────────────────────
export interface CompanyAsset {
  id: string;
  name: string;
  assetCode?: string | null;
  category: string;
  serialNumber?: string | null;
  purchaseDate?: Date | string | null;
  purchaseCost: number;
  currentValue: number;
  depreciationRate?: number | null;
  vendorName?: string | null;
  warrantyExpiry?: Date | string | null;
  status: string;
  assignedToId?: string | null;
  notes?: string | null;
  createdAt: Date | string;
}

export interface AssetMaintenance {
  id: string;
  assetId: string;
  type: string;
  description?: string | null;
  scheduledDate?: Date | string | null;
  completedDate?: Date | string | null;
  cost?: number | null;
  vendor?: string | null;
  status: string;
  createdAt: Date | string;
}

// ─── Documents ────────────────────────────────────────────────────────────────
export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileId?: string | null;
  size?: number | null;
  note?: string | null;
  uploadedById?: string | null;
  createdAt: Date | string;
}

export interface Document {
  id: string;
  name: string;
  category?: string | null;
  fileId?: string | null;
  relatedModel?: string | null;
  relatedId?: string | null;
  version: number;
  status: string;
  signed?: boolean;
  signedAt?: Date | string | null;
  signatureName?: string | null;
  uploadedById?: string | null;
  versions?: DocumentVersion[];
  createdAt: Date | string;
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  allDay?: boolean;
  type: string;
  location?: string | null;
  relatedModel?: string | null;
  relatedId?: string | null;
  createdById?: string | null;
  attendees?: EventAttendee[];
  reminders?: Reminder[];
  createdAt: Date | string;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  status: string;
}

export interface Reminder {
  id: string;
  title: string;
  remindAt: Date | string;
  relatedModel?: string | null;
  relatedId?: string | null;
  userId?: string | null;
  status: string;
}

// ─── Communication ────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  sender?: UserRef | null;
  receiver?: UserRef | null;
  content: string;
  readAt?: Date | string | null;
  createdAt: Date | string;
}

export interface Announcement {
  id: string;
  title: string;
  content?: string | null;
  status: string;
  publishedAt?: Date | string | null;
  createdById?: string | null;
  createdAt: Date | string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body?: string | null;
  type?: string | null;
  readAt?: Date | string | null;
  relatedModel?: string | null;
  relatedId?: string | null;
  createdAt: Date | string;
}

// ─── Workflow ─────────────────────────────────────────────────────────────────
export interface ApprovalFlow {
  id: string;
  name: string;
  description?: string | null;
  module?: string | null;
  steps?: any;
  isActive?: boolean;
  createdById?: string | null;
  createdAt: Date | string;
}

export interface ApprovalRequest {
  id: string;
  flowId?: string | null;
  module?: string | null;
  resourceId?: string | null;
  title: string;
  reason?: string | null;
  status: string;
  currentStep?: number | null;
  requestedById?: string | null;
  approvedById?: string | null;
  approvedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface ScheduledJob {
  id: string;
  name: string;
  type: string;
  cron?: string | null;
  payload?: any;
  isActive?: boolean;
  lastRunAt?: Date | string | null;
  nextRunAt?: Date | string | null;
  createdAt: Date | string;
}

export interface BusinessRule {
  id: string;
  name: string;
  entity?: string | null;
  condition?: any;
  action?: any;
  isActive?: boolean;
  createdAt: Date | string;
}

// ─── Security & Multi-brand ───────────────────────────────────────────────────
export interface ApiKey {
  id: string;
  name: string;
  keyPrefix?: string | null;
  scopes?: any;
  lastUsedAt?: Date | string | null;
  expiresAt?: Date | string | null;
  status: string;
  createdAt: Date | string;
}

export interface TwoFactorSetting {
  id: string;
  userId: string;
  enabled: boolean;
  verifiedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  email?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status?: string | null;
  method?: string | null;
  createdAt: Date | string;
  user?: UserRef | null;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date | string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  domain?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt: Date | string;
}

export interface Branch {
  id: string;
  name: string;
  brandId?: string | null;
  code?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
  createdAt: Date | string;
}

export interface Subscription {
  id: string;
  plan: string;
  status: string;
  seats?: number | null;
  amount?: number | null;
  startDate?: Date | string | null;
  renewDate?: Date | string | null;
  createdAt: Date | string;
}
