export default function WithBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="site-app">{children}</div>;
}
