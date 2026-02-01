# Mini-S3: Distributed Object Storage System

> **A high-performance, fault-tolerant file storage engine simulating distributed cloud architecture.**  
> *Built with Node.js Streams, MongoDB, and Redis.*

---

## 📖 Overview

**Mini-S3** is an object storage system designed for efficient large-file handling. It uses **Node.js Streams** to process files with a low memory footprint, regardless of their size.

It implements advanced storage concepts found in production systems like AWS S3 and Dropbox, including **Content Addressable Storage (CAS)**, **Block-Level Deduplication**, and **Sharded Storage**.

## 🚀 Key Features

*   **⚡ Stream-Based Processing**: Fully streaming pipeline (Client $\to$ Busboy $\to$ Chunker $\to$ Disk) ensures zero memory bloating, even for 10GB+ files.
*   **💾 Global Deduplication**: Uses SHA-256 hashing to identify duplicate 1MB chunks. If 50 users upload the exact same file, it is stored only *once* physically.
*   **🌐 Distributed Sharding**: Simulates a cluster environment by distributing data chunks across multiple local "Storage Nodes" using a round-robin strategy.
*   **🛡️ Content Addressable**: Files are retrieved by their content hash, guaranteeing data integrity.
*   **🔒 Security**: Hardened with Helmet for secure headers, CORS policies, and Rate Limiting to prevent DoS attacks.
*   **📂 Resilient Metadata**: Metadata (filenames, hierarchy) is decoupled from blob storage, allowing the system to scale storage nodes independently of the database.

---

## 🏗 System Architecture

The following diagram illustrates the data flow during a file upload, highlighting the deduplication logic:

```mermaid
graph TD
    Client[Client Request] -->|Multipart Stream| Server[API Gateway / Express]
    Server -->|Pipe| Busboy[Busboy Parser]
    
    subgraph Stream Processing Pipeline
        Busboy -->|File Stream| Chunker[ChunkerStream]
        Chunker -->|1MB Buffers| Hasher[SHA-256 Hasher]
        Hasher -->|Hash + Data| Dedupe{Exists in DB?}
    end
    
    Dedupe -->|Yes| Link[Link Metadata Only]
    Dedupe -->|No| Distribute[Distribution Logic]
    
    subgraph Storage Layer (Local Cluster Simulation)
        Distribute -->|Round Robin| Node1[Storage Node 1]
        Distribute -->|Round Robin| Node2[Storage Node 2]
        Distribute -->|Round Robin| Node3[Storage Node 3]
    end
    
    Link --> Mongo[(MongoDB Metadata)]
    Distribute --> Mongo
```

---

## 📂 Project Structure

A clean, modular architecture separating concerns for maintainability.

```text
src/
├── controllers/    # Request handlers (Upload/Download logic)
├── models/         # Mongoose schemas (File & Chunk metadata)
├── routes/         # API Route definitions
├── services/       # Business logic (Database & Storage interaction)
├── streams/        # Custom Transform streams for chunking & processing
├── utils/          # Helper functions (Hashing, Validation)
└── app.js          # Entry point & Server configuration
```

---

## 🔌 API Reference

### 1. Upload File
Uploads a file using `multipart/form-data`. The system automatically handles chunking and deduplication.

*   **Endpoint:** `POST /api/upload`
*   **Body:** `form-data` (key: `file`)
*   **Response:**
    ```json
    {
      "success": true,
      "fileId": "65b8e9..."
    }
    ```

### 2. Download File
Streams the requested file back to the client. The system virtually reassembles the file from scattered chunks on the fly.

*   **Endpoint:** `GET /api/files/:id`
*   **Response:** Binary Stream (`application/octet-stream`)

### 3. List Files
Returns a JSON list of all stored files and their metadata.

*   **Endpoint:** `GET /api/files`

---

## 🛠 Tech Stack

*   **Runtime environment**: Node.js (v18+)
*   **Web Framework**: Express.js
*   **Database**: MongoDB (Metadata Indexing)
*   **Caching/Locking**: Redis (Optional, for distributed locks)
*   **Storage**: Local Filesystem (Simulating networked storage nodes)
*   **Libraries**: Busboy (Streaming), Mongoose (ORM), FS-Extra

---

## 📦 Getting Started

### Prerequisites
*   Node.js & npm installed
*   MongoDB running locally (or a cloud URI)

### Installation
1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/mini-s3-backend.git
    cd mini-s3-backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Server**
    ```bash
    npm start
    ```
    The server will initialize storage nodes at `./nodes/` and start listening on port `3000`.

---

## 🔮 Future Roadmap

Potential improvements for production readiness:
*   [ ] **S3 Compatibility**: Implement an AWS S3-compatible XML API layer.
*   [ ] **Erasure Coding**: Replace simple replication with Reed-Solomon coding for fault tolerance.
*   [ ] **Garbage Collection**: Automated cron jobs to clean up orphaned chunks.
*   [ ] **Auth**: Add API Key authentication for multi-tenant support.
