import React, { useState } from 'react';

const TabComponent = ({ tabs, activeTab, handleTabClick }) => {

    return (
        <div className="w-fit p-4 flex flex-col items-center gap-10 bg-gray-800 text-white text-xl font-mono font-black">
            <div className="flex">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        className={`py-2 px-3 cursor-pointer flex justify-center items-center ${activeTab === tab.id ? 'bg-[#065986] text-[#36BFFA] font-semibold' : ''
                            }`}
                        onClick={() => handleTabClick(tab.id)}
                    >
                        {tab.title}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TabComponent;
