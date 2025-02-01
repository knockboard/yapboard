import Canvas from "./Canvas";
import Logger from "./Logger";
import ObjectBar from "./ObjectBar";
import StampsBar from "./StampsBar";
import ToolBar from "./ToolBar";
import FpsStat from "./FpsStat";
import UserMenu from "./UserMenu";
import ProtectedRoutes from "./ProtectedRoutes";

export default function CanvasPage() {
  return (
    <ProtectedRoutes>
      <Canvas />
      <UserMenu />
      <FpsStat />
      <ToolBar />
      <ObjectBar />
      <StampsBar />
      <Logger />
    </ProtectedRoutes>
  );
}
