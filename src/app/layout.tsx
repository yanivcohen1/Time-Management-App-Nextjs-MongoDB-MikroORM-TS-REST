"use client";

import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { SnackbarProvider } from 'notistack';
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar';
import AxiosInterceptor from '../components/AxiosInterceptor';
import { useRef, useState, useEffect } from 'react';
import "@/styles/globals.css";
import "@/animation/fade.css";
import "@/animation/slide-right.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loadingBarRef = useRef<LoadingBarRef>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <SnackbarProvider maxSnack={3}>
            <AuthProvider>
              {mounted && (
                <>
                  <LoadingBar color="#f11946" ref={loadingBarRef} />
                  <AxiosInterceptor loadingBarRef={loadingBarRef} />
                  {children}
                </>
              )}
            </AuthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}