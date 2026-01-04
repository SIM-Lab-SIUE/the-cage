
# Required Info and Assets for Equipment App

Here is a comprehensive checklist of all the information and assets the Broadcast Engineers should start collecting. I've broken it down into what's needed for the initial launch and what they'll need for managing the app long-term.

## Phase 1: Needed for Initial App Launch

This is the most critical information needed to build and populate the app. The sooner this is collected, the faster development can proceed.

### 1. The Complete Equipment Inventory (The "Catalog")

This is the most time-consuming task. You'll need a spreadsheet with a separate row for every single piece of equipment that can be checked out. Each row should have the following columns:

-   Item Name: The common name students will see (e.g., "Canon XF100 Camera Kit").
-   Category: (e.g., Camera, Audio, Lighting, Tripod, Accessories).
-   Manufacturer/Model: (e.g., Canon XF100).
-   Unique Asset ID / Serial Number: The most important field. This is the unique identifier the app will use to track each physical item. This is what will be tied to the QR code.
-   Description / Included Items: A short description and a list of everything that comes with it (e.g., "Includes two batteries, charger, lens cap, and carrying case.").
-   High-Quality Photo: A clear, well-lit photo of the item, preferably with a neutral background.

### 2. User Access & Permission Rules

This is the "brains" of the reservation system. You'll need to provide a definitive list that maps equipment to the courses that are allowed to use it.

-   Master List of Production Courses: A simple list of all relevant course codes (e.g., MC204, MC401, MC450).
-   Equipment-to-Course Mapping: A clear breakdown of which courses get access to which equipment. For example:

-   Canon XF605 Kit: MC401, MC450
-   Canon XF100 Kit: MC204
-   Tascam DR-40 Recorder: MC204, MC310, MC401, MC450

### 3. App Content and Wording (The "Copy")

This is all the text that will appear in the app. It's best if this comes from the department to match your tone and policies.

-   Official Equipment Policies: The full text of your checkout rules, late fee policies, and damage liability that students agree to.
-   FAQ Content: Answers to 5-10 frequently asked questions (e.g., "What do I do if I have a problem with the equipment?", "How do I return something after hours?").
-   Contact Information: The official contact info for app support (e.g., Ben & Theresa's emails, office location, and hours).
-   Notification Text (Optional but Recommended): The preferred wording for automated emails like "Your Reservation is Confirmed" and "Your Equipment is Due Tomorrow."

### 4. Branding Assets

-   SIUE / Mass Communications Logos: High-resolution versions of any official logos you want to appear in the app (PNG or SVG files are best).


# Project Blueprint

Version: 1.0 Date: September 10, 2025

This document summarizes the features, rules, and technical specifications for the SIUE Mass Communications Equipment Checkout App, based on all information provided.

## 1. Core User Flow (The Student's Journey)

-   Login: The student logs into the app using their standard SIUE e-ID and password (SSO).
-   First-Time Use: On their first login, the student must enter their basic information (Name, Student ID, Email).
-   Dashboard: The student sees their current and upcoming reservations.
-   Browse & Reserve: The student browses the equipment catalog, finds an available item, selects a reservation block, and confirms their booking.
-   Pickup: The student goes to the equipment cage, where a staff member scans the reservation's QR code to check the item out to them.
-   Return: The student brings the equipment back. A staff member inspects it and uses the app to mark it as "Returned."

## 2. Key App Rules & Logic

The app's backend must enforce the following rules:

-   Reservation Blocks: Reservations are made in fixed blocks (e.g., 9am-2pm). An item is considered unavailable for the entire block, even if returned early.
-   Weekly Limit per Item Type: A student can reserve a maximum of 3 blocks per week for each type of device.
-   Example: A student can have 3 blocks for a camera AND 3 blocks for an audio recorder in the same week. They cannot have 6 blocks for cameras.
-   No Approval Needed: Standard reservations are confirmed instantly without requiring staff approval.
-   Class-Based Restrictions: Access to specific high-end equipment (e.g., Canon XF605) will be restricted. The app must have a system to know which students are in the required advanced classes.
-   Semester Access: A student's access to the reservation system is determined by their course enrollment for the current semester. If a student is not enrolled in a production course, their access should be disabled. Access must be updated each semester.

## 3. Student-Facing Features

### Login:

-   Use SIUE's standard credentialing (SSO).
-   One-time manual entry of profile information.

### Dashboard:

-   View active and upcoming reservations.
-   Quick link to "Make New Reservation."

### Equipment Catalog:

-   Searchable catalog of all equipment.
-   Filter by equipment type (Camera, Audio, etc.).
-   View item availability on a calendar.

### Reservations:

-   Select equipment and a reservation block.
-   Receive a confirmation with a QR code for pickup.
-   Ability to add reservation details to Google/Outlook calendar.

### My Account:

-   View reservation history.
-   See any outstanding fees.

## 4. Staff-Facing Features (Admin Panel)

### Check-in / Check-out:

-   Use a computer with an existing barcode/QR code scanner to manage pickups and returns.

### Fee Management:

-   Manually apply and/or waive fees ($15) for late returns or missed pickups.
-   Mark equipment as "Damaged" and add notes. The app will not process payments directly but will track that a fee is owed.

### Manual Overrides & Special Reservations:

-   Ben and Theresa must have the ability to override standard rules (e.g., block limits, extending reservations). These actions are performed manually by them within the admin panel after direct communication.

### Equipment Management:

-   Add, edit, and remove equipment from the catalog.
-   Track items as a single "kit" unit (e.g., "Camera Kit #1"). Individual components within a kit do not need to be tracked separately upon checkout.
-   Add "a la carte" items to a kit-based checkout.

### User Management:

-   Ability to view student reservation history and fee status.
-   System for managing student access each semester based on course enrollment.

This blueprint provides a clear path forward. Once we have answers on the two discussion points above, we can finalize the technical approach and begin development.
