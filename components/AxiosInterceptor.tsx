"use client";

import { useEffect } from 'react';
import api from '../lib/axios';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import { LoadingBarRef } from 'react-top-loading-bar';

interface AxiosInterceptorProps {
  loadingBarRef: React.RefObject<LoadingBarRef | null>;
}

const AxiosInterceptor = ({ loadingBarRef }: AxiosInterceptorProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { logout } = useAuth();

  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use(
      (config) => {
        loadingBarRef.current?.continuousStart();
        return config;
      },
      (error) => {
        loadingBarRef.current?.complete();
        return Promise.reject(error);
      }
    );

    const resInterceptor = api.interceptors.response.use(
      (response) => {
        loadingBarRef.current?.complete();
        return response;
      },
      (error) => {
        loadingBarRef.current?.complete();
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        enqueueSnackbar(message, { variant: 'error' });

        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, [enqueueSnackbar, logout, loadingBarRef]);

  return null;
};

export default AxiosInterceptor;
