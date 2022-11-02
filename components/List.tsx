import React from "react";

export interface ListProps {
    address: string,
    sira: number
}
  
function List({ address, sira }: ListProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                backgroundColor: "#fafafa",
                margin: "20px",
            }}
        >
            <div>{sira} - {address}</div>
        </div>
    );
}
  
export default List;