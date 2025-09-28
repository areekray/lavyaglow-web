import { colorHexMap, stringToArray } from "@/constants/productOptions";

export const ColorChips = ({ colors, showLabel = false }: { colors: string, showLabel?: boolean }) => {
  const colorArray = stringToArray(colors);

  return (
    <div className="color-chips" style={{ display: 'flex', gap: 10, flexWrap: 'wrap'}}>
      {colorArray.map((color) => {
        const backgroundColor = colorHexMap[color] || '#CCCCCC';
        return (
          <div key={color} title={color} style={showLabel ? {
            width: 70,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }: {}}>
            <div 
              className="color-chip__swatch"
              style={{
                height: 32,
                width: 32,
                minWidth: 20,
                backgroundColor,
                borderRadius: 4,
                border: '1px solid #f1f1f1'
                // background: colorHexMap[color]?.includes('gradient') ? colorHexMap[color] : undefined
              }}
            />
            {showLabel && <span className="color-chip__name" style={{
                fontSize: "10px",
                fontWeight: "bold",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                letterSpacing: -0.5,
                color: "#c9beb0"
            }}>{color}</span>}
          </div>
      )})}
    </div>
  );
};