import AuthGuard from "@/components/AuthGuard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
     <Navbar isLoggedIn={true}/>
      {children}
      <Footer/>
    </AuthGuard>
  );
}
