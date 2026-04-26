export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Admin pages render as a fixed full-screen overlay that sits above the main site.
  // Individual pages either show the login screen or use AdminShell component.
  return <>{children}</>;
}
