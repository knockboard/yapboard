import { cn } from "../lib/utils";
import useCanvasStore from "../store/canvasStore";
import useToolStore from "../store/toolStore";

const fontFamilies = [
  {
    label: "Simply",
    fontFamily: "Noto Sans",
  },
  {
    label: "Bubbly",
    fontFamily: "Fuzzy Bubbles",
  },

  {
    label: "Classicy",
    fontFamily: "Lugrasimo",
  },
  {
    label: "Pactie",
    fontFamily: "Impact",
  },
  {
    label: "Yappie",
    fontFamily: "Knewave",
  },
];

interface Props {
  toggleDropdown: () => void;
}

export default function FontFamilyDropdown({ toggleDropdown }: Props) {
  const { fabricRef } = useCanvasStore();
  const fontFamily = useToolStore((state) => state.fontFamily);
  const setFontFamily = useToolStore((state) => state.setFontFamily);

  const changeFontFamily = (fontFamily: string) => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        if (["textbox", "i-text"].includes(obj.type)) {
          obj.set({
            fontFamily: fontFamily,
          });
        }
        canvas.requestRenderAll();
      });
    }
  };

  return (
    <div className="overflow-hidden border rounded-md bg-secondary border-border drop-shadow-md">
      {fontFamilies.map((f, i) => {
        return (
          <div
            key={i}
            className={cn(
              `px-3 py-1 cursor-pointer hover:bg-gray-200 whitespace-nowrap `,
              {
                "bg-gray-200": fontFamily === f.fontFamily,
              },
            )}
            style={{ fontFamily: f.fontFamily }}
            onClick={() => {
              setFontFamily(f.fontFamily);
              toggleDropdown();
              changeFontFamily(f.fontFamily);
            }}
          >
            {f.label}
          </div>
        );
      })}
    </div>
  );
}
