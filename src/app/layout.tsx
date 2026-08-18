'use client';
import ThemeContextProvider from "@/providers/theme/ThemeContext";
import ThemeProvider from "@/providers/theme/ThemeProvider";
import "../styles/globals.css";
import Header from "@/components/Header/Header";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/lib/appolo-client";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
      <ApolloProvider client={client}>
        <ThemeContextProvider>
          <ThemeProvider>
            <div>
              <Header />
              {children}
            </div>
          </ThemeProvider>
        </ThemeContextProvider>
        </ApolloProvider>
      </body>
    </html>
  );
};

export default RootLayout;
