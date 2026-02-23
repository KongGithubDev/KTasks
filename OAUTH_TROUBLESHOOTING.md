# Troubleshooting Google OAuth Orgin Mismatch

If you are seeing a `400: origin_mismatch` error on your deployed site, please check the following in your **Google Cloud Console**:

### 1. Check Authorized JavaScript Origins
Ensure the URI is **exactly** as follows (no trailing slash):
`https://ktasks.kongwatcharapong.in.th`

> [!WARNING]
> If you have `https://ktasks.kongwatcharapong.in.th/` (with a `/` at the end), it will fail. Google is very strict about this.

### 2. Verify Client ID Consistency
Make sure the Client ID in your [server/.env](file:///c:/Users/kongw/OneDrive/Documents/PROJECT/KTasks/server/.env) and root [.env](file:///c:/Users/kongw/OneDrive/Documents/PROJECT/KTasks/.env) matches the **exact** Client ID of the credentials you are editing in the console.

### 3. Check for Subdomains
If you are accessing the site via `www.ktasks.kongwatcharapong.in.th`, you **must** add that as another origin:
- `https://www.ktasks.kongwatcharapong.in.th`

### 4. Wait for Propagation
Google sometimes takes **5 - 30 minutes** to update these settings globally. If you just changed them, please wait a bit and try again in an Incognito window.

### 5. Check "Error Details"
When the error page appears, click **"Request Details"** or **"Error Details"**. Look for the `origin` field in the text. Ensure that origin is listed **word-for-word** in your Authorized JavaScript Origins.
