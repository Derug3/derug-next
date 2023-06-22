import { Box, Button, Label, Textarea, TextInput } from "@primer/react";
import "rc-slider/assets/index.css";
import { FC, useState } from "react";

const CreatorsArray: FC<{
  creators: any[];
  setCreators: (item: any) => void;
}> = ({ creators, setCreators }) => {
  const [maxPercentage, setMaxPercentage] = useState(100);

  const handleItemsAddressChange = (value: string, index: number) => {
    if (!creators) return;
    const updatedTodo = { ...creators[index], address: value };
    const storedCreators = [...creators];
    storedCreators[index] = { ...updatedTodo };
    setCreators(storedCreators);
  };

  const handleItemsPercentageChange = (value: string, index: number) => {
    if (!creators) return;
    const updatedTodo = { ...creators[index], share: +value };
    const storedCreators = [...creators];
    storedCreators[index] = { ...updatedTodo };
    setCreators(storedCreators);
  };

  const removeItems = (index: number) => {
    if (!creators) return;
    const temp = [...creators];
    temp.splice(index, 1);

    setCreators(temp);
  };


  return (
    <Box className="w-full">
      {creators &&
        creators.map((creator, index) => (
          <div
            key={creator.address}
            className="flex w-full justify-between creators-start gap-3"
          >
            <div className="flex w-full flex-row">
              <TextInput
                placeholder="Address"
                value={creator.address}
                sx={{ width: "100%" }}
                onChange={(e) =>
                  handleItemsAddressChange(e.target.value, index)
                }
              />
              <TextInput
                placeholder="Percentage"
                value={creator.share}
                sx={{ width: "30%" }}
                onChange={(e) =>
                  handleItemsPercentageChange(e.target.value, index)
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
        ))}
    </Box>
  );
};

export default CreatorsArray;
