# 🎭 Shift Scheduler

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.4.4-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white" alt="Google Sheets" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</div>

<div align="center">
  <h3>🚀 A modern, intuitive web application for managing comedy show assignments with real-time conflict prevention and persistent state management.</h3>
</div>

---

## ✨ Features

### 🎯 **Smart Assignment Management**
- **Checkbox interface** for assigning hosts and door personnel
- **Real-time conflict prevention** - hosts can't work door duty simultaneously
- **2-person door limit** with intelligent selection controls
- **Persistent state** - assignments save automatically to localStorage

### 📊 **Comprehensive Analytics**
- **Live comedian assignments** tracking with shift counts and hosting breakdown
- **Understaffed show alerts** highlighting missing roles
- **Unassigned personnel** overview for optimal resource allocation
- **Month-based filtering** with dynamic data visualization

### 🔗 **Google Sheets Integration**
- **Real-time data sync** with Google Sheets API
- **Automatic availability parsing** from form responses
- **Multi-venue support** (Stowaway, Citizen venues)
- **Date-intelligent filtering** for different months

### 🎨 **Modern UI/UX**
- **Responsive design** with mobile-first approach (67/33 layout split)
- **Glass-morphism styling** with backdrop blur effects
- **Intuitive color coding** for different assignment states
- **Smooth animations** and hover effects

---

## 🏗️ Architecture

```
Frontend (React/Next.js)
    ↓
Google Sheets API
    ↓ 
Assignment Logic & State
    ↓
localStorage (Persistence)
```

### **Tech Stack**
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with custom glass-morphism components
- **Data**: Google Sheets API integration
- **State**: React hooks with localStorage persistence
- **Deployment**: Vercel with automatic CI/CD

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- Google Cloud Service Account with Sheets API access
- Google Sheets with availability data

### **Installation**

```bash
# Clone the repository
git clone https://github.com/richsarvate/shiftscheduler.git
cd shiftscheduler

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Google Sheets credentials
```

### **Environment Variables**

```bash
GOOGLE_SHEETS_JSON_BASE64=your_base64_encoded_service_account_json
SHEET_ID=your_google_sheets_id
```

### **Development**

```bash
# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### **Production Build**

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📖 Usage

### **1. Select Month**
Choose your target month from the dropdown to filter shows and availability.

### **2. Assign Hosts**
- Select hosts from available personnel who marked "Yes" for hosting
- System prevents double-booking across venues

### **3. Assign Door Personnel**
- Use checkboxes to select up to 2 door people per show
- Host is automatically excluded from door options
- Visual feedback shows selection progress (Selected: Name1, Name2 (2/2))

### **4. Monitor Stats**
- Track individual comedian assignments with format: "Name - X shifts (Y hosting)"
- Identify understaffed shows needing attention
- Review unassigned available personnel

---

## 🎛️ API Reference

### **GET /api/availabilities**
Fetches comedian availability data from Google Sheets.

**Response:**
```json
[
  ["Your name", "Stowaway dates", "Citizen dates", "Can host?"],
  ["John Doe", "Wednesday January 15 2025", "Friday January 17 2025", "Yes"],
  // ... more rows
]
```

---

## 🛠️ Development

### **Project Structure**
```
src/
├── app/
│   ├── page.tsx              # Main application page
│   └── api/
│       └── availabilities/   # Google Sheets API endpoint
├── components/
│   ├── ShowAssignmentTable.tsx    # Main assignment interface
│   └── ComedianStatsSidebar.tsx   # Analytics sidebar
└── lib/
    └── googleSheets.ts       # Google Sheets integration
```

### **Key Components**

#### **ShowAssignmentTable**
- Renders assignment cards for each show
- Handles host/door selection with checkbox interface
- Manages conflict prevention and 2-person limits

#### **ComedianStatsSidebar**
- Displays comedian assignments with shift breakdowns
- Shows understaffed shows with specific missing roles
- Lists unassigned personnel by month

### **State Management**
- React hooks for local state
- localStorage for automatic persistence
- Real-time updates across components

---

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

### **Environment Setup**
1. Create Google Cloud Service Account
2. Enable Google Sheets API
3. Convert service account JSON to base64:
   ```bash
   base64 -i service-account.json
   ```
4. Add environment variables in Vercel dashboard

### **Deploy on Vercel**

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Next.js Team** for the incredible framework
- **Tailwind CSS** for the utility-first styling approach
- **Google Sheets API** for seamless data integration
- **Vercel** for effortless deployment

---

<div align="center">
  <p>Built with ❤️ for comedy scheduling</p>
  <p>
    <a href="https://shiftscheduler.vercel.app">🌐 Live Demo</a> •
    <a href="https://github.com/richsarvate/shiftscheduler/issues">🐛 Report Bug</a> •
    <a href="https://github.com/richsarvate/shiftscheduler/issues">✨ Request Feature</a>
  </p>
</div>

---

<div align="center">
  <sub>⭐ Star this repo if you found it helpful!</sub>
</div>
