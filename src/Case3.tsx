import "./Case3.css";

import { useState } from "react";

function Card({ label }: { label: string }) {
  return (
    <div className="c3-card" id={`${label}-card`}>
      <div className="c3-card-content" id={`${label}-content`}>
        {label}
      </div>
    </div>
  );
}

export default function Case3() {
  const items = Array.from({ length: 100 });
  const [insertedList, setInsertedList] = useState<number[]>([]);

  return (
    <div className="c3-container">
      <div className="c3-sticky-header">
        <div></div>
        <div
          className="c3-btn"
          onClick={() => {
            setInsertedList((prev) => {
              const v = prev.length;
              performance.mark(`c3-insert-${v}`);
              return [...prev, v];
            });
          }}
        >
          insert
        </div>
      </div>
      {insertedList.map((_, j) => {
        return <Card key={`inserted-${j}`} label={`inserted-${j}`} />;
      })}
      {items.map((_, i) => {
        return <Card key={`card-${i}`} label={`card-${i}`} />;
      })}
    </div>
  );
}
