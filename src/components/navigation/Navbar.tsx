const navigationItems = [
  { label: "About Us", href: "#about-us" },
  { label: "Contact", href: "#contact" },
  { label: "Events", href: "#events" },
  { label: "Gallery", href: "#gallery" },
  { label: "Home", href: "#home" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "Team", href: "#team" },
  { label: "Workshop", href: "#workshop" },
];

export default function Navbar() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8"
      >
        <ul className="flex min-w-max items-center gap-6 py-4">
          {navigationItems.map(({ label, href }) => (
            <li key={label}>
              <a
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900"
                href={href}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
