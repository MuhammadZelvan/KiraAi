import { redirect } from "next/navigation";

export default function HomePage() {
  // Sementara user biasa dan admin di-redirect dari sini kalau belum login
  // Kita buat default route redirect ke /user, nanti middleware/login auth yang handle redirect spesifik
  redirect("/user");
}
