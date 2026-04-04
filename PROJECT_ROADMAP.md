# 🎓 University Equipment Management System - MERN Stack
**Methodology:** Scrum | **UI:** Tailwind CSS + shadcn/ui | **State:** Redux/Context API

---

## 📅 SPRINT 1: Foundation & Core Inventory
**Goal:** Authentication, Role-based Access, and Basic Material CRUD.

| Assignee | Role | Primary Task | AI Prompt Context |
| :--- | :--- | :--- | :--- |
| **Amine** | Backend | JWT Auth & Role Middleware | "Setup Express middleware to protect routes based on 'Admin', 'Student', and 'Tech' roles." |
| **Hadhemi** | Database | User & Equipment Schemas | "Design Mongoose schemas for Users and Equipment with category, status, and unique IDs." |
| **Khalil** | Frontend | Admin Material Management | "Create a React form to Add/Edit equipment with validation and image upload handling." |
| **Yassmine** | Frontend | Student Catalog View | "Build a responsive grid using Tailwind to display all 'Available' equipment with search filters." |
| **Youssef** | Backend | Image Storage & Server Setup | "Configure Multer and Cloudinary to store equipment photos and return URLs to the DB." |

---

## 📅 SPRINT 2: The Booking Engine (Current Focus)
**Goal:** Reservation logic, Availability checking, and Admin Validation.

| Assignee | Role | Primary Task | AI Prompt Context |
| :--- | :--- | :--- | :--- |
| **Amine** | Backend | Availability Logic | "Write a function to check if an equipment ID is already reserved within a specific Date range." |
| **Hadhemi** | Backend | Booking & Approval APIs | "Create POST /reservations and PATCH /reservations/:id/status for Admin approval/rejection." |
| **Khalil** | Frontend | Admin Dashboard (shadcn/ui) | "Build a shadcn/ui Data Table to manage pending requests with 'Validate' and 'Refuse' buttons." |
| **Yassmine** | Frontend | Booking UI (Calendar) | "Integrate a Date-Range picker in React that sends start/end dates to the booking API." |
| **Youssef** | Logic | Penalty & Return System | "Create a cron-job or logic to flag reservations as 'Overdue' if returnDate < Date.now()." |

---

## 📅 SPRINT 3: Maintenance & Final Polish
**Goal:** Technician Interface, User History, and UX Refinement.

| Assignee | Role | Primary Task | AI Prompt Context |
| :--- | :--- | :--- | :--- |
| **Amine** | Fullstack | Student Profile & History | "Create a 'My Bookings' page showing current loans, history, and active penalties." |
| **Hadhemi** | Backend | Maintenance Logs API | "Add an 'InterventionLog' array to the Equipment schema to track repairs by technicians." |
| **Khalil** | Frontend | Admin Stats Dashboard | "Use Chart.js or Recharts to show a bar chart of the most borrowed equipment vs. broken items." |
| **Yassmine** | Frontend | UX Polish & Notifications | "Implement 'react-hot-toast' for all API actions and add loading skeletons for data fetching." |
| **Youssef** | Frontend | Technician Dashboard | "Create a view for the Technician to see 'Broken' items and update status to 'Repaired'." |

---

## 🛠 Global Technical Requirements
1. **Frontend:** Use `axios` for API calls. Use `lucide-react` for icons.
2. **Backend:** Use `dotenv` for secrets. Consistent error handling: `{ error: "Message" }`.
3. **Database:** All Equipment must have a `status` enum: `['Available', 'Reserved', 'Maintenance', 'Broken']`.