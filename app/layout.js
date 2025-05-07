// import { Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/provider/theme-provider";
import localFont from "next/font/local";
 
// Font files can be colocated inside of `pages`
const montserrat = localFont({
  src: [
    {
      path: '../assets/fonts/Montserrat/static/Montserrat-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Montserrat/static/Montserrat-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Montserrat/static/Montserrat-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Montserrat/static/Montserrat-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Montserrat/static/Montserrat-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Montserrat/static/Montserrat-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ]
})


// const montserrat = Montserrat({
//   weight: '400',
//   subsets: ['latin'],
// });


export const metadata = {
  title: "Driver IQ",
  description: "Driving School Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
