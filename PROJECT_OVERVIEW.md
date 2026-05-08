# FormBuilder Pro - Project Overview

## 📋 Table of Contents
1. [Project Description](#project-description)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Technology Stack](#technology-stack)
5. [Key Features](#key-features)
6. [Data Flow](#data-flow)
7. [Component Architecture](#component-architecture)
8. [Services & Utilities](#services--utilities)
9. [Authentication Flow](#authentication-flow)
10. [Form Building Flow](#form-building-flow)
11. [File Upload & Validation](#file-upload--validation)
12. [Logging System](#logging-system)

---

## Project Description

**FormBuilder Pro** is a modern, full-featured form builder application that allows users to:
- Create dynamic forms with multiple field types
- Design form layouts with responsive grid system
- Manage form submissions and responses
- Validate user inputs with custom regex patterns
- Handle file uploads with type restrictions
- Preview forms before publishing

The application is built with React, TypeScript, and Tailwind CSS, providing a professional UI/UX experience.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Router (React Router v7)                │   │
│  │  - /login (Public)                                   │   │
│  │  - / (Dashboard - Protected)                         │   │
│  │  - /admin/builder/:id (Builder - Protected)          │   │
│  │  - /admin/form/:formId (Form Detail - Protected)     │   │
│  │  - /submit/:id (Public Form Submission)              │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Protected Route Wrapper                    │   │
│  │  - Checks authentication status                      │   │
│  │  - Redirects to login if not authenticated           │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Pages & Components                           │   │
│  │  - Admin Pages (Dashboard, Builder, FormDetail)      │   │
│  │  - Public Pages (SubmitForm)                         │   │
│  │  - Shared Components (FieldInput, FormGrid)          │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Services Layer                               │   │
│  │  - API Communication (axios)                         │   │
│  │  - Authentication                                    │   │
│  │  - Form Management                                   │   │
│  │  - Submission Handling                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Backend API                                  │   │
│  │  - https://dev-xavia.xaviasolutions.com:3066/api/    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
src/
├── assets/                          # Static assets
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
│
├── components/                      # React components
│   ├── FieldComponents/             # Field type components
│   │   ├── TextFieldComponent.tsx
│   │   ├── NumberFieldComponent.tsx
│   │   ├── DropdownFieldComponent.tsx
│   │   ├── FileFieldComponent.tsx
│   │   ├── RadioFieldComponent.tsx
│   │   ├── CheckboxFieldComponent.tsx
│   │   ├── DualInputFieldComponent.tsx
│   │   └── index.ts
│   │
│   ├── shared/                      # Shared components
│   │   ├── FieldInput.tsx           # Centralized field renderer
│   │   ├── FormGrid.tsx             # Responsive grid layout
│   │   ├── ErrorBoundary.tsx        # Error handling
│   │   ├── LoadingSkeleton.tsx      # Loading state
│   │   └── index.ts
│   │
│   ├── FieldEditorModal.tsx         # Edit field properties
│   ├── FieldPalette.tsx             # Available field types
│   ├── FieldPropertiesPanel.tsx     # Field configuration panel
│   ├── FormCanvas.tsx               # Main form builder canvas
│   ├── FormCreationModal.tsx        # Create new form
│   ├── FormFieldPreview.tsx         # Preview single field
│   ├── FormJsonView.tsx             # JSON representation
│   ├── FormPreview.tsx              # Form preview
│   ├── Navbar.tsx                   # Navigation bar
│   ├── ProtectedRoute.tsx           # Route protection
│   ├── SubFormManager.tsx           # Sub-form management
│   └── ...
│
├── constants/                       # Global constants
│   └── index.ts                     # Field types, file types, regex patterns
│
├── hooks/                           # Custom React hooks
│   ├── useAuth.ts                   # Authentication hook
│   ├── useFormBuilder.ts            # Form builder state
│   ├── useFormLoader.ts             # Form loading
│   ├── useFormState.ts              # Form state management
│   ├── useFormSync.ts               # Form synchronization
│   ├── useToast.ts                  # Toast notifications
│   └── index.ts
│
├── pages/                           # Page components
│   ├── Admin/
│   │   ├── Builder.tsx              # Form builder page
│   │   ├── Dashboard.tsx            # Admin dashboard
│   │   ├── FormDetail.tsx           # Form details page
│   │   └── SubFormSetup.tsx         # Sub-form setup
│   │
│   ├── Auth/
│   │   └── Login.tsx                # Login page
│   │
│   ├── Public/
│   │   └── SubmitForm.tsx           # Public form submission
│   │
│   └── NotFound.tsx                 # 404 page
│
├── services/                        # API & business logic
│   ├── auth.service.ts              # Authentication API
│   ├── axios.ts                     # Axios configuration
│   ├── customPattern.service.ts     # Custom regex patterns
│   ├── endpoints.ts                 # API endpoints
│   ├── form.service.ts              # Form API
│   ├── storage.service.ts           # Local storage
│   └── submission.service.ts        # Submission API
│
├── types/                           # TypeScript types
│   └── form.ts                      # Form-related types
│
├── utils/                           # Utility functions
│   ├── fileValidation.ts            # File validation & logging
│   ├── fieldLayout.ts               # Field layout utilities
│   ├── form.ts                      # Form utilities
│   ├── validation-engine.ts         # Validation logic
│   ├── errors.ts                    # Error handling
│   ├── toast.ts                     # Toast utilities
│   └── index.ts
│
├── App.tsx                          # Main app component
├── App.css                          # App styles
├── main.tsx                         # Entry point
└── index.css                        # Global styles
```

---

## Technology Stack

### Frontend Framework
- **React 19.2.5** - UI library
- **TypeScript 6.0.2** - Type safety
- **React Router 7.14.2** - Client-side routing

### Styling
- **Tailwind CSS 4.2.4** - Utility-first CSS
- **PostCSS 8.5.12** - CSS processing
- **Autoprefixer 10.5.0** - Browser compatibility

### HTTP Client
- **Axios 1.15.2** - API communication

### Icons
- **Lucide React 1.11.0** - Icon library

### Build Tools
- **Vite 7.0.0** - Build tool & dev server
- **@vitejs/plugin-react 4.7.0** - React plugin

### Development Tools
- **ESLint 10.2.1** - Code linting
- **TypeScript ESLint 8.58.2** - TS linting

---

## Key Features

### 1. **Form Builder**
- Drag-and-drop interface for adding fields
- Multiple field types (text, number, dropdown, file, radio, checkbox, dual-input)
- Responsive grid layout (1/4, 1/2, 3/4, full width)
- Field validation with custom regex patterns
- Sub-form support for organizing fields

### 2. **Field Types**
- **Text Input** - Single line text with validation
- **Number Input** - Numeric values with min/max
- **Dropdown** - Select from predefined options
- **File Upload** - With type restrictions (PDF, Excel, Images, etc.)
- **Radio Buttons** - Single selection from options
- **Checkboxes** - Multiple selections
- **Dual Input** - Two related inputs (e.g., Min/Max)

### 3. **File Upload Management**
- Restrict uploads to specific file types
- Validate file format before upload
- Support for: PDF, CSV, XLSX, XLS, JPG, JPEG, PNG, GIF, DOC, DOCX, TXT
- Real-time validation with user-friendly error messages

### 4. **Form Validation**
- Built-in regex patterns (email, phone, URL, etc.)
- Custom regex pattern support
- Save custom patterns for reuse
- Min/max length validation for text
- Min/max value validation for numbers
- Required field validation

### 5. **Authentication**
- Login with email and password
- JWT token-based authentication
- Protected routes
- Auto-logout on token expiration
- Local storage for user data

### 6. **Form Management**
- Create, read, update, delete forms
- Draft and published status
- Form preview before publishing
- JSON representation of forms
- Form submission tracking

---

## Data Flow

### 1. **User Authentication Flow**
```
User Login
    ↓
Login Page (src/pages/Auth/Login.tsx)
    ↓
AuthService.login() (src/services/auth.service.ts)
    ↓
API Call: POST /users/v1/admin-login
    ↓
Store Token & User Data (localStorage)
    ↓
Redirect to Dashboard
```

### 2. **Form Creation Flow**
```
Click "Create Form"
    ↓
FormCreationModal (src/components/FormCreationModal.tsx)
    ↓
User enters form name
    ↓
FormService.createForm() (src/services/form.service.ts)
    ↓
API Call: POST /api/forms
    ↓
Redirect to Builder
```

### 3. **Form Building Flow**
```
Builder Page (src/pages/Admin/Builder.tsx)
    ↓
useFormBuilder Hook (src/hooks/useFormBuilder.ts)
    ↓
User adds fields from FieldPalette
    ↓
Fields stored in state
    ↓
User configures field properties
    ↓
FieldPropertiesPanel (src/components/FieldPropertiesPanel.tsx)
    ↓
User saves form
    ↓
FormService.updateForm() (src/services/form.service.ts)
    ↓
API Call: PUT /api/forms/:id
```

### 4. **Form Submission Flow**
```
Public Form Page (src/pages/Public/SubmitForm.tsx)
    ↓
User fills form fields
    ↓
FieldInput Component (src/components/shared/FieldInput.tsx)
    ↓
Validation Engine (src/utils/validation-engine.ts)
    ↓
User clicks Submit
    ↓
SubmissionService.submit() (src/services/submission.service.ts)
    ↓
API Call: POST /api/forms/:formId/submissions
    ↓
Success Message & Redirect
```

---

## Component Architecture

### Page Components

#### **Dashboard** (`src/pages/Admin/Dashboard.tsx`)
- Lists all forms created by user
- Shows form statistics
- Options to edit, delete, or view submissions
- Create new form button

#### **Builder** (`src/pages/Admin/Builder.tsx`)
- Main form building interface
- Canvas for form layout
- Field palette for adding fields
- Properties panel for field configuration
- Preview tab for testing form

#### **FormDetail** (`src/pages/Admin/FormDetail.tsx`)
- View form details
- Manage form settings
- View form submissions
- Export form data

#### **SubmitForm** (`src/pages/Public/SubmitForm.tsx`)
- Public form submission page
- Displays form fields
- Handles form validation
- Submits data to backend
- Shows success message

### Shared Components

#### **FieldInput** (`src/components/shared/FieldInput.tsx`)
- Centralized field renderer for all field types
- Handles input changes with logging
- Displays validation errors
- Supports file upload with type validation
- Used by both Builder and SubmitForm

#### **FormGrid** (`src/components/shared/FormGrid.tsx`)
- Responsive grid layout system
- Supports 1/4, 1/2, 3/4, full width columns
- Handles field positioning
- Responsive on mobile devices

#### **ErrorBoundary** (`src/components/shared/ErrorBoundary.tsx`)
- Catches React errors
- Displays error UI
- Prevents app crashes

---

## Services & Utilities

### Services

#### **AuthService** (`src/services/auth.service.ts`)
```typescript
- login(payload): Promise<AuthUser>
- logout(): void
- getToken(): string | null
- getUser(): AuthUser | null
- isAuthenticated(): boolean
```

#### **FormService** (`src/services/form.service.ts`)
```typescript
- getAllForms(): Promise<FormSchema[]>
- getFormById(id): Promise<FormSchema>
- createForm(data): Promise<FormSchema>
- updateForm(id, data): Promise<FormSchema>
- deleteForm(id): Promise<void>
```

#### **SubmissionService** (`src/services/submission.service.ts`)
```typescript
- submitForm(formId, data): Promise<Submission>
- getSubmissions(formId): Promise<Submission[]>
```

### Utilities

#### **fileValidation.ts** (`src/utils/fileValidation.ts`)
Global utility functions for file handling and logging:
- `getAcceptAttribute()` - Generate file input accept attribute
- `isValidFileType()` - Validate file type
- `validateAndLogFile()` - Complete validation with logging
- `logFieldInput()` - Log field changes
- `logFormSubmission()` - Log form submission
- `showFileValidationError()` - Show error alerts

#### **validation-engine.ts** (`src/utils/validation-engine.ts`)
- `validateField()` - Validate single field
- `validateForm()` - Validate entire form
- `isValidRegexPattern()` - Check regex validity

#### **form.ts** (`src/utils/form.ts`)
- `generateId()` - Generate unique field IDs
- `getFieldLayout()` - Calculate field positions

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                   App Component                          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  Check AuthService.isAuthenticated()                    │
│  - If true: Show protected routes                       │
│  - If false: Show login page                            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  ProtectedRoute Component                               │
│  - Wraps all admin routes                               │
│  - Redirects to login if not authenticated              │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  Layout Component                                       │
│  - Shows Navbar                                         │
│  - Renders page content                                 │
└─────────────────────────────────────────────────────────┘
```

### Token Management
- Token stored in `localStorage` with key `auth_token`
- User data stored in `localStorage` with key `auth_user`
- Axios interceptor automatically adds token to requests
- Auto-logout on 401 response (token expired)

---

## Form Building Flow

```
┌──────────────────────────────────────────────────────────┐
│              Builder Page                                │
│  - useFormBuilder Hook manages state                     │
│  - useFormSync Hook syncs with backend                   │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  FormCanvas Component                                    │
│  - Displays form fields                                  │
│  - Handles drag-and-drop                                 │
│  - Shows field preview                                   │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  FieldPalette Component                                  │
│  - Lists available field types                           │
│  - User clicks to add field                              │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  New Field Added to Canvas                               │
│  - Field ID generated                                    │
│  - Default properties set                                │
│  - Field selected for editing                            │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  FieldPropertiesPanel Component                          │
│  - Shows field configuration options                     │
│  - User edits label, placeholder, validation, etc.       │
│  - Changes saved to state in real-time                   │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  FormPreview Tab                                         │
│  - Shows how form looks to users                         │
│  - Test form submission                                  │
│  - View console logs for debugging                       │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  Save Form                                               │
│  - FormService.updateForm()                              │
│  - API Call: PUT /api/forms/:id                          │
│  - Form saved to backend                                 │
└──────────────────────────────────────────────────────────┘
```

---

## File Upload & Validation

### File Type Support
```
Supported Formats:
├── Documents
│   ├── PDF (.pdf)
│   ├── Word (.doc, .docx)
│   └── Text (.txt)
├── Spreadsheets
│   ├── CSV (.csv)
│   ├── Excel (.xlsx, .xls)
├── Images
│   ├── JPG (.jpg, .jpeg)
│   ├── PNG (.png)
│   └── GIF (.gif)
```

### Validation Process
```
User Selects File
    ↓
Browser File Picker (filtered by accept attribute)
    ↓
File Selected
    ↓
validateAndLogFile() (src/utils/fileValidation.ts)
    ↓
Check file extension
    ↓
Check MIME type
    ↓
If Valid:
  - Log success to console
  - Update form state
  - Show file name
    ↓
If Invalid:
  - Log error to console
  - Show alert to user
  - Clear file input
  - User must select correct format
```

### Console Logging
```
✓ Success:
  ✓ Field: "Document" (field-123) - File: "resume.pdf" (application/pdf)

✗ Error:
  ❌ Invalid file type! Field "Document" only accepts: PDF
     You selected: PNG format
```

---

## Logging System

### Global Logging Utilities (`src/utils/fileValidation.ts`)

#### Field Input Logging
```typescript
logFieldInput(fieldLabel, fieldId, value)
// Output: Field: "Email" (field-123) - Value: "user@example.com"
```

#### File Upload Logging
```typescript
logFileInput(fieldLabel, fieldId, file)
// Output: ✓ Field: "Document" (field-123) - File: "resume.pdf" (application/pdf)
```

#### Form Submission Logging
```typescript
logFormSubmission(fields, formData)
// Output: Form Submitted: {
//   "Email": "user@example.com",
//   "Age": "25",
//   "Country": "USA"
// }
```

### Where Logging is Used
1. **FieldInput Component** - Logs every field change
2. **FormPreview Component** - Logs form submission
3. **SubmitForm Component** - Logs form submission
4. **File Validation** - Logs file upload success/error

---

## API Endpoints

### Base URL
```
https://dev-xavia.xaviasolutions.com:3066/api/
```

### Authentication
```
POST /users/v1/admin-login
Body: { email, password }
Response: { success, data: { id, email, token, ... }, statusCode }
```

### Forms
```
GET    /api/forms                    - Get all forms
GET    /api/forms/:id                - Get form by ID
POST   /api/forms                    - Create new form
PUT    /api/forms/:id                - Update form
DELETE /api/forms/:id                - Delete form
```

### Submissions
```
POST   /api/forms/:formId/submissions        - Submit form
GET    /api/forms/:formId/submissions        - Get form submissions
```

---

## Environment Variables

```env
VITE_API_ENDPOINT_DEVELOPMENT="https://dev-xavia.xaviasolutions.com:3066/api/"
```

---

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Preview
```bash
npm run preview
```

---

## Key Concepts

### Form Schema Structure
```typescript
interface FormSchema {
  id: string;
  name: string;
  sub_forms: SubForm[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

interface SubForm {
  id: string;
  name: string;
  category?: string;
  fields: FormField[];
}

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  colSpan?: 1 | 2 | 3 | 4;
  row?: number;
  validation?: FieldValidation;
  acceptedFileTypes?: FileType[];
}
```

### State Management
- Uses React hooks for local state
- `useFormBuilder` - Form building state
- `useFormState` - Form submission state
- `useFormSync` - Backend synchronization
- `useAuth` - Authentication state

### Error Handling
- Try-catch blocks in services
- Error boundary component
- User-friendly error messages
- Console error logging

---

## Future Enhancements

1. **Advanced Features**
   - Conditional field visibility
   - Field dependencies
   - Multi-step forms
   - Form versioning

2. **Improvements**
   - Real-time collaboration
   - Form analytics
   - Advanced reporting
   - Form templates

3. **Performance**
   - Code splitting
   - Lazy loading
   - Caching strategies
   - Optimistic updates

---

## Support & Documentation

For more information, refer to:
- Component files for implementation details
- Service files for API integration
- Type definitions in `src/types/form.ts`
- Utility functions in `src/utils/`

---

**Last Updated:** May 2026
**Version:** 1.0.0
