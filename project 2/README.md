# ParentGPT - Enhanced AI Parenting Assistant

Smart AI parenting assistant with **dual-mode capabilities**: comprehensive offline knowledge + enhanced online features with web search and advanced AI.

## 🚀 Quick Start

1. **Install**: `npm install`
2. **Run**: `npm run dev`
3. **Chat**: Open http://localhost:5173 and start asking questions!

## ✨ Features

### 🤖 **Dual AI Modes**

#### 📚 **Offline Mode** (Always Available)
- Comprehensive built-in parenting knowledge
- Child development milestones and guidance
- Sleep training, feeding, and behavior advice
- Safety recommendations and emergency protocols
- No API keys required - works immediately

#### 🌐 **Online Mode** (With API Keys)
- **Real-time web search** via Serper API
- **Enhanced AI responses** via DeepSeek API
- Latest parenting research and trends
- Current pediatric guidelines
- Advanced reasoning and personalized advice

### 🎯 **Core Features**
- **No authentication** - start chatting immediately
- **Voice responses** - click "Listen" to hear advice
- **Emergency guidance** - recognizes urgent situations
- **Age-appropriate advice** - adapts to your questions
- **Category tagging** - organized topic responses
- **Quick topic buttons** - common parenting concerns

## 🔧 API Setup (Optional - For Enhanced Features)

### 1. Get API Keys

#### Serper API (Web Search)
- Visit [serper.dev](https://serper.dev/)
- **Free tier**: 2,500 searches/month
- Provides real-time access to latest parenting research

#### DeepSeek API (Enhanced AI)
- Visit [platform.deepseek.com](https://platform.deepseek.com/)
- Competitive pricing with high-quality responses
- Advanced reasoning for complex parenting questions

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Environment Variables
```env
VITE_SERPER_API_KEY=your_serper_api_key_here
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

## 📱 Usage Examples

### Offline Mode Capabilities
- "How do I help my toddler sleep better?"
- "My 2-year-old is having tantrums, what should I do?"
- "When should I start potty training?"
- "What are normal developmental milestones for a 1-year-old?"

### Enhanced Online Mode
- "What are the latest sleep training methods for 2024?"
- "Recent research on screen time for toddlers"
- "Current AAP guidelines for infant nutrition"
- "Latest studies on early childhood development"

## 🧠 Knowledge Areas

### Comprehensive Coverage
- **Sleep & Bedtime** - Training, regressions, age-specific guidance
- **Behavior & Discipline** - Positive parenting, tantrums, boundaries
- **Feeding & Nutrition** - Breastfeeding, solids, picky eating
- **Development & Milestones** - Normal ranges, red flags, support
- **Health & Safety** - When to call doctor, emergency guidance
- **Potty Training** - Readiness, methods, troubleshooting
- **Screen Time** - Age-appropriate guidelines, quality content
- **School Readiness** - Academic and social preparation
- **Sibling Relationships** - Managing rivalry, new baby prep
- **Special Needs** - Early intervention, support strategies

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel with environment variables
```

### Netlify
```bash
npm run build
# Deploy dist folder to Netlify
```

### Environment Variables in Production
Add your API keys to your hosting platform's environment variables section.

## 🛠 Tech Stack

- **React + TypeScript** - Modern UI framework
- **Tailwind CSS** - Beautiful, responsive styling
- **Serper API** - Real-time web search capabilities
- **DeepSeek API** - Advanced AI reasoning and responses
- **Vite** - Fast development and building
- **Lucide React** - Beautiful icons

## 🔍 How It Works

### Intelligent Response Generation
1. **Question Analysis** - Categorizes and determines urgency
2. **Web Search** (if online) - Finds latest research and guidelines
3. **AI Enhancement** (if online) - DeepSeek processes with context
4. **Fallback Protection** - Always works with offline knowledge

### Smart Features
- **Trusted Source Filtering** - Prioritizes medical and educational sites
- **Emergency Detection** - Immediate safety guidance
- **Age-Specific Responses** - Adapts advice to developmental stages
- **Context Awareness** - Remembers conversation flow

## 💡 Perfect For

- **Parents** - Get instant, reliable parenting advice
- **Healthcare Providers** - Quick reference for common questions
- **Educators** - Child development insights
- **Caregivers** - Comprehensive guidance resource

## 🔒 Privacy & Safety

- **No data collection** - Everything stays in your browser
- **No accounts required** - Completely anonymous usage
- **API calls only when enabled** - You control data usage
- **Safety-first responses** - Always prioritizes child wellbeing
- **Trusted sources** - Filters for medical and educational content

## 🆘 Emergency Guidance

The app recognizes emergency situations and provides:
- Immediate action steps
- Emergency contact numbers
- When to call 911 vs. pediatrician
- Poison control information
- Safety protocols

---

**Ready to support parents everywhere! 🍼👶**

*Built with ❤️ for families who want the best guidance for their children.*