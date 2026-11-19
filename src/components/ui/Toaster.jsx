import { Toaster as Sonner } from 'sonner';

export const Toaster = () => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        style: {
          background: '#222F43',
          backdropFilter: 'blur(12px)',
          border: '1px solid #39465A',
          color: '#F5F3EE',
          boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.6)',
          fontFamily: 'DM Sans, sans-serif',
        },
      }}
    />
  );
};
