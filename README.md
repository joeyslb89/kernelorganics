# Kernel Organics website (static site + Firebase)

Pages: index (with the ingredients section), shop, clinic, story (with the wellbeing section), visit (find us + contact + FAQ), checkout (basket + order form), admin.

The public pages already contain default content, so the site is never empty, even opened straight from the folder. The admin and the forms need a web address (Firebase Hosting, or `npx serve` in this folder).

## Setup (about 15 minutes)
1. Firebase console: create a project. Enable **Firestore**, **Authentication > Email/Password**, and **Storage**.
2. Authentication > Users: add your admin user (email + password).
3. Project settings > Your apps > add a **Web app**, copy the config into `js/firebase-config.js`.
4. Put your admin email in `firestore.rules` and `storage.rules` (replace `YOUR_ADMIN_EMAIL@example.com`), then publish the rules (console, or `firebase deploy --only firestore:rules,storage`).
5. Deploy: `firebase init hosting` (public directory `.`, single-page app: No) then `firebase deploy`. Any static host also works.
6. Open `/admin.html`, sign in, go to **Shop items** (or **Import**) and **Save**: this creates your content in Firestore.

## How it works
- Until Firebase is configured the site shows built-in default content and forms warn that they are not connected.
- Orders go to the `orders` collection (cash on delivery); contact messages and clinic booking requests go to `messages`. Read and manage them in Admin > Orders / Messages & bookings.
- Instagram is a floating button on every page and a footer-free link; it is link-only: handle in Admin > Settings, post tiles (photo + link) in Admin > Instagram.
- Admin edits: shop items, clinic treatments, every page text, Instagram tiles, find-us places, testimonials, ingredients, "free from" list, FAQ, settings (phone, email, address, delivery fee, currency).
- Import from the old site: Admin > Import (paste `Name | Price | Category | Description` lines, then drop the product photos named like the products).

- Pictures: Admin > Pictures & backgrounds lets you replace the main photos, add optional wide banners (Home, Shop, Clinic, Visit) and section backgrounds. Each ingredient has a round icon, or upload a photo to replace it.

## Email notifications (orders, messages, appointment requests)
Each new order emails you (the admin) and the customer; messages and appointment requests email you, and the customer when they gave an email. This uses a Firebase Cloud Function, which needs the **Blaze** (pay-as-you-go) plan; at your volume the cost is normally zero.
1. In the `functions` folder run `npm install` (on Windows PowerShell run commands one per line, without `&&`). The functions run on Node.js 22: `functions/package.json` must say `"node": "22"`, and if `firebase.json` has a `"runtime"` line under `functions`, it must be `"nodejs22"`.
2. `firebase deploy --only functions`. The first time, Firebase asks for: `ADMIN_EMAIL` (where you receive notifications), `SMTP_USER` (the sending address), `SMTP_PASS` (secret) and optionally `SMTP_HOST`/`SMTP_PORT` (default Gmail: smtp.gmail.com / 465).
3. With Gmail, turn on 2-step verification and create an **App password**; use it as `SMTP_PASS`. Any other SMTP service (Brevo, SendGrid, your hosting mailbox) works the same way.
4. Place a test order. If no email arrives, check Firebase console > Functions > Logs.

## Exports
Admin > Orders and Messages & bookings have **CSV** and **Excel** download buttons (all rows currently listed).

## Delivery fees
Admin > Delivery fees: add your areas and a fee for each. Customers pick their area at checkout and the fee is added to the total (and shown in both emails). Admin > Settings: optional "free delivery above" amount, and a flat fee used only when there are no zones. New projects start with two zones at 0: set your real fees before going live.

## If emails do not arrive
1. Admin > Settings > **Send a test email**: it shows the exact error (for example "Invalid login" means the Gmail App password is wrong).
2. Each order and message in the admin shows an email status line (sent, error with the reason, or skipped when the customer gave no email).
3. Fix the secret with `firebase functions:secrets:set SMTP_PASS`, then `firebase deploy --only functions`. Check the spam folder too.

## Delivery rules (by order total)
Admin > Delivery rules: each rule has an area (or All areas), an order-total range (from / up to), and a fee that is a fixed amount, a percentage of the order, or free. Example: under 50 = 4; 50 to 100 = 3%; 100 and over = free. Area-specific rules win over "All areas". If no rule matches, the area's base fee (Delivery areas) is used.

## Admin
`admin.html` is a separate back office (sidebar, no website header). It is not linked from the public site; bookmark it.
