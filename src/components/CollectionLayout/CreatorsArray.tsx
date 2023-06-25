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
    <div className="w-full">
      {creators &&
        creators.map((creator, index) => (
          <div
            key={creator.address}
            className="flex w-full justify-between creators-start gap-3"
          >
            <div className="flex w-full flex-row">
              <input
                placeholder="Address"
                className="bg-gray-800"
                value={creator.address}
                style={{ width: "100%" }}
                onChange={(e) =>
                  handleItemsAddressChange(e.target.value, index)
                }
              />
              <input
                placeholder="Percentage"
                className="bg-gray-800"
                value={creator.share}
                style={{ width: "30%" }}
                onChange={(e) =>
                  handleItemsPercentageChange(e.target.value, index)
                }
              />
            </div>

            <button onClick={() => removeItems(index)}>remove</button>
          </div>
        ))}
    </div>
  );
};

export default CreatorsArray;
