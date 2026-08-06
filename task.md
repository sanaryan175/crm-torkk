# Brand CRM — Build Task List

Build ALL 18 modules from the requirements doc on top of the existing CRM Manager
stack (Next.js frontend, Express + Prisma + PostgreSQL backend, multi-tenant, RBAC).
NO Flutter — web only.

## Conventions (FOLLOW FOR EVERY MODULE)

- Backend: every model has `organizationId` (tenant-scoped). Files:
  - `backend/prisma/schema.prisma` — models/enums
  - `backend/src/validations/<module>.validation.ts` — Zod schemas
  - `backend/src/services/<module>.service.ts` — business logic (org-scoped, NotFound on foreign refs)
  - `backend/src/controllers/<module>.controller.ts` — thin controllers → `sendSuccess`
  - `backend/src/routes/<module>.routes.ts` — `authenticate` per router + `requirePermission(...)` per route
  - register router in `backend/src/routes/index.ts`
  - reuse `NotFoundError`/`ForbiddenError` from `utils/errors`
- New permissions (add to `src/rbac/permissions.ts` + seed role sets + `backfill-permissions.ts`):
  - `lead.*`, `company.*`, `quote.*`, `invoice.*`, `contract.*`, `sale.*`, `marketing.*`,
    `ticket.*`, `project.*`, `hr.*`, `finance.*`, `inventory.*`, `procurement.*`, `asset.*`,
    `document.*`, `calendar.*`, `chat.*`, `workflow.*`, `security.*` (create/read/update/delete where sensible)
- Frontend: page under `app/<route>/page.tsx` (`'use client'`), hooks in `lib/hooks.ts`,
  types in `lib/types.ts`, nav in `components/layout/sidebar.tsx` (permission-gated),
  mutate then `triggerRefresh('<resource>')`.
- Audit: write `AuditLog` rows for create/update/delete on every new module
  (action `create|update|delete`, resource = module name, metadata = changed fields).
- After each phase: `npm run build` in backend to typecheck. Final: run migration + verify.

---

## Phase 0 — Foundations
- [x] Expand `schema.prisma` with ALL new models/enums (below) in one migration
- [x] Create DB migration (apply locally or generate SQL)
- [x] Extend RBAC permissions (`src/rbac/permissions.ts`, roles, `backfill-permissions.ts`)
- [x] Add shared `AuditService` util (helper that writes audit rows)
- [x] Verify backend typechecks: `npm run build`
- [x] Backfill permissions for existing orgs (`npm run backfill:perms`)
- [x] Install missing deps (multer, @getbrevo/brevo)
- [x] Enrich Company model + link contacts/deals (migration `company_relations`)

## Phase 1 — CRM extensions
- [x] Lead Management (Lead model, convert-to-contact/deal)
- [x] Company Management (Company model + link contacts/deals)
- [x] Follow-up Management (FollowUp model)
- [x] Customer Timeline (CustomerTimeline feed)
- [x] Email Tracking (EmailTracking)
- [ ] WhatsApp integration stub (channel log via EmailTracking-like model / campaign recipients)
- [ ] Frontend pages: `/leads`, `/companies`

## Phase 2 — Quotations, Invoices, Contracts
- [ ] Quote + QuoteItem (numbering, totals, tax)
- [ ] Invoice + InvoiceItem + Payment (AR)
- [ ] Contract (signing, expiry)
- [ ] Frontend pages: `/quotes`, `/invoices`, `/contracts`

## Phase 3 — Sales
- [ ] SalesOrder + SalesOrderItem (customer purchase history = orders)
- [ ] SalesTarget
- [ ] CommissionRule + Commission (deal → commission)
- [ ] Frontend pages: `/sales/orders`, `/sales/targets`, `/sales/commissions`

## Phase 4 — Marketing
- [ ] Campaign + CampaignRecipient (email/whatsapp/sms/push)
- [ ] Coupon
- [ ] Referral
- [ ] Frontend pages: `/marketing/campaigns`, `/marketing/coupons`, `/marketing/referrals`

## Phase 5 — Customer Support
- [ ] Ticket + TicketComment
- [ ] KnowledgeArticle (knowledge base)
- [ ] SlaPolicy
- [ ] Frontend pages: `/support/tickets`, `/support/knowledge-base`

## Phase 6 — Project Management
- [ ] Project + ProjectMember + ProjectMilestone + ProjectTask + TimeEntry
- [ ] Frontend pages: `/projects` (list + board), `/projects/[id]`

## Phase 7 — HRMS
- [ ] Department, Employee
- [ ] Attendance
- [ ] Leave
- [ ] PayrollRun + PayrollEntry
- [ ] JobPosting + Application + Interview + OfferLetter (recruitment)
- [ ] PerformanceReview, Promotion, Training + TrainingEnrollment
- [ ] EmployeeDocument, EmployeeExit
- [ ] Frontend pages: `/hr/employees`, `/hr/attendance`, `/hr/leaves`, `/hr/payroll`,
      `/hr/recruitment`, `/hr/reviews`, `/hr/training`, `/hr/assets`

## Phase 8 — Finance
- [ ] Expense, Income, Budget, BankAccount + BankTransaction, TaxRate
- [ ] Profit & Loss + Balance Sheet + Financial reports (aggregation endpoints)
- [ ] Frontend pages: `/finance/expenses`, `/finance/income`, `/finance/budget`,
      `/finance/banks`, `/finance/reports`

## Phase 9 — Inventory
- [ ] Category, Product (barcode/sku), Warehouse, Supplier, StockMovement
- [ ] Stock levels + stock in/out
- [ ] Frontend pages: `/inventory/products`, `/inventory/categories`,
      `/inventory/warehouses`, `/inventory/stock`

## Phase 10 — Procurement
- [ ] Vendor, PurchaseRequest + items, RFQ, PurchaseOrder + items, VendorPayment
- [ ] Frontend pages: `/procurement/vendors`, `/procurement/requests`,
      `/procurement/rfqs`, `/procurement/orders`

## Phase 11 — Asset Management
- [ ] CompanyAsset, AssetMaintenance, DepreciationEntry
- [ ] Frontend page: `/assets`

## Phase 12 — Document Management
- [ ] Document + DocumentVersion + digital signature
- [ ] Frontend page: `/documents`

## Phase 13 — Calendar & Scheduling
- [ ] CalendarEvent + EventAttendee, Reminder
- [ ] Frontend page: `/calendar`

## Phase 14 — Communication
- [ ] ChatMessage (internal chat), Announcement, AppNotification (notification center)
- [ ] Frontend pages: `/chat`, `/announcements`, notifications bell

## Phase 15 — Reports & Analytics
- [ ] Executive dashboard aggregation endpoint
- [ ] HR / Sales / Finance / Marketing / Inventory report endpoints
- [ ] Frontend page: `/reports` (real analytics view)

## Phase 16 — Workflow Automation
- [ ] ApprovalFlow + ApprovalRequest
- [ ] ScheduledJob (job registry + run loop), BusinessRule
- [ ] Frontend pages: `/workflows`

## Phase 17 — Security & Administration
- [ ] ApiKey (create/list/revoke)
- [ ] LoginHistory (from audit + dedicated model)
- [ ] TwoFactorSetting (2FA enable/verify)
- [ ] Audit logs for ALL mutation flows (deals, contacts, activities, invoices…)
- [ ] Frontend pages: settings tabs (security, API keys, audit, login history)

## Phase 18 — Multi-Tenant / Multi-Brand
- [ ] Brand, Branch models
- [ ] Subscription plan model
- [ ] Frontend pages: `/settings` tabs (brands, branches, subscription)

## Phase 19 — Final verification
- [ ] Backend: `npm run build` (tsc) clean
- [ ] Frontend: `npm run build` clean
- [ ] `npm test` (existing PBT suite still passes)
- [ ] Run migration on local DB, `npm run verify`
