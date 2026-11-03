import { useNavigate } from "react-router-dom";
import zebraLogoLight from "@/assets/zebra-logo-light.png";

const SocialIcon = ({ d, href }: { d: string; href: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="p-2 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d={d} /></svg>
  </a>
);

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-card text-card-foreground py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={zebraLogoLight} alt="Zebra" className="h-8 object-contain" />
              <div>
                <p className="font-display text-2xl font-bold tracking-tighter">ZEBRA</p>
                <p className="text-sm text-muted-foreground font-mono">Business Path</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">AI-powered feasibility studies and business plans for the Ethiopian market.</p>
            <div className="flex gap-1 mt-4">
              <SocialIcon href="https://t.me/zebraofficalchannal" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              <SocialIcon href="https://t.me/zebraofficalchannal" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              <SocialIcon href="https://t.me/zebraofficalchannal" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              <SocialIcon href="https://t.me/zebraofficalchannal" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              <SocialIcon href="https://t.me/zebraofficalchannal" d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z" />
            </div>
            <a href="/flyer" className="inline-block mt-3 text-xs font-mono text-primary hover:underline">→ View flyer & leave feedback</a>
          </div>
          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-1">Product</p>
              <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <button onClick={() => navigate("/marketplace")} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">Marketplace</button>
              <button onClick={() => navigate("/studio")} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">Studio</button>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-1">Company</p>
              <button onClick={() => navigate("/about")} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">About</button>
              <button onClick={() => navigate("/contact")} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">Contact</button>
              <button onClick={() => navigate("/blog")} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">Blog</button>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border flex justify-between items-center gap-4">
          <p className="text-xs font-mono text-muted-foreground">© 2026 ZEBRA. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/login")}
              className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Admin login"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11m6 0v6m0-6c1.657 0 3-1.343 3-3s-1.343-3-3-3M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" /></svg>
              Admin Login
            </button>
            <div className="zebra-stripes w-16 h-2" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
