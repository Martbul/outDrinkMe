# outDrinkMe

A gamified drinking tracking app with social features, achievements, and leaderboards.  
Track your drinking habits, compete with friends, and unlock achievements!

---

## Features

### Core Functionality
- Daily Tracking: Log your drinking with a hold-to-confirm mechanism  
- Streak System: Build and maintain your drinking streaks  
- Calendar View: Visualize your drinking history  
- Statistics: View detailed stats for week, month, year, and all-time  

### Social Features
- Friend System: Add, discover, and manage friends  
- Leaderboards: Compete on friends and global leaderboards  
- User Profiles: View detailed profiles and stats  
- Discovery: Find new drinking buddies  

### Gamification
- Achievements: 8 unique badges to unlock  
- XP System: Earn 100 XP per drinking day  
- Level Progression: Exponential leveling system (1–20+)  
- Coefficient: Dynamic ranking based on performance  

### User Experience
- Dark Mode: Sleek orange and black theme  
- Smooth Animations: Polished UI/UX  
- Haptic Feedback: Responsive touch interactions  
- Safe Area Support: Optimized for all devices  

---

## Tech Stack

- Framework: React Native (Expo 54)  
- Language: TypeScript 5.9  
- Styling: NativeWind (Tailwind for React Native)  
- Navigation: Expo Router  
- Authentication: Clerk  
- State Management: React Context + Custom Hooks  
- CI/CD: GitHub Actions + EAS Build  

---

## Prerequisites

- Node.js >= 20.0.0  
- npm >= 10.0.0  
- Expo CLI  
- EAS CLI (for builds)  
- Android Studio (for Android development)  
- Xcode (for iOS development, macOS only)  

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/outDrinkMe.git
cd outDrinkMe

# 2. Install dependencies
npm install
# or
make install

# 3. Set up environment variables
cp .env.example .env.development

# Edit with your credentials
# Required variables:
# - EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
# - EXPO_PUBLIC_OUTDRINKME_API_URL

# 4. Start the development server
npm run start:dev
# or
make dev



commands: 
# Development builds (for testing)
eas build --profile development --platform android
eas build --profile development --platform ios

# Preview builds (internal testing)
eas build --profile preview --platform android

# Production builds
eas build --profile production --platform android
eas build --profile production --platform ios

# Submit to stores
eas submit --platform android --profile production
eas submit --platform ios --profile production



    {
        "action": "join_room",
        "username": "Player1",
        "userId": "some-unique-user-id",
        "isHost": false
    }



{
    "action": "game_action",
    "type": "draw_card"
}

{
    "action": "game_action",
    "type": "set_rule",
    "new_rule" :"testing new rule",
}




{
    "action": "game_action",
    "type": "vote_player",
    "targetId": "user_34yuItC85hEk5xAPE9pnVQzgm5q"
}