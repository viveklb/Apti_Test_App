import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata = {
  title: "Apptitude | Student Quiz",
  description: "A simple aptitude quiz for students"
};

export default function RootLayout({ children }) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
