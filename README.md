# Engineer Point – IT Solution website

Responsive light-theme business website + Supabase admin dashboard.

## Included
- Responsive navigation, animated hero, smooth scrolling and reveal effects.
- Services and per-service enquiry buttons.
- Portfolio gallery with category filters, loaded from Supabase.
- Reviews loaded from Supabase.
- Contact form: validates fields, stores enquiry in Supabase (when configured), opens WhatsApp with a prefilled message.
- Optional EmailJS email notification.
- Google Maps embed and external map link (approximate search link; replace with exact business pin).
- Admin login, project CRUD/image upload, review CRUD/publish controls.
- SEO title, description and Open Graph basics.

## 1. Configure Supabase (new project)
1. Create a project at https://supabase.com/ and wait for provisioning.
2. In Project Settings > API, copy the **Project URL** and **anon/public key**.
3. Edit `assets/js/config.js` and replace `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_ANON_PUBLIC_KEY`.
4. Open Supabase > SQL Editor, create a query, paste all of `supabase/schema.sql`, and run it. This also adds three clearly labeled concept projects and one unpublished review draft. The seed is safe to rerun and will not overwrite admin edits.
5. In Authentication > Providers, keep Email enabled. Disable public sign-ups (or leave sign-up disabled in project settings).
6. In Authentication > Users, add the trusted admin email and set an initial password. The admin login page does not include public registration.
7. Host the site over HTTPS (e.g. Netlify). Test admin login at `/admin/login.html`.

**Security note:** The SQL starter gives all authenticated Supabase users admin write permissions. Therefore, do not allow public registration and only create trusted admin accounts. For multiple roles, replace the simple policies with an explicit admin allow-list/role table before enabling sign-up. Never put a `service_role` key in browser code.

## 2. Configure WhatsApp
In `assets/js/config.js`, set `WHATSAPP_NUMBER` to the business number in international format, digits only, including country code. Example format for India: `919876543210` (no +, spaces or hyphens). The configured number is `919842568247`.

WhatsApp opens with a prefilled message. The visitor must press **Send** in WhatsApp; a website cannot silently send a WhatsApp message.

## 3. Configure EmailJS (optional email notification)
1. Create an account at https://www.emailjs.com/.
2. Add and verify an email service that can deliver to `engineerpoint1988@gmail.com`.
3. Create an email template with these variables:
   - `{{from_name}}`
   - `{{from_email}}`
   - `{{phone}}`
   - `{{service}}`
   - `{{budget}}`
   - `{{message}}`
   - `{{to_email}}`
4. In `assets/js/config.js`, fill `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`. The EmailJS browser SDK and initialization are already included in `index.html` and activate when the public key is set.
5. EmailJS public keys are intended for browser use; configure allowed origins/rate limits in EmailJS. Never expose private keys.
6. Test with a real enquiry and check inbox/spam. WhatsApp opening is independent of email delivery.

## 4. Deploy to Netlify
- Upload/deploy the `engineer-point` folder or connect its Git repository.
- Publish directory: project root.
- No build command is required.
- Use HTTPS and add the production domain to Supabase Auth > URL Configuration > Site URL / Redirect URLs.
- If admin login redirects incorrectly, use the full deployed `/admin/dashboard.html` path.

## 5. Add real portfolio projects and testimonials
- Sign in at `/admin/login.html`.
- The starter portfolio concepts can be edited or deleted in the dashboard; replace them with real projects before presenting them as client work.
- Add project title, category, description, optional project URL, image and publish setting.
- Replace or delete the unpublished review draft. Publish reviews only with genuine customer permission.
- The image bucket is `portfolio-images`; accepted types are JPG, PNG and WebP up to 5 MB.

## 6. Before going live
- Replace demo WhatsApp number.
- Confirm the owner’s preferred public phone number.
- Confirm exact Google Maps pin and update iframe + map button URL in `index.html`.
- Confirm whether all 10 listed services are currently offered.
- Confirm whether the Facebook listing “Annai Medicals” belongs to Engineer Point; it is intentionally not linked.
- Add real project images and approved customer reviews.
- Review address spelling and business hours with the owner.
- Consider adding a privacy policy before collecting personal information.

## Files
- `index.html` – public single-page website
- `assets/css/style.css` – responsive light-theme styles
- `assets/js/config.js` – public configuration placeholders
- `assets/js/main.js` – navigation, animations, portfolio and reviews
- `assets/js/contact.js` – form, Supabase enquiry insert and WhatsApp
- `admin/` – login and content management
- `supabase/schema.sql` – database, RLS policies and storage bucket
