# Vercel AI SDK Template for Next.js

Build and scale AI-powered applications with this Next.js template, which integrates the Vercel AI SDK for streaming, UI components, and React Server Components. Includes a secure, server-side encrypted file vault for user data protection.

![Vercel AI SDK OG Image](https://raw.githubusercontent.com/vercel/ai-sdk/main/packages/core/static/og-image.png)

## Key Features

*   **Vercel AI SDK Integration**: Seamlessly integrated for building advanced, streaming-first AI applications.
*   **Next.js 14 with App Router**: Leverages the latest features of Next.js for optimal performance and developer experience.
*   **Supabase Integration**: Includes user authentication, database management, and server-side utilities.
*   **UI Components**: A rich set of UI components, including charts, data tables, and more, built with Shadcn UI.
*   **AI Chat Interface**: A fully functional chat interface with conversation history and management.
*   **Email & Notifications**: Integrated with Resend for sending transactional emails.
*   **Tool-Using AI**: Example implementation of an AI that can use tools (e.g., search).
*   **Server-Side Encrypted Vault**: AES-256-GCM file encryption managed entirely on the backend with secure key wrapping using PBKDF2.

## Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/)
*   **AI**: [Vercel AI SDK](https://sdk.vercel.ai/docs)
*   **Database**: [Supabase](https://supabase.com/)
*   **UI**: [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
*   **Email**: [Resend](https://resend.com/)
*   **LLM Provider**: [OpenAI](https://openai.com/), [Google Gemini](https://makersuite.google.com/)
*   **Search Provider**: [Tavily](https://tavily.ai/)


## Getting Started

Follow these steps to set up and run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/CubeStar1/ai-sdk-template.git
cd ai-sdk-template
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase Database

- Create a new Supabase project at [Supabase](https://supabase.com/).
- Copy the migration file contents from `lib/supabase/migrations` to your Supabase project SQL editor.
- Run the migrations.
- Get the Supabase URL, anon key, and admin key from your Supabase project settings.

### 4. Set Up Environment Variables

Create a `.env` file in the root of the project and add the following environment variables. You will need to get these keys from their respective services.

```bash
cp env.example .env
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
NEXT_PUBLIC_SUPABASE_ADMIN=<your_supabase_admin_key>

# Resend
NEXT_PUBLIC_RESEND_API_KEY=<your_resend_api_key>
NEXT_PUBLIC_RESEND_DOMAIN=<your_resend_domain>

# App
NEXT_PUBLIC_APP_NAME="AI SDK Template"
NEXT_PUBLIC_APP_ICON='/next.svg'

# AI
NEXT_PUBLIC_GEMINI_API_KEY=<your_gemini_api_key>
NEXT_PUBLIC_GOOGLE_API_KEY=<your_google_api_key>


# OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=<your_openai_api_key>

# Tavily
NEXT_PUBLIC_TAVILY_API_KEY=<your_tavily_api_key>

# Ragie
NEXT_PUBLIC_RAGIE_API_KEY=<your_ragie_api_key>


```

### 5. Run the Development Server

```bash
npm run dev
```

### 5. Configure Vault Encryption (Optional)

If you plan to use the encrypted vault feature, ensure the `VAULT_ENCRYPTION_SECRET` environment variable is set:

```env
# Vault Encryption (defaults to Supabase service role key if not set)
VAULT_ENCRYPTION_SECRET=<your_strong_encryption_secret>
```

**Note:** For production deployments, **always** set an explicit `VAULT_ENCRYPTION_SECRET` instead of relying on the Supabase service role key fallback.

### 6. Run the Development Server

```bash
npm run dev
```

### 7. Open the Application

Open your web browser and navigate to `http://localhost:3000` to view the application.

---

## Encrypted File Vault

The application includes a server-side encrypted file vault for securely storing user files. All encryption happens on the backend, and users only see upload/download progress indicators.

### Architecture

The vault uses a three-layer encryption and key management system:

1. **File Encryption Layer**: AES-256-GCM symmetric encryption
   - Generates a random 256-bit encryption key for each file
   - Encrypts the file with AES-256-GCM and a random IV
   - Stores encrypted blob in Supabase Storage

2. **Key Wrapping Layer**: AES-KW (NIST Key Wrap) symmetric key wrapping
   - The encryption key is wrapped with a derived wrapping key
   - Prevents direct access to encryption keys even if the database is compromised

3. **Secret Derivation Layer**: PBKDF2 key derivation
   - Derives the wrapping key from the server's master secret (`VAULT_ENCRYPTION_SECRET`)
   - Uses 600,000 iterations and SHA-256 for security

### Data Flow

#### Upload

```
User selects file
    ↓
Client sends to POST /api/vault/upload
    ↓
Server generates random AES-256-GCM key
    ↓
Server encrypts file with AES-256-GCM
    ↓
Server wraps encryption key with derived wrapping key
    ↓
Server stores encrypted blob in Supabase Storage
    ↓
Server stores file metadata (wrapped key, IV, salt) in database
    ↓
Client receives success response with file ID
```

#### Download

```
User clicks download
    ↓
Client fetches from GET /api/vault/[id]/download
    ↓
Server retrieves encrypted blob from Supabase Storage
    ↓
Server retrieves metadata (wrapped key, IV, salt) from database
    ↓
Server unwraps encryption key using derived wrapping key
    ↓
Server decrypts blob with AES-256-GCM
    ↓
Client receives plaintext file blob
    ↓
Browser downloads file
```

### Security Properties

- **Encryption in Transit**: All API endpoints use HTTPS in production
- **Encryption at Rest**: Files are encrypted with AES-256-GCM before storage
- **Key Isolation**: Each file uses a unique encryption key
- **Secure Key Wrapping**: Encryption keys are wrapped with a derived wrapping key
- **No Client-Side Secrets**: Users never handle encryption keys or passwords
- **Authentication Required**: All vault operations require Supabase session authentication
- **Server-Side Key Management**: Master encryption secret never leaves the server

### Implementation Details

**Backend Crypto Helper** (`lib/vault-crypto.ts`)
- `generateEncryptionKey()`: Creates random AES-256-GCM key
- `deriveWrappingKey(secret, salt)`: PBKDF2 key derivation (600K iterations, SHA-256)
- `wrapKey(plaintext, secret)`: AES-KW wraps the encryption key
- `unwrapKey(wrapped, secret)`: AES-KW unwraps to retrieve encryption key
- `encryptBuffer(data, key, iv)`: AES-256-GCM encryption
- `decryptBuffer(data, key, iv)`: AES-256-GCM decryption

**Upload API** (`app/api/vault/upload/route.ts`)
- Receives multipart FormData with file
- Authenticates user via Supabase session
- Generates encryption key and encrypts file
- Wraps key and stores encrypted blob + metadata
- Returns file record ID

**Download API** (`app/api/vault/[id]/download/route.ts`)
- Authenticates user via Supabase session
- Retrieves file metadata and encrypted blob
- Unwraps and decrypts file server-side
- Returns plaintext file blob to client

**UI Components**
- `components/vault/FileUpload.tsx`: File selection and upload UI
- `components/vault/FileList.tsx`: Displays uploaded files with download capability

### Database Schema

The vault uses the `encrypted_files` table with the following structure:

```sql
CREATE TABLE encrypted_files (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  filename VARCHAR(255),
  size INTEGER,
  wrapped_key BYTEA,
  iv BYTEA,
  salt BYTEA,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

### Environment Variables Reference

See `env.example` for all available environment variables and their descriptions.

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.