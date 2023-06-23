import "rc-slider/assets/index.css";
import { FC } from "react";

const UtilityArray: FC<{
  selectedUtility: number;
  placeholder?: string;
  items: any[];
  setItems: (item: any) => void;
}> = ({ selectedUtility, items, setItems, placeholder }) => {
  const handleItemsNameChange = (value: string, index: number) => {
    if (!items) return;
    const updatedTodo = { ...items[index], title: value };
    const newItems = [
      ...items.slice(0, index),
      updatedTodo,
      ...items.slice(index + 1),
    ];
    setItems(newItems);
  };

  const handleItemsDescChange = (value: string, index: number) => {
    if (!items) return;
    const updatedTodo = { ...items[index], description: value };

    const newItems = [
      ...items.slice(0, index),
      updatedTodo,
      ...items.slice(index + 1),
    ];
    setItems(newItems);
  };

  const removeItems = (index: number) => {
    if (!items) return;
    const temp = [...items];
    temp.splice(index, 1);

    setItems(temp);
  };

  return (
    <div className="w-full px-3">
      {items &&
        items.map(
          (u, index) =>
            index === selectedUtility && (
              <div
                key={index}
                className="flex flex-row w-full justify-between items-start gap-3"
              >
                <div className="flex w-full flex-col">
                  <input
                    placeholder={placeholder}
                    value={u.title}
                    style={{ width: "100%" }}
                    onChange={(e) =>
                      handleItemsNameChange(e.target.value, index)
                    }
                  />
                  <input
                    placeholder="Enter a description"
                    type="textarea"
                    value={u.description}
                    style={{ width: "100%" }}
                    onChange={(e) =>
                      handleItemsDescChange(e.target.value, index)
                    }
                  />
                </div>
                <button
                  onClick={() => removeItems(index)}
                >
                  remove
                </button>
              </div>
            )
        )}
    </div>
  );
};

export default UtilityArray;
