import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Aero Drop",
  description: "a decentralized airdrop platform",
};

export default function RootLayout(props: {children: ReactNode}) {
  return (
    <html lang="en">
      <body>test baby
        <Providers>
          {props.children}
        </Providers>
      </body>
    </html>
  );
}
