import { Box, Button, Textarea, TextInput } from "@primer/react";
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
    <Box className="w-full px-3">
      {items &&
        items.map(
          (u, index) =>
            index === selectedUtility && (
              <div
                key={index}
                className="flex flex-row w-full justify-between items-start gap-3"
              >
                <div className="flex w-full flex-col">
                  <TextInput
                    placeholder={placeholder}
                    value={u.title}
                    sx={{ width: "100%" }}
                    onChange={(e) =>
                      handleItemsNameChange(e.target.value, index)
                    }
                  />
                  <Textarea
                    placeholder="Enter a description"
                    value={u.description}
                    sx={{ width: "100%" }}
                    onChange={(e) =>
                      handleItemsDescChange(e.target.value, index)
                    }
                  />
                </div>
                <Button
                  variant="danger"
                  onClick={() => removeItems(index)}
                >
                  remove
                </Button>
              </div>
            )
        )}
    </Box>
  );
};

export default UtilityArray;
