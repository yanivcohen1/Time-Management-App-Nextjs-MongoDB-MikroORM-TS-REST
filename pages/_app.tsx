import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { SnackbarProvider } from 'notistack';
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar';
import AxiosInterceptor from '../components/AxiosInterceptor';
import { useRef } from 'react';
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const loadingBarRef = useRef<LoadingBarRef>(null);

  return (
    <ThemeProvider>
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <LoadingBar color="#f11946" ref={loadingBarRef} />
          <AxiosInterceptor loadingBarRef={loadingBarRef} />
          <Component {...pageProps} />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
