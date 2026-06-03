# Project Overview

This project aims to develop a web administration application. The app will allow users to manage transactions and movements, as well as administer users with different roles. It will be built using technologies like Next.js, React, and TailwindCSS, and will integrate with a Supabase database.

The system is a **Task Management** system — a place where users can create, assign, and complete tasks, with project management, resource allocation, and task progress tracking features.

## Features

- User authentication
- Landing page with a login option
- Sidebar with links to different pages (Inventory, Materials, Users)
- Transaction management with movement visualization and charts
- Master item management with ability to add new ones
- User management with differentiated roles (ADMIN, USER)

## Role Description

- **ADMIN**: Full access to all features, including user management and master item creation.
- **USER**: Access to transaction and master item management, but cannot manage users or create new master items.

# Required Sections

## Landing Page

- A landing page with a login button.

## Sidebar

Once logged in, the system shows a fixed sidebar on the left containing:

- **Personal info**: The logged-in user's photo and name
- **Transactions**: a link to the transactions page. Visible to both ADMIN and USER roles.
- **Masters**: a link to the Masters page. Visible to both ADMIN and USER roles.
- **Users**: a link to the users page. Only visible to ADMIN users.

## Transactions Page

- A dropdown to select the Master to display
- A table showing movements for that Master. The table displays: movement id, date, transaction unit quantity, and the person who executed the movement.
- An **"Add movement"** button that shows a dialog to add an inventory movement. The form includes:
  - A title showing the selected Master
  - The movement type (outgoing or incoming)
  - The quantity of items going out or coming in
  - A cancel button that closes the dialog
  - A create button that creates a movement in the database, recording the currently logged-in user as the responsible party. This button must show a loading state and a success/error message. On success, the dialog closes and the movements table auto-updates.
- A chart showing the daily total balance evolution for the selected Master.

### Additional Rules

- Both USER and ADMIN roles can access the transactions page.
- Both USER and ADMIN roles can create an inventory movement.

## Masters Page

- A table showing the system's Masters. The table displays: material id, Master name, Master balance, and who created the Master.
- An **"Add"** button that shows a dialog to add a Master. The form includes:
  - An input for the Master name
  - The Master's initial balance
  - A cancel button that closes the dialog
  - A create button that creates a Master record, recording the currently logged-in user as the responsible party. This button must show a loading state and a success/error message. On success, the dialog closes and the Masters table auto-updates.

### Additional Rules

- Both USER and ADMIN roles can access the Masters page.
- Only ADMIN users can see the "Create Master" button.

## Users Page

- A table showing the system's users. The table displays: user id, user creation date, user email, and assigned role.
- An **"Edit user"** button that shows a dialog to update the user's role. The form includes:
  - A text showing the email of the user being edited
  - A dropdown with the available roles in the system. It must default to the user's current role.
  - A cancel button that closes the dialog
  - A create button that updates the selected user's role. This button must show a loading state and a success/error message. On success, the dialog closes and the users table auto-updates.

### Additional Rules

- Only ADMIN users can access the users page.

# Grading Criteria

## Design and User Interface (10%)

- Application of design principles for an attractive and functional interface
- Responsive design: must work well on different screen sizes
- 0.05 will be deducted from the grade for each spelling error, up to a maximum of 1 point

## Innovation and Creativity (20%)

- Unique elements in design or functionality
- Implementation of additional features (without going outside the requirements)

## Documentation (10%)

- Project documentation, including a README explaining the project's purpose, how to run it, and any other relevant information
- Internal code documentation through comments to explain logic and design decisions

## Functionality (60%)

- Features according to the instructions
- Functional deployment
