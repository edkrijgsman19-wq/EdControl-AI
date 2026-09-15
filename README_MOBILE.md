# EdControl AI - React Native Mobile App

**AI-powered building inspection platform for iOS & Android**

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/edkrijgsman19-wq/EdControl-AI.git
cd EdControl-AI
git checkout react-native-mobile
npm install
```

### 2. Install Expo CLI

```bash
npm install -g expo-cli
```

### 3. Start Developing

```bash
npm start
```

Scan the QR code with your phone (Expo Go app) to see the app live!

## 📱 Features

✅ Photo capture with camera  
✅ Upload PDF & image drawings  
✅ Place inspection pins  
✅ AI component analysis (NEN 2767)  
✅ TCO calculations  
✅ Generate & export reports  

## 🏗️ Build for App Store

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

## 📂 Project Structure

```
.
├── App.jsx           # Main React Native component
├── app.json          # Expo config
├── eas.json          # EAS build config
├── package.json      # Dependencies
└── README_MOBILE.md  # This file
```

## 🔌 Connect Real Backend

Replace the mock AI analysis in `App.jsx` with your API:

```jsx
const response = await fetch(`${process.env.API_URL}/analyze`, {
  method: 'POST',
  body: formData,
});
const result = await response.json();
setAiResult(result);
```

## 📖 Dependencies

- `expo` - Mobile development framework
- `expo-camera` - Camera access
- `expo-image-picker` - File selection
- `expo-file-system` - File management
- `expo-sharing` - Share/export files
- `react-native` - UI framework

## ✅ Ready to Deploy?

1. Create accounts on App Store Connect (iOS) and Google Play Console (Android)
2. Configure bundle IDs in `app.json`
3. Run `npm run build:ios` or `npm run build:android`
4. Upload the builds to your app stores

---

**GitHub Repo:** https://github.com/edkrijgsman19-wq/EdControl-AI
