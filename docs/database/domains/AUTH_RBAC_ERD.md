# Domain ERD: Authentication & Role-Based Access Control (RBAC)

## 1. Deskripsi Domain
Dokumentasi ERD untuk manajemen autentikasi pengguna (Laravel Fortify, Two-Factor Authentication, Session Management) dan otorisasi hak akses peran (Spatie Laravel Permission).

## 2. Diagram ERD (Crow's Foot Notation)

```mermaid
erDiagram
    users {
        bigint id PK "id"
        varchar name "name"
        varchar email UK "email"
        varchar user_type "user_type"
        varchar status "status"
        timestamp last_login_at "last_login_at"
        timestamp email_verified_at "email_verified_at"
        varchar password "password"
        text two_factor_secret "two_factor_secret"
        text two_factor_recovery_codes "two_factor_recovery_codes"
        timestamp two_factor_confirmed_at "two_factor_confirmed_at"
        varchar remember_token "remember_token"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    roles {
        bigint id PK "id"
        varchar name "name"
        varchar guard_name "guard_name"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    permissions {
        bigint id PK "id"
        varchar name "name"
        varchar guard_name "guard_name"
        timestamp created_at "created_at"
        timestamp updated_at "updated_at"
    }
    model_has_roles {
        bigint role_id PK,FK "role_id"
        varchar model_type PK "model_type"
        bigint model_id PK "model_id"
    }
    model_has_permissions {
        bigint permission_id PK,FK "permission_id"
        varchar model_type PK "model_type"
        bigint model_id PK "model_id"
    }
    role_has_permissions {
        bigint permission_id PK,FK "permission_id"
        bigint role_id PK,FK "role_id"
    }
    roles ||--o{ model_has_roles : "role_id"
    permissions ||--o{ model_has_permissions : "permission_id"
    permissions ||--o{ role_has_permissions : "permission_id"
    roles ||--o{ role_has_permissions : "role_id"
```

## 3. Inventarisasi Tabel Domain

| Nama Tabel | Total Kolom | Primary Key | Total FK | Keterangan Fungsi |
|---|---|---|---|---|
| `users` | 14 | `id` | 0 | Tabel operasional modul users |
| `roles` | 5 | `id` | 0 | Tabel operasional modul roles |
| `permissions` | 5 | `id` | 0 | Tabel operasional modul permissions |
| `model_has_roles` | 3 | `role_id` | 1 | Tabel operasional modul model has roles |
| `model_has_permissions` | 3 | `permission_id` | 1 | Tabel operasional modul model has permissions |
| `role_has_permissions` | 2 | `permission_id` | 2 | Tabel operasional modul role has permissions |

---
*Dokumentasi ini digenerate secara otomatis berdasarkan skema database fisik aktif `siakad_db`.*
