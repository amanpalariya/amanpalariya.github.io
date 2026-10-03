import Header from "../common/Header";
import { DetailBackNavigation } from "./DetailBackNavigation";
export default function WithHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DetailBackNavigation>
      <div className="site-layout">
        <Header />
        <div className="site-body">{children}</div>
      </div>
    </DetailBackNavigation>
  );
}
