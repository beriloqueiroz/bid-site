import About from '@/components/about';
import ContactForm from '@/components/contactForm';
import Layout from '@/components/layout';
import Presentation from '@/components/presentation';
import { Inter } from '@next/font/google';
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
