# PYQ Search and Download

This project allows users to search for Previous Year Question Papers (PYQs) based on their branch, semester, and year. Users can download the relevant question papers in PDF or DOCX format.

## Features
-  Search PYQs by **branch**, **semester**, and **year**
-  Download question papers in **PDF** or **DOCX**
-  Simple and user-friendly interface

##  Doubt Discussion Feature

- Users can **post their doubts or questions** on a dedicated discussion section.
- Other users can **reply to any post**, enabling peer-to-peer help and discussions.
- The **user who created a post** can also **delete their own post**.
- All routes and actions are **protected using JWT-based authentication** to ensure only authorized users can create, reply, or delete posts.


## Technologies Used
- Node.js
- Express.js
- MongoDB
- EJS


## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/raushan587/pyq-proj.git
   cd pyq-proj

npm install
3. **Create a `.env` file manually:**

   The `.env` file is **not included in the repository** for security reasons.  
   You must **create it manually in the root directory** (where `package.json` is located) and add the following:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/yourdbname
   JWT_SECRET=yourSuperSecretKey


npm start
