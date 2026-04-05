const Footer = () => {
  return (
    <footer className="border-t border-border px-6 md:px-12 py-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div className="text-2xl font-bold text-primary mb-3">◗ SwiftMint</div>
          <p className="text-sm text-muted-foreground max-w-xs">
            A modern trading platform built for ambitious traders worldwide.
          </p>
        </div>
        <div className="flex gap-12">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Legal</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
        © 2026 SwiftMint. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
