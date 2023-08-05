import { Creator, DerugForm } from "@/interface/derug.interface";
import "rc-slider/assets/index.css";
import { FC, useState } from "react";
import { useFormContext } from "react-hook-form";

const CreatorsArray: FC<{}> = ({}) => {
  const [maxPercentage, setMaxPercentage] = useState(100);

  const { getValues, setValue } = useFormContext<DerugForm>();

  const { creators } = getValues();

  const handleItemsAddressChange = (value: string, index: number) => {
    if (!creators) return;
    const updatedTodo = { ...creators[index], address: value };
    const storedCreators = [...creators];
    storedCreators[index] = { ...updatedTodo };
    setValue("creators", storedCreators);
  };

  const handleItemsPercentageChange = (value: string, index: number) => {
    if (!creators) return;
    const updatedTodo = { ...creators[index], share: +value };
    const storedCreators = [...creators];
    storedCreators[index] = { ...updatedTodo };
    setValue("creators", storedCreators);
  };

  const removeItems = (index: number) => {
    if (!creators) return;
    const temp = [...creators];
    temp.splice(index, 1);

    setValue("creators", temp);
  };

  return (
    <div className="w-full">
      {creators &&
        creators.map((creator, index) => (
          <div
            key={creator.address}
            className="flex flex-col w-full justify-between creators-start gap-3"
          >
            <span>Address</span>
            <div className="flex w-full flex-row gap-4">
              <input
                placeholder="Address"
                className="flex w-4/5 px-[12px] py-[8px] w-full items-center self-stretch border border-gray-500 bg-[#1D2939] shadow-xs bg-transparent text-gray-400 text-sm font-mono text-normal"
                value={creator.address}
                onChange={(e) =>
                  handleItemsAddressChange(e.target.value, index)
                }
              />
              <input
                placeholder="Percentage"
                className="flex w-1/5 px-[12px] py-[8px] w-full items-center self-stretch border border-gray-500 bg-[#1D2939] shadow-xs bg-transparent text-gray-400 text-sm font-mono text-normal"
                value={creator.share}
                onChange={(e) =>
                  handleItemsPercentageChange(e.target.value, index)
                }
              />
              <button onClick={() => removeItems(index)}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3333 5V4.33333C13.3333 3.39991 13.3333 2.9332 13.1517 2.57668C12.9919 2.26308 12.7369 2.00811 12.4233 1.84832C12.0668 1.66667 11.6001 1.66667 10.6667 1.66667H9.33333C8.39991 1.66667 7.9332 1.66667 7.57668 1.84832C7.26308 2.00811 7.00811 2.26308 6.84832 2.57668C6.66667 2.9332 6.66667 3.39991 6.66667 4.33333V5M8.33333 9.58333V13.75M11.6667 9.58333V13.75M2.5 5H17.5M15.8333 5V14.3333C15.8333 15.7335 15.8333 16.4335 15.5608 16.9683C15.3212 17.4387 14.9387 17.8212 14.4683 18.0609C13.9335 18.3333 13.2335 18.3333 11.8333 18.3333H8.16667C6.76654 18.3333 6.06647 18.3333 5.53169 18.0609C5.06129 17.8212 4.67883 17.4387 4.43915 16.9683C4.16667 16.4335 4.16667 15.7335 4.16667 14.3333V5"
                    stroke="#F04438"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default CreatorsArray;
