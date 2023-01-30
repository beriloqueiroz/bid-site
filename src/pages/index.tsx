import { Inter } from "@next/font/google";
import ContactForm from "@/components/contactForm";
import Presentation from "@/components/presentation";
import About from "@/components/about";
import Layout from "@/components/layout";
export default function Home() {
  return (
    <>
      <Layout>
        <Presentation />
        <About />
        <ContactForm />
      </Layout>
    </>
  );
}
