
# LivDaily Authentication Guide

## 📱 Current Authentication Setup

LivDaily uses **Better Auth** for authentication with the following features:

### ✅ **Working Authentication Methods:**

1. **Email/Password Authentication**
   - Users can create accounts with email and password
   - Sign up creates a new account
   - Sign in authenticates existing users
   - Passwords are securely hashed on the backend

### ⚠️ **Social Authentication (Requires Setup):**

2. **Google OAuth** - Not yet configured
3. **Apple Sign-In** - Not yet configured (iOS only)

---

## 🔐 How to Use the App (For Users)

### **Creating a New Account:**
1. Open the app and tap "Sign Up"
2. Enter your email address
3. Create a password (at least 8 characters)
4. Optionally enter your name
5. Tap "Sign Up" button
6. You'll be automatically signed in and redirected to your profile

### **Signing In:**
1. Open the app
2. Enter your email and password
3. Tap "Sign In"
4. You'll be redirected to your profile

### **Why isn't Google Sign-In working?**
Google OAuth requires additional configuration:
- OAuth credentials from Google Cloud Console
- Authorized redirect URIs
- Backend environment variables

For now, please use email/password authentication.

---

## 🛠️ Setting Up Google OAuth (For Developers)

To enable Google sign-in, you need to:

### 1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://ay2em9m26g82xd73zxnjvyw7bv8knh59.app.specular.dev/api/auth/callback/google`
     - `http://localhost:8082/api/auth/callback/google` (for development)
   - Copy the Client ID and Client Secret

### 2. **Configure Backend Environment Variables:**
   The backend needs these environment variables set:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### 3. **Update Backend Configuration:**
   The backend Better Auth configuration should include:
   ```typescript
   socialProviders: {
     google: {
       clientId: process.env.GOOGLE_CLIENT_ID,
       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
     }
   }
   ```

### 4. **Test the Integration:**
   - Restart the backend after adding environment variables
   - Try signing in with Google from the app
   - Check backend logs for any errors

---

## 🔍 Troubleshooting

### **"Invalid email or password" error:**
- Make sure you're using the correct credentials
- If you haven't created an account yet, tap "Sign Up" first

### **"Account not found" error:**
- You need to create an account first
- Tap "Don't have an account? Sign Up"

### **"Account already exists" error:**
- An account with this email already exists
- Use "Sign In" instead of "Sign Up"

### **Google button shows "Setup Required":**
- Google OAuth is not configured yet
- Use email/password authentication instead

### **App shows 401 Unauthorized errors:**
- You need to sign in first
- The app requires authentication to access features
- Go to the auth screen and sign in or create an account

---

## 📊 Backend API Endpoints

The authentication system uses these endpoints:

- `POST /api/auth/sign-in/email` - Email/password sign in
- `POST /api/auth/sign-up/email` - Email/password sign up
- `GET /api/auth/get-session` - Get current user session
- `POST /api/auth/sign-out` - Sign out current user
- `GET /api/auth/callback/google` - Google OAuth callback (requires setup)
- `GET /api/auth/callback/apple` - Apple OAuth callback (requires setup)

---

## 💡 Tips for Users

1. **Use a strong password** - At least 8 characters with a mix of letters and numbers
2. **Remember your credentials** - There's no password reset yet (coming soon)
3. **Email/password is the most reliable** - Social sign-in requires additional setup
4. **Check the help box** - The auth screen has helpful tips at the bottom

---

## 🚀 Future Enhancements

Planned authentication features:
- Password reset via email
- Email verification
- Two-factor authentication (2FA)
- More social providers (GitHub, Facebook)
- Biometric authentication (Face ID, Touch ID)
