import { Toaster as Sonner } from 'sonner';

export const Toaster = () => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        style: {
          background: '#191919',
          backdropFilter: 'blur(12px)',
          border: '1px solid #303030',
          color: '#F2F2F0',
          boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.8)',
        },
      }}
    />
  );
};
