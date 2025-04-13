emergency-care-backend/
├── .vscode/
├── dist/
├── hello-prisma/
│   └── prisma/
│       ├── migrations/
│       ├── schema.prisma
│       ├── .env
│       └── .gitignore
├── node_modules/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── config/
│   ├── emergency/
│   ├── hospital/
│   ├── notification/
│   ├── prisma/
│   ├── profile/
│   ├── rescue-team/
│   ├── sos/
│   ├── statistics/
│   ├── supabase/
│   ├── user/
│   │   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── .dockerignore
├── .env
├── .gitignore
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── eslint.config.mjs
├── nest-cli.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.build.json
└── tsconfig.json


                   ┌────────────────────────────────┐
                   │         Mobile App             │
                   │        (React Native)          │
                   └─────────────┬──────────────────┘
                                 │
                                 ▼
                      ┌────────────────────┐
                      │    NestJS Backend  │
                      │  (Main API Server) │
                      └─────────┬──────────┘
                                │
        ┌──────────────────────┴────────────────────────┐
        │                                               │
        ▼                                               ▼
┌─────────────────────┐                       ┌─────────────────┐
│ Supabase PostgreSQL │<── Prisma ORM ──────> │ External APIs   │
│ (Database + Auth)   │                       │ (e.g. Maps API) │
└─────────────────────┘                       └─────────────────┘
                                ▲
                                │
                   ┌────────────────────────────┐
                   │        Web App             │
                   │     (Next.js Dashboard)    │
                   └────────────────────────────┘




Module Name	ใช้สำหรับ	ผู้ใช้ที่เกี่ยวข้อง
Auth Module	ลงทะเบียน / ล็อกอิน / ยืนยันตัวตน	ทุกคน
User Module	จัดการโปรไฟล์ผู้ใช้งานทั่วไป	General Users
Emergency Module	ส่ง/รับแจ้งเหตุฉุกเฉิน	Users, 1669, Hospital, Rescue
Hospital Module	ข้อมูลโรงพยาบาล, สถานะพร้อมให้บริการ	Hospital Staff
Rescue Module	ข้อมูลทีมกู้ภัย, สถานะทีม, การตอบสนอง	Rescue Teams
Notification Module	ส่งการแจ้งเตือนผ่าน FCM, Email เป็นต้น	ทุกฝ่าย
Report Module	รายงาน สถิติ การใช้งานระบบ	1669, Hospital, Admin