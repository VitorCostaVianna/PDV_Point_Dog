# 🐶 Point Dog POS — Desktop Point of Sale System

> **Optimized desktop solution for local retail, engineered for low-spec hardware.**

[![Status](https://img.shields.io/badge/Status-In_Development-orange)](#)
[![Java](https://img.shields.io/badge/Java-21-red)](#)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green)](#)
[![React](https://img.shields.io/badge/React-Vite-blue)](#)

## About the Project

This system was custom-built for **Point Dog Pet Shop**, a local business with over 27 years in the market, to replace slow, error-prone manual checkout with a fast, reliable point-of-sale system.

Unlike modern cloud/SaaS trends, this project was deliberately architected as an **on-premise desktop solution**. The goal was to solve real, concrete pain points: near-zero checkout latency, full offline availability, and zero recurring server costs for a small local business — priorities that a cloud-first architecture wouldn't have served as well.

The system focuses on the essentials: fast sales processing, customer history management, and instant non-fiscal receipt printing.

## Key Technical Highlights

### 🖨️ Native Thermal Printing (Hardware-level)
Unlike web-based systems that rely on the browser's print dialog, Point Dog POS communicates **directly with the printer driver/port** (tested on Elgin i9, Epson TM-T20) using the raw **ESC/POS protocol via Java** — no PDF rendering step, no print-dialog friction, near-instant receipt output.

### ⚡ Low-Spec Hardware Optimization
Engineered to run reliably on modest checkout-counter hardware (e.g., 4GB RAM):
- **Backend:** Fine-tuned JVM memory limits (`-Xmx512m`) and Garbage Collector settings for low memory footprint
- **Frontend:** Heavy use of `useMemo` and lazy loading to avoid unnecessary re-renders
- **Database:** H2 (file-based) with optimized indexing (`@Index`) for instant lookups, even with thousands of records

### 🏗️ Desktop-First Architecture
- **Frontend:** React + Vite, running locally
- **Backend:** Spring Boot, serving both as the API and as the hardware integration layer
- **Startup:** A single custom `.bat` script boots the entire environment with one click — no technical setup required from the end user

## Tech Stack

**Backend (Java Ecosystem)**
- Java 21 / Spring Boot 3 — core stability and dependency injection
- H2 Database — embedded, file-based SQL database (no separate DB server install needed on the client machine)
- EscPos (Anastacio Cintra) — library for raw thermal-printer communication
- Lombok — boilerplate reduction

**Frontend (React Ecosystem)**
- React + TypeScript — reactive UI with type safety
- Vite — fast build tooling
- Tailwind CSS — rapid, responsive styling
- Lucide React — lightweight icon set
- React-Select — robust product/customer search component

## Project Structure

```
src/
├── controller/  # REST API endpoints
├── service/     # Business rules & printing logic
├── repository/  # Data access (Spring Data JPA)
├── model/       # Database entities (ORM)
└── dto/         # Data transfer objects
```

## How to Run

**Prerequisites**
- Java JDK 17+
- Node.js 18+
- Thermal printer (optional — the system emulates output in the console if none is connected)

**Steps**

```bash
# Clone the repo
git clone https://github.com/VitorCostaVianna/PDV_Point_Dog.git
cd PDV_Point_Dog

# Run the backend
./mvnw spring-boot:run

# Run the frontend
cd frontend
npm install
npm run dev
```

Access at `http://localhost:5173`

**Production deployment** uses an optimized startup script (`iniciar_sistema.bat`) that limits JVM memory, disables unnecessary logging, and starts the database in server mode:

```bash
java -Xms256m -Xmx512m -jar sistema-gerenciamento-point-dog.jar
```

## Contact

Developed by Vitor Costa · [LinkedIn](https://www.linkedin.com/in/vitor-costa-vianna-5449832b8/) · vitorcostavianna@gmail.com
