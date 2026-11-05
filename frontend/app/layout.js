import './globals.css';

export const metadata = {
  title: 'TeamSync · Platform Supervisi Kolaborasi Tim',
  description: 'Monitoring dan supervisi berkala dinamika kolaborasi project kelompok mahasiswa',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
