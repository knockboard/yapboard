import Canvas from "./Canvas";
import Logger from "./Logger";
import ObjectBar from "./ObjectBar";
import StampsBar from "./StampsBar";
import ToolBar from "./ToolBar";
import MouseCoordinates from "./MouseCoordinates";
import UserMenu from "./UserMenu";

export default function CanvasPage() {
  return (
    <>
      <Canvas />
      <UserMenu />
      <MouseCoordinates />
      <ToolBar />
      <ObjectBar />
      <StampsBar />
      <Logger />
    </>
  );
}
