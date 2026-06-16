import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-5 border-t text-center text-xs text-zinc-500">
      Powered by VLDP | Vodacom Lesotho © {new Date().getFullYear()}
      {" · "}
      <Link href="/terms" className="hover:underline">
        Terms
      </Link>
      {" · "}
      <Link href="/privacy" className="hover:underline">
        Privacy
      </Link>
    </footer>
  );
}
