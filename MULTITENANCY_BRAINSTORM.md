# LaborTrack Multitenancy Brainstorm

## Current Architecture Analysis

Your system currently has:

- Users with roles (admin/supervisor)
- Projects belonging to users
- Labors assigned to projects
- Attendance logs, messages, payroll data

## Multitenancy Options

### 1. Shared Database, Shared Schema (Row-Level Security)

**How it works:** Add `company_id` to all tables and filter queries

```
companies table → users.company_id → projects.company_id → labors.company_id
```

**Pros:**

- Easiest migration
- Cost-effective
- Simple backups
- Easy to add new companies
- Single database connection

**Cons:**

- Security concerns if not implemented properly
- Potential data leaks
- Performance impact with large datasets
- Harder to customize per-company features

### 2. Shared Database, Separate Schemas

**How it works:** Each company gets its own database schema

```
database: labortrack
├── company_1.users, company_1.projects
├── company_2.users, company_2.projects
```

**Pros:**

- Better data isolation
- Moderate complexity
- Can have different table structures per company
- Better performance for large datasets

**Cons:**

- Complex migrations
- Schema management overhead
- Harder to share data between companies
- More complex deployment

### 3. Separate Databases per Company

**How it works:** Each company gets its own database

```
labortrack_company_1, labortrack_company_2, etc.
```

**Pros:**

- Complete isolation
- Easy scaling
- Better security
- Can use different database types per company
- Easy backups/restores per company

**Cons:**

- Higher cost
- Complex deployment
- Backup management overhead
- Harder to maintain consistency

## Key Questions for Decision Making

1. **Scale**: How many companies do you expect? 10s, 100s, 1000s?
    - **Answer**: ~100 companies

2. **Budget**: Are you targeting cost-sensitive startups or enterprise clients?
    - **Answer**: Startups budget (cost-sensitive)

3. **Data Sensitivity**: How sensitive is the payroll/attendance data?
    - **Answer**: Mid-level sensitivity (not highly sensitive but needs protection)

4. **Customization**: Do companies need custom fields or workflows?
    - **Answer**: No customization per company needed

5. **Subdomain Strategy**: Do you want `company.labortrack.com` or `labortrack.com/company`?
    - **Answer**: `company.labortrack.com` (subdomain approach)

6. **Admin Needs**: Do you need a super-admin to manage all companies?
    - **Answer**: Yes, super-admin functionality required

7. **Billing**: Will companies be billed per user, per project, or flat rate?
    - **Answer**: Undecided - need billing strategy brainstorming

## Recommended Approach (Based on Your Answers)

**Final Recommendation: Option 1 (Shared Database, Row-Level Security)**

### Why This Approach Fits Your Needs:

- **Cost-effective**: Perfect for startup budgets
- **Scalable to 100 companies**: Well within limits for this approach
- **Mid-level security**: Adequate with proper implementation
- **No customization needed**: Shared schema works perfectly
- **Subdomain support**: Easy to implement with Laravel routing
- **Super-admin**: Straightforward to add global management

### Implementation Components:

- **Global scopes** on all models for `company_id`
- **Middleware** to set current company context from subdomain
- **Subdomain routing** for `company.labortrack.com`
- **Super-admin panel** for platform management
- **Company signup flow** with automatic subdomain creation

### Migration Strategy:

1. Add `companies` table
2. Add `company_id` to all existing tables
3. Create migration to assign existing data to a default company
4. Implement global scopes and middleware
5. Add subdomain routing
6. Create company signup flow

## Next Steps

1. Answer the key questions above
2. Choose the multitenancy approach
3. Plan the migration strategy
4. Implement the chosen approach
5. Test thoroughly before production deployment

## Billing Strategy Brainstorming

### Hybrid Model (Recommended)

**Model**: Base fee + per user overage

- $100/month base (includes 10 users)
- $5 per additional user per month
- Unlimited projects

### Additional Billing Considerations:

- **Annual discounts**: 10-20% off for yearly billing
- **Free trial**: 14-day free trial for new companies

## Additional Considerations

### Security

- Implement proper row-level security
- Add audit logging for data access
- Ensure no cross-company data leaks

### Performance

- Consider database indexing for `company_id`
- Implement caching strategies
- Monitor query performance

### Scalability

- Plan for database sharding if needed
- Consider read replicas for better performance
- Implement proper backup strategies

### User Experience

- Seamless company switching for users with multiple companies
- Company-specific branding options
- Clean subdomain-based navigation
