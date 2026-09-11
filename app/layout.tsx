import '@xyflow/react/dist/style.css';
import './globals.css';

export const metadata = {
  title: 'Human Knowledge Map',
  description: 'Explore human knowledge from primary school to research frontiers.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
