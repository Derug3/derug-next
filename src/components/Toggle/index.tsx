import React, { useState } from 'react';

const Toggle = ({ isChecked, handleToggle }) => {
    return (
        <label className="flex items-center cursor-pointer">
            <div className="flex w-[36px] h-[20px] p-[2px] justify-end items-center rounded-full bg-[#36BFFA]">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={handleToggle}
                />
                <div
                    className={`w-[16px] h-[16px] rounded-full shadow ${isChecked ? 'bg-[#1D2939] ml-2' : 'bg-white mr-[16px]'
                        } transition-all ease-in-out duration-300`}
                ></div>
            </div>
            <span className="ml-2 text-white font-mono">Public mint</span>
        </label>
    );
};

export default Toggle;
