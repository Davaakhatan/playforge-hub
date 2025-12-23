export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Playforge. All rights reserved.
          </p>
          <p className="text-sm text-zinc-500">
            Your indie game discovery hub
          </p>
        </div>
      </div>
    </footer>
  );
}
