import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <p className="font-mono text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">Contact</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4">Get in Touch</h1>
            <p className="text-muted-foreground text-lg">Have a question or need support? We'd love to hear from you.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.form onSubmit={handleSubmit} className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div>
                <Label className="font-mono text-xs uppercase tracking-widest">Full Name</Label>
                <Input placeholder="Your name" required className="mt-1.5" />
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-widest">Email</Label>
                <Input type="email" placeholder="you@example.com" required className="mt-1.5" />
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-widest">Subject</Label>
                <Input placeholder="How can we help?" required className="mt-1.5" />
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-widest">Message</Label>
                <Textarea placeholder="Tell us more..." required className="mt-1.5 min-h-[120px]" />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </motion.form>

            <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              {[
                { icon: Mail, label: "Email", value: "hello@zebrabp.com" },
                { icon: Phone, label: "Phone", value: "+251 91 234 5678" },
                { icon: MapPin, label: "Office", value: "Bole, Addis Ababa, Ethiopia" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 border border-border p-5">
                  <div className="p-2 bg-primary/10 rounded">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{item.label}</p>
                    <p className="font-display font-bold mt-1">{item.value}</p>
                  </div>
                </div>
              ))}

              <div className="border border-border p-5">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Business Hours</p>
                <p className="text-sm">Monday – Friday: 8:30 AM – 5:30 PM (EAT)</p>
                <p className="text-sm text-muted-foreground">Saturday: 9:00 AM – 1:00 PM</p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
