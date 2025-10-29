# Email Templates for EmailJS

ეს დირექტორია შეიცავს HTML email templates რომლებიც გამოიყენება EmailJS-ში.

## Templates

1. **user-thank-you-email.html** - Thank you email რომელიც იგზავნება მომხმარებლისთვის
2. **admin-notification-email.html** - Notification email ადმინისთვის (optional)

## როგორ გამოვიყენოთ EmailJS-ში

### ნაბიჯი 1: Template-ის დამატება EmailJS-ში

1. გადადი https://dashboard.emailjs.com/
2. აირჩიე **Email Templates**
3. იპოვე შენი არსებული template: `template_2tlcpty`
4. დააჭირე **Edit**
5. წაშალე ძველი HTML და ჩასვი `user-thank-you-email.html` ფაილიდან სრული HTML კოდი
6. დააჭირე **Save**

### ნაბიჯი 2: გადაამოწმე Placeholders

დარწმუნდი რომ შემდეგი placeholders არის template-ში:

- `{{to_email}}` - მომხმარებლის email
- `{{to_name}}` - მომხმარებლის სახელი (email-ის პირველი ნაწილი)
- `{{company_name}}` - კომპანიის domain
- `{{industries}}` - არჩეული ინდუსტრიები (comma-separated)
- `{{current_year}}` - მიმდინარე წელი

### ნაბიჯი 3: Test Email-ის გაგზავნა

1. EmailJS Dashboard-ში დააჭირე **Test It**
2. შეავსე test values:
   ```
   to_email: test@example.com
   to_name: test
   company_name: example.com
   industries: Banking And Finance, Education, Manufacturing
   current_year: 2025
   ```
3. დააჭირე **Send Test Email**
4. შეამოწმე email inbox

## Admin Notification Email (Optional)

თუ გინდა რომ ადმინმაც მიიღოს notification ყოველი ახალი request-ის შესახებ:

1. შექმენი ახალი template EmailJS-ში
2. დაარქვი სახელი: `admin_notification`
3. ჩასვი `admin-notification-email.html` კოდი
4. განაახლე `form-validation.js`:

```javascript
const ADMIN_TEMPLATE_ID = 'admin_notification_template_id';

// Send both emails
Promise.all([
    emailjs.send(SERVICE_ID, USER_TEMPLATE_ID, userTemplateParams),
    emailjs.send(SERVICE_ID, ADMIN_TEMPLATE_ID, adminTemplateParams)
])
.then(function(responses) {
    console.log('Both emails sent!');
    // ... rest of success handling
})
.catch(function(error) {
    console.error('Failed to send emails:', error);
    // ... error handling
});
```

## Available Variables

JavaScript-იდან გადადის შემდეგი ინფორმაცია (form-validation.js:60-67):

### User Email Template
```javascript
{
    to_email: 'user@company.com',
    to_name: 'user',
    company_name: 'company.com',
    industries: 'Banking And Finance, Education',
    current_year: 2025,
    'g-recaptcha-response': 'token...'
}
```

### Admin Email Template
```javascript
{
    to_email: 'admin@deteqt.ai',
    user_email: 'user@company.com',
    industries: 'Banking And Finance, Education',
    submission_date: 'January 29, 2025 at 10:30 AM GMT',
    user_domain: 'company.com'
}
```

## Email Template Best Practices

1. **Inline CSS** - ყოველთვის გამოიყენე inline styles, რადგან ბევრი email client არ მხარდაჭერს `<style>` tags
2. **Tables for Layout** - გამოიყენე `<table>` layout-ისთვის (email clients უკეთ მხარდაჭერენ)
3. **Alt Text** - ყოველთვის დაამატე `alt` attribute images-ზე
4. **Test Across Clients** - შეამოწმე სხვადასხვა email client-ზე (Gmail, Outlook, etc.)
5. **Mobile Responsive** - დარწმუნდი რომ კარგად გამოიყურება მობილურზე

## Support

თუ რაიმე პრობლემა გაქვს EmailJS template-ებთან:
- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: https://www.emailjs.com/contact/

---

**Note:** დარწმუნდი რომ შენი EmailJS account-ს აქვს საკმარისი email quota თვიურად.
