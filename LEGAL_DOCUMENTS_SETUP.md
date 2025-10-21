# Legal Documents Setup Guide

This guide explains what information you need to add to complete your Privacy Policy and Terms & Conditions pages.

## 📋 Overview

We've created comprehensive, UK GDPR-compliant legal documents for your Robot Recruit AI platform. These documents are ready to use but require you to fill in your specific company details.

---

## 📍 Document Locations

### For All Users (Public Access):
- `/privacy` - Privacy Policy (abbreviated version with link to full policy)
- `/terms` - Terms & Conditions (abbreviated version with link to full terms)

### For Logged-In Users (Dashboard):
- `/dashboard/privacy` - Full Privacy Policy
- `/dashboard/terms` - Full Terms & Conditions

---

## ✏️ Information You Need to Provide

### 1. Company Information

Replace the following placeholders in **BOTH** files:

#### In Privacy Policy Files:
- `src/app/(dashboard)/privacy/page.tsx`
- `src/app/privacy/page.tsx`

#### In Terms Files:
- `src/app/(dashboard)/terms/page.tsx`
- `src/app/terms/page.tsx`

**Find and Replace:**

```
[Your Company Address]
```
Replace with your full UK business address, e.g.:
```
123 Tech Street, London, SW1A 1AA, United Kingdom
```

```
[Your Companies House Registration Number]
```
Replace with your Companies House number, e.g.:
```
12345678
```

```
[Your ICO Registration Number]
```
Replace with your ICO (Information Commissioner's Office) registration number, e.g.:
```
ZA123456
```

```
[Your VAT Number if applicable]
```
Replace with your VAT number or remove this line if not VAT registered, e.g.:
```
GB123456789
```

### 2. Contact Email Addresses

**These email addresses appear throughout both documents:**

- `privacy@robotrecruitai.com` - For privacy-related inquiries
- `legal@robotrecruitai.com` - For legal/terms inquiries
- `support@robotrecruitai.com` - For general support

**Action Required:**
1. Create these email addresses or use your existing support email
2. Find and replace throughout the documents with your actual emails

---

## 🔍 Quick Search & Replace Guide

Use your code editor's find-and-replace feature (usually Ctrl+Shift+H or Cmd+Shift+H):

1. **Company Address:**
   - Find: `[Your Company Address]`
   - Replace: Your actual UK address

2. **Companies House Number:**
   - Find: `[Your Companies House Registration Number]`
   - Replace: Your registration number

3. **ICO Registration:**
   - Find: `[Your ICO Registration Number]`
   - Replace: Your ICO number

4. **Email Addresses:** (do these separately if you want different emails)
   - Find: `privacy@robotrecruitai.com`
   - Replace: Your privacy email
   
   - Find: `legal@robotrecruitai.com`
   - Replace: Your legal email
   
   - Find: `support@robotrecruitai.com`
   - Replace: Your support email

---

## 📝 Additional Customization (Optional)

### Date Updates
The "Last Updated" date is currently set to `17 October 2024`. Update this in:
- Line ~9 in each file (look for `Last Updated:`)

### Company Name
If "Robot Recruit AI" needs to be changed:
- Find: `Robot Recruit AI`
- Replace: `[Your Actual Company Name]`

---

## ✅ What's Already Included (You Don't Need to Change These)

### ✓ UK GDPR Compliance
- All required data subject rights (access, erasure, portability, etc.)
- Lawful basis for processing
- Data retention periods
- Security measures
- International data transfer safeguards

### ✓ AI-Specific Legal Coverage
- AI accuracy disclaimers
- No professional advice warnings
- User responsibility for AI-generated content
- Third-party AI provider disclosures (OpenAI)
- AI content intellectual property considerations

### ✓ Service-Specific Terms
- Subscription and billing terms
- Acceptable use policy
- Content restrictions
- Account termination conditions
- Limitation of liability

### ✓ Third-Party Service Disclosure
- OpenAI (AI processing)
- Clerk (Authentication)
- Stripe (Payments)
- Vercel (Hosting)

---

## 🚨 Important Legal Notes

### Before Going Live:

1. **Register with ICO**
   - All UK businesses processing personal data must register with the ICO
   - Visit: https://ico.org.uk/for-organisations/data-protection-fee/
   - Cost: £40-£2,900 per year depending on size/turnover

2. **Companies House Registration**
   - If not already registered, register your company at: https://www.gov.uk/register-a-company-online

3. **Legal Review (Recommended)**
   - While these documents are comprehensive and based on UK law, consider having them reviewed by a UK solicitor
   - Particularly important if you have unique business circumstances

4. **Cookie Consent**
   - You may need to implement a cookie consent banner (not currently included)
   - Required under UK GDPR if using non-essential cookies

---

## 📧 Email Setup Recommendations

### Suggested Email Setup:

1. **Create a dedicated legal/compliance mailbox:**
   ```
   legal@yourdomain.com → forwards to your main business email
   privacy@yourdomain.com → forwards to your main business email
   support@yourdomain.com → your existing support system
   ```

2. **Or use a single email for all:**
   - If you're a small operation, using one email (e.g., `contact@yourdomain.com`) for all legal communications is acceptable
   - Just make sure you check it regularly!

---

## 🔗 Footer Links

Footer links have been automatically added to:
- Main homepage footer (`/`)
- Dashboard footer (`/dashboard` and all protected pages)

Users can access these legal documents from anywhere on your platform.

---

## 📋 Checklist Before Launch

- [ ] Replace `[Your Company Address]` with real address
- [ ] Replace `[Your Companies House Registration Number]`
- [ ] Replace `[Your ICO Registration Number]` (register if not done)
- [ ] Replace `[Your VAT Number if applicable]` or remove line
- [ ] Update all email addresses (privacy@, legal@, support@)
- [ ] Update "Last Updated" date
- [ ] Register with ICO (https://ico.org.uk)
- [ ] Test all footer links work correctly
- [ ] Review documents for accuracy
- [ ] (Optional) Have documents reviewed by UK solicitor
- [ ] (Optional) Implement cookie consent banner

---

## 🆘 Need Help?

### Resources:
- **ICO Guidance:** https://ico.org.uk/for-organisations/guide-to-data-protection/
- **Companies House:** https://www.gov.uk/government/organisations/companies-house
- **UK GDPR Overview:** https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/

### Professional Legal Advice:
Consider consulting a UK solicitor specializing in:
- Technology law
- Data protection
- AI/machine learning legal compliance

---

## ✨ What Makes These Documents Special

1. **AI-Specific Coverage** - Addresses unique legal considerations for AI-generated content
2. **UK GDPR Compliant** - Written for UK data protection laws post-Brexit
3. **OpenAI Integration Disclosure** - Transparent about third-party AI processing
4. **User-Friendly Format** - Clear language with visual warnings for critical sections
5. **Mobile Responsive** - Beautiful, accessible design matching your platform aesthetic

---

## 🎯 Summary

**Minimum Required Actions:**
1. Add your company address (4 files)
2. Add your Companies House registration number (2 files)
3. Add your ICO registration number (1 file)
4. Update email addresses (multiple locations)
5. Register with ICO if not already done

**Estimated Time:** 15-30 minutes

Once these details are filled in, your legal documents will be complete, compliant, and ready for launch! 🚀

