# ParentGPT Setup Guide
## Complete Installation and Configuration

### Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [API Provider Setup](#api-provider-setup)
5. [Database Setup](#database-setup)
6. [Development Environment](#development-environment)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn/pnpm equivalent)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Development Tools (Recommended)
- **VS Code**: With TypeScript and React extensions
- **React Developer Tools**: Browser extension
- **Supabase CLI**: For database management (optional)

---

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/parentgpt.git
cd parentgpt
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## Environment Configuration

### Basic Configuration (.env)

```bash
# === CORE AI PROVIDERS (Choose one or more) ===

# 1. ANTHROPIC CLAUDE (Highly Recommended)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# 2. DEEPSEEK (Advanced Reasoning)
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 3. GROQ (Lightning Fast)
VITE_GROQ_API_KEY=your_groq_api_key_here

# 4. TOGETHER AI (Best Value)
VITE_TOGETHER_API_KEY=your_together_api_key_here

# === ENHANCED FEATURES ===

# Web Search (Latest Research)
VITE_SERPER_API_KEY=your_serper_api_key_here

# Voice Assistant (Premium TTS)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Virtual Pediatrician (Video AI)
VITE_TAVUS_API_KEY=your_tavus_api_key_here
VITE_TAVUS_REPLICA_ID=your_tavus_replica_id_here

# Database & Tracking
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Configuration Modes

#### **Basic Mode** (No API keys required)
- Comprehensive offline parenting knowledge
- Chat history and sessions
- Basic text-to-speech
- Quick topic buttons
- Dark/light mode

#### **Enhanced Mode** (With AI APIs)
- All basic features
- Advanced AI responses with multiple providers
- Real-time web search for latest research
- Intelligent question categorization
- Context-aware responses

#### **Premium Mode** (With all APIs)
- All enhanced features
- Natural voice conversations (ElevenLabs)
- Virtual pediatrician videos (Tavus)
- Smart tracking & reminders (Supabase)
- Comprehensive wellness monitoring
- Multi-child support

---

## API Provider Setup

### 1. Anthropic Claude (Recommended)

**Why Choose Claude:**
- Best for empathetic, nuanced responses
- Excellent safety-focused guidance
- Superior understanding of family dynamics

**Setup Steps:**
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Add to `.env` as `VITE_ANTHROPIC_API_KEY`

**Pricing:** $5-20/month depending on usage

### 2. DeepSeek (Advanced Reasoning)

**Why Choose DeepSeek:**
- Advanced reasoning for complex problems
- Excellent analytical capabilities
- Competitive pricing

**Setup Steps:**
1. Visit [platform.deepseek.com](https://platform.deepseek.com/)
2. Create account and verify email
3. Go to API Keys section
4. Generate new key
5. Add to `.env` as `VITE_DEEPSEEK_API_KEY`

**Pricing:** $2-10/month

### 3. Groq (Lightning Fast)

**Why Choose Groq:**
- Sub-second response times
- Very cost-effective
- Great for urgent situations

**Setup Steps:**
1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up with GitHub or email
3. Create new API key
4. Add to `.env` as `VITE_GROQ_API_KEY`

**Pricing:** $1-5/month

### 4. Together AI (Best Value)

**Why Choose Together:**
- Multiple models available
- Good value proposition
- Reliable performance

**Setup Steps:**
1. Visit [api.together.xyz](https://api.together.xyz/)
2. Create account
3. Generate API key
4. Add to `.env` as `VITE_TOGETHER_API_KEY`

**Pricing:** $3-15/month

### 5. Serper (Web Search)

**Why Add Serper:**
- Real-time access to latest parenting research
- Trusted source filtering
- Current pediatric guidelines

**Setup Steps:**
1. Visit [serper.dev](https://serper.dev/)
2. Sign up for free account
3. Get API key from dashboard
4. Add to `.env` as `VITE_SERPER_API_KEY`

**Pricing:** Free tier (2,500 searches/month), then $50+/month

### 6. ElevenLabs (Premium Voice)

**Why Add ElevenLabs:**
- Natural, high-quality voice synthesis
- Calming, nurturing voice options
- Professional audio quality

**Setup Steps:**
1. Visit [elevenlabs.io](https://elevenlabs.io/)
2. Create account
3. Go to Profile → API Keys
4. Generate new key
5. Add to `.env` as `VITE_ELEVENLABS_API_KEY`

**Pricing:** Free tier (10,000 characters/month), then $5-22/month

### 7. Tavus (Virtual Pediatrician)

**Why Add Tavus:**
- AI-generated video responses
- Virtual pediatrician avatar
- Interactive medical guidance

**Setup Steps:**
1. Visit [tavus.io](https://tavus.io/)
2. Contact for enterprise access
3. Get API key and replica ID
4. Add to `.env` as `VITE_TAVUS_API_KEY` and `VITE_TAVUS_REPLICA_ID`

**Pricing:** Contact for enterprise pricing

---

## Database Setup

### Supabase Configuration

#### 1. Create Supabase Project
1. Visit [supabase.com](https://supabase.com/)
2. Sign up and create new project
3. Wait for project initialization (2-3 minutes)

#### 2. Get Project Credentials
1. Go to Project Settings → API
2. Copy Project URL and anon public key
3. Add to `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

#### 3. Database Schema Setup

**Option A: Using Supabase Dashboard**
1. Go to SQL Editor in Supabase dashboard
2. Copy and run the schema from `docs/database-schema.sql`

**Option B: Using Migration Files**
1. Install Supabase CLI: `npm install -g supabase`
2. Run: `supabase db reset`

#### 4. Row Level Security (RLS)
The schema automatically enables RLS for all tables. Users can only access their own data.

#### 5. Authentication Setup
```typescript
// The app uses anonymous authentication by default
// Users can optionally create accounts for data persistence
```

---

## Development Environment

### VS Code Setup

#### Recommended Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### Settings Configuration
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Environment Validation

The app automatically validates environment variables on startup:

```typescript
// Check which features are available
console.log('Available AI Providers:', EnhancedAIService.getAvailableProviders());
console.log('Web Search Available:', !!import.meta.env.VITE_SERPER_API_KEY);
console.log('Voice Features Available:', VoiceService.isElevenLabsConfigured());
```

---

## Production Deployment

### Vercel Deployment (Recommended)

#### 1. Prepare for Deployment
```bash
npm run build
```

#### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts to configure project
```

#### 3. Environment Variables in Vercel
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add all environment variables from your `.env` file
3. Redeploy the project

#### 4. Custom Domain (Optional)
1. Go to Domains section in Vercel
2. Add your custom domain
3. Configure DNS settings

### Netlify Deployment

#### 1. Build Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Deploy
1. Connect GitHub repository to Netlify
2. Configure build settings
3. Add environment variables
4. Deploy

### Self-Hosted Deployment

#### 1. Build Application
```bash
npm run build
```

#### 2. Serve Static Files
```bash
# Using serve
npm install -g serve
serve -s dist -l 3000

# Using nginx
# Copy dist/ contents to nginx web root
# Configure nginx for SPA routing
```

#### 3. Environment Variables
Ensure all environment variables are properly set in your hosting environment.

---

## Troubleshooting

### Common Issues

#### 1. **API Keys Not Working**

**Symptoms:**
- "API key not configured" messages
- Offline mode when expecting online features

**Solutions:**
```bash
# Check environment variables are loaded
console.log(import.meta.env.VITE_ANTHROPIC_API_KEY);

# Verify .env file location (should be in project root)
# Restart development server after adding keys
npm run dev
```

#### 2. **Build Errors**

**Symptoms:**
- TypeScript compilation errors
- Missing dependencies

**Solutions:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
npx tsc --noEmit

# Update dependencies
npm update
```

#### 3. **Supabase Connection Issues**

**Symptoms:**
- Database connection errors
- Authentication failures

**Solutions:**
```bash
# Verify Supabase credentials
# Check project URL format: https://xxx.supabase.co
# Ensure anon key is correct (not service role key)

# Test connection
const { data, error } = await supabase.from('user_profiles').select('count');
console.log(data, error);
```

#### 4. **Voice Features Not Working**

**Symptoms:**
- Microphone access denied
- Speech synthesis not working

**Solutions:**
```bash
# Check browser permissions
# Ensure HTTPS in production (required for microphone)
# Test browser compatibility

# Fallback to browser TTS if ElevenLabs fails
VoiceService.speakWithBrowserTTS(text);
```

#### 5. **Performance Issues**

**Symptoms:**
- Slow loading times
- High memory usage

**Solutions:**
```bash
# Enable production build optimizations
npm run build

# Check bundle size
npm run build -- --analyze

# Implement code splitting
const LazyComponent = lazy(() => import('./Component'));
```

### Debug Mode

Enable debug logging:
```typescript
// Add to .env for development
VITE_DEBUG=true

// Check console for detailed logs
console.log('AI Provider Selection:', provider);
console.log('Search Results:', searchData);
console.log('Response Confidence:', confidence);
```

### Getting Help

#### 1. **Check Documentation**
- Review API reference for specific service issues
- Check component documentation for usage examples

#### 2. **Community Support**
- GitHub Issues for bug reports
- Discussions for feature requests
- Stack Overflow for technical questions

#### 3. **Professional Support**
- Enterprise support available for production deployments
- Custom integration assistance
- Performance optimization consulting

---

## Next Steps

After successful setup:

1. **Explore Features**: Try different AI providers and voice features
2. **Customize**: Modify components and styling to match your needs
3. **Integrate**: Add custom tracking or additional APIs
4. **Deploy**: Move to production with your preferred hosting platform
5. **Monitor**: Set up analytics and error tracking
6. **Scale**: Implement caching and performance optimizations

---

*This setup guide provides comprehensive instructions for getting ParentGPT running in any environment. For additional support, please refer to the troubleshooting section or contact our support team.*