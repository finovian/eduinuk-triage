This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Architecture Trade-offs & Scalability Notes

During the implementation of the student triage workflow, several deliberate trade-offs were made to balance simplicity, assessment scope, and scalability:

### 1. Staff Notes History
- **Limitation**: When a staff member submits notes on a case, only the most recent note is displayed. If a staff member submits a new note, the previous note is not visible in the case detail view.
- **Trade-off**: The database schema fully supports audit history via a 1-to-many relationship (`StaffNote` table). To keep the API contracts and frontend views simple (using a single editable text area), the API only returns the single latest note (`c.notes[0]?.note`). In production, this can easily be expanded to display a full message/note thread by mapping the notes array directly.

### 2. Student Lookup by Email on Submission
- **Limitation**: When a student submits an inquiry, we do a database round-trip using `prisma.student.findFirst` to check if they already exist before creating/updating their record.
- **Trade-off**: This extra query adds a minor database round-trip. However, because student lookup is indexed on the `email` column (`@@index([email])`), this is extremely fast (O(1) index seek) and has negligible overhead. For massive high-concurrency systems, using a single Prisma `upsert` or nested `connectOrCreate` inside case creation is recommended to achieve absolute atomic operations.

### 3. Year of Study Type
- **Limitation**: `yearOfStudy` is stored as a simple `String` rather than an enum or integer.
- **Trade-off**: This avoids strict validation issues during early development and allows students to input text values. For a production deployment, this should be hardened to an `Enum` or `Int` with strict backend schema validations.

