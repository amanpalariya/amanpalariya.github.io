import CommonHeader from "./CommonHeader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommonHeader>{children}</CommonHeader>;
}
