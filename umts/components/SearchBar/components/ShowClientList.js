import React from "react";
import { Button } from "../../componentLibrary";
import { useAutoFocus } from "../../../lib/hooks";

const ShowClientList = ({
  clientsList,
  searchObject,
  setSearchObject,
  handleRenderList,
  handleSaveValue,
  setContextData,
}) => {
  const focused = useAutoFocus();
  return (
    <div
      style={{
        display: searchObject.showClientList ? "block" : "none",
      }}
      className="absolute z-10 w-64 mt-5 bg-white rounded-lg header-popup top-100 right-4 arrow-right"
    >
      <ul className="h-auto mx-4 my-2 overflow-auto max-h-48">
        {clientsList
          ?.filter((x) => x.name == searchObject.clientId)
          .concat(
            clientsList.filter((x) => x.name != searchObject.clientId)
            // ?.slice(0, 5)
          )
          ?.map((l, i) => (
            <li
              className="py-2 border-b border-black cursor-pointer"
              onClick={() => {
                handleRenderList("clients", l.name);
                handleSaveValue("showClientList", false);
                if (
                  l.name === searchObject.clientId &&
                  contextData.currentPage == "product"
                ) {
                  navigateTo("/admin/domains", isConfirmed, () => {
                    setContextData((prevState) => ({
                      ...prevState,
                      domain: {
                        ...prevState.domain,
                        currentPage: 1,
                        perPage: 10,
                        pageList: {
                          ...prevState.domain.pageList,
                          start: 0,
                          end: 5,
                        },
                      },
                    }));
                    setContextData((prevState) => ({
                      ...prevState,
                      navigationItem: "domains",
                    }));
                  });
                }
                setSearchObject((state) => ({
                  ...state,
                  ["clientId"]: l.name,
                  ["searchDomain"]: "",
                  ["showDomainList"]: false,
                }));
              }}
              key={`a${l.name}-${i}`}
              value={l.name}
            >
              {l.name}
            </li>
          ))}
        <>
          {clientsList?.length == 0 && (
            <li className="py-2 before:hidden">No client available</li>
          )}
        </>
      </ul>
      <div className="flex m-4 rounded-lg bg-primary-400">
        <input
          id="searchClient"
          value={searchObject.clientSearchText}
          type="text"
          onChange={(e) => {
            setSearchObject((state) => ({
              ...state,
              ["clientSearchText"]: e.target.value,
            }));
          }}
          className="w-full p-3 text-sm border border-gray-400 rounded-lg outline-none"
          placeholder="Search Client"
          ref={focused}
        />
        <Button className="flex items-center justify-center px-4">
          <svg
            className="w-4 h-4 text-grey-dark"
            fill="#ffffff"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default ShowClientList;
