# AVEZ — Automated Investment Allocation & Execution Monitor

> Automation Engine for Salary-Based Investment Allocation using Sectors Data

AVEZ adalah automation engine yang dirancang untuk melakukan analisis fundamental dan alokasi budget investasi secara otomatis berdasarkan data perusahaan, kemudian mengirimkan hasil analisis melalui Telegram dan mencatat seluruh aktivitas eksekusi ke dalam execution log.

AVEZ **tidak melakukan transaksi jual/beli secara otomatis**. Sistem hanya menghasilkan analisis dan rekomendasi alokasi berdasarkan data fundamental.

---

## 🎯 Hackathon Track

**Sectors Hackathon 2026 — Track 02: Automation & Workflows**

AVEZ berfokus pada automation workflow yang dapat berjalan tanpa intervensi manual dari trigger hingga notification.

---

## 🚀 Project Overview

AVEZ mengotomatisasi proses:

```text
Schedule / API Trigger
        ↓
   Sectors API
        ↓
    Data Engine
        ↓
 Fundamental Screening
        ↓
      Scoring
        ↓
     Allocation
        ↓
   Execution Log
        ↓
 Telegram Notification
        ↓
    Web Log Viewer
