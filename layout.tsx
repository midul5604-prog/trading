import type { Metadata } from "next";

import "./globals.css";





export const metadata: Metadata = {
  title: "Nesus field",
  description: "Best of the services",

};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
    >

    
      <body >
      {/* <Header_component /> */}
        {children}

        </body>
    </html>
  );
}
