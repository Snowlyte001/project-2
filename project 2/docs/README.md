# Project Structure

```
parentgpt/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # React entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json         # Dependencies
├── vercel.json         # Vercel deployment config
└── README.md           # Project documentation
```

## Features

- **No Authentication Required** - Jump straight into using the AI
- **Personalized Responses** - AI adapts to your child's age and family situation
- **Voice Playback** - Listen to AI responses with text-to-speech
- **Responsive Design** - Works on desktop and mobile
- **Easy Deployment** - Ready for Vercel or XAMPP

## Development

The app uses a simple in-memory state management. All data is stored locally in the browser session.

For production use, you can later add:
- User authentication
- Database storage
- Email notifications
- Advanced AI integration