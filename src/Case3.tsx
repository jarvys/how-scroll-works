import "./Case3.css";

import { useEffect, useRef, useState } from "react";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function listener() {
      window.performance.mark("c3-wheel");
      console.log("c3-wheel");
    }
    window.addEventListener("wheel", listener);
    return () => {
      window.removeEventListener("wheel", listener);
    };
  }, []);

  useEffect(() => {
    function listener() {
      window.performance.mark("c3-scroll");
      console.log("c3-scroll");
      alert("hello world");
    }

    scrollContainerRef.current?.addEventListener("scroll", listener);
    return () => {
      scrollContainerRef.current?.removeEventListener("scroll", listener);
    };
  }, []);

  eval("console.log('c3-render')");
  window.performance.mark("c3-render");

  return (
    <div className="c3-container">
      <div className="c3-sticky-header">
        <div></div>
        <div
          className="c3-btn"
          onClick={() => {
            window.performance.mark("c3-insert-btn-click");
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
      <div
        ref={scrollContainerRef}
        className="c3-list"
        style={{ height: "calc(100vh - 100px)", overflowY: "auto" }}
      >
        {insertedList.map((_, j) => {
          return <Card key={`inserted-${j}`} label={`inserted-${j}`} />;
        })}
        {items.map((_, i) => {
          return <Card key={`card-${i}`} label={`card-${i}`} />;
        })}
      </div>
    </div>
  );
}
