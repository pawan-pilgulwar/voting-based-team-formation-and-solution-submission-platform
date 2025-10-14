# Voting-Based Team Formation & Solution Submission Platform

A **student-centric platform** for solving real-world technical problem statements proposed by organizations. This platform leverages **AI** to suggest problem statements based on user profiles and automatically forms teams for collaborative coding and solution submissions.

---

## 🌟 Features

- **AI-Based Problem Suggestions**: Suggests problem statements according to student skills, projects, and interests.  
- **Voting System**: Students vote on problem statements; top-voted problems are selected for solution development.  
- **Automatic Team Formation**:
  - Teams form automatically when 6 students vote for the same problem.  
  - The **first voter** becomes the **team leader**.  
  - If the problem is submitted by a student and they vote, they become the team leader.  
- **Collaborative Coding Environment**:
  - **File directory** like GitHub to manage solution files.  
  - **Code editor** supporting multiple programming languages.  
  - **File upload** from device storage.  
  - Save code directly to database.  
- **Team Communication**: Separate chat room for team members.  
- **Mentor Access**:
  - AI suggests problem statements matching mentor profile.  
  - Mentors can join team chat and provide guidance.  
- **Solution Submission**: Team leader submits the final solution for review by the organization.

---

## 🖥️ Live Demo

[View Live Demo](https://student-led-collaboration-platform.vercel.app/)  

*(Replace with your actual deployed link)*

---

## 🛠️ Technology Stack

- **Frontend**: Next.js, TypeScript, TailwindCSS, shadcn/ui  
- **Backend**: Express.js, Node.js  
- **Database**: MongoDB  
- **Code Editor**: Monaco Editor / CodeMirror (supports multiple programming languages)  
- **Authentication**: JWT-based authentication system  

---

## 📂 Project Structure



---

## ⚙️ Installation

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
