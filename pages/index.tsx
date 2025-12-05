import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const KanbanBoard = dynamic(() => import('../components/KanbanBoard'), { ssr: false });

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <Layout>
      <KanbanBoard />
    </Layout>
  );
}
