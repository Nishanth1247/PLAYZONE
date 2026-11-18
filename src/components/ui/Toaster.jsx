import { Toaster as Sonner } from 'sonner';

export const Toaster = () => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(21, 26, 43, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid #232A44',
          color: '#F5F6FF',
          boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.7)',
        },
      }}
    />
  );
};
