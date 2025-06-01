import "./case1.css";

import debugFn from "debug";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const debug = debugFn("app:case1");

function GroupView({
  group,
}: {
  group: { key: number; showRowA: boolean; height: number };
}) {
  return (
    <div className="c1-group">
      <div className="c1-stickyHeader">group #{group.key}</div>
      <div className="c1-group-inner" style={{ height: group.height }} />
    </div>
  );
}

// 不同的布局实现方式
interface LayoutSolution {
  getContainerStyle(): React.CSSProperties;
  getScrollStyle(options: {
    fixedPaneHeight: number;
    fixedPaneBaseHeight: number;
  }): React.CSSProperties;
}

// 基于 flex 布局的实现
class LayoutSolutionFlex implements LayoutSolution {
  constructor(private containerHeight: number) {}

  getContainerStyle(): React.CSSProperties {
    return {
      display: "flex",
      flexDirection: "column",
      height: this.containerHeight,
    };
  }

  getScrollStyle(): React.CSSProperties {
    return { flex: 1 };
  }
}

// 基于动态计算的实现
class LayoutSolutionDynamic implements LayoutSolution {
  constructor(private containerHeight: number) {}
  getContainerStyle(): React.CSSProperties {
    return { height: this.containerHeight };
  }

  getScrollStyle(options: {
    fixedPaneHeight: number;
    fixedPaneBaseHeight: number;
  }): React.CSSProperties {
    return {
      height: this.containerHeight - options.fixedPaneHeight,
    };
  }
}

// 基于静态计算的实现，保证计算结果始终相同，不会引起布局波动
class LayoutSolutionStable implements LayoutSolution {
  constructor(private containerHeight: number) {}
  getContainerStyle(): React.CSSProperties {
    return { height: this.containerHeight };
  }

  getScrollStyle(options: {
    fixedPaneHeight: number;
    fixedPaneBaseHeight: number;
  }): React.CSSProperties {
    return {
      height: this.containerHeight - options.fixedPaneBaseHeight,
    };
  }
}

export default function Case1() {
  const groups = [
    { key: 0, showRowA: true, height: 500 },
    { key: 1, showRowA: true, height: 500 },
    { key: 2, showRowA: false, height: 495 },
  ];

  const [stickGroupKey, setStickGroupKey] = useState<number | null>(null);
  const groupNodesRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const ref = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const onGroupNodeUpdate = useCallback(
    (groupKey: number, el: HTMLDivElement | null) => {
      groupNodesRef.current[groupKey] = el;
    },
    []
  );

  useEffect(() => {
    const waitTime = 100;
    let timer: any = null;
    let latestTime = 0;

    function updateStickyGroup() {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) {
        return;
      }
      let foundGroupKey: number | null = null;
      for (const groupKey in groupNodesRef.current) {
        const groupNode = groupNodesRef.current[groupKey];
        if (!groupNode) continue;

        const rect = groupNode.getBoundingClientRect();
        const scrollRect = scrollContainer.getBoundingClientRect();
        if (rect.top <= scrollRect.top && rect.bottom >= scrollRect.top) {
          foundGroupKey = parseInt(groupKey);
          break;
        }
      }
      performance.mark("change-sticky-group-" + foundGroupKey);
      setStickGroupKey((prev) => {
        if (prev !== foundGroupKey) {
          debug("sticky group key changed", foundGroupKey);
          return foundGroupKey;
        }
        return prev;
      });
    }

    function onScroll() {
      debug("onScroll");
      performance.mark("onScroll");
      if (Date.now() - latestTime >= waitTime) {
        latestTime = Date.now();
        debug("updateStickyGroup, throttle");
        updateStickyGroup();
      }
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        debug("updateStickyGroup, debounce");
        updateStickyGroup();
      }, 300);
    }

    updateStickyGroup();
    scrollContainerRef.current?.addEventListener("scroll", onScroll);

    return () => {
      scrollContainerRef.current?.removeEventListener("scroll", onScroll);
    };
  }, []);

  const rowAVisible = useMemo(() => {
    const g = groups.find((g) => g.key === stickGroupKey);
    return g ? g.showRowA : false;
  }, [stickGroupKey, groups]);

  const counterRef = useRef(0);
  debug("app render", ++counterRef.current);
  performance.mark("app-render-" + stickGroupKey);

  // 这种实现会导致布局抖动，并且进入了一个死循环
  // const s = useRef<LayoutSolution>(new LayoutSolutionFlex(667));
  // 这种实现会导致布局抖动，虽然不会进入死循环，但是在用户滑动过程中，可能会跟着用户操作持续抖动
  const s = useRef<LayoutSolution>(new LayoutSolutionDynamic(667));
  // const s = useRef<LayoutSolution>(new LayoutSolutionStable(667));
  const rowAHeight = 48;
  const rowBHeight = 41;
  const solutionOptions = {
    fixedPaneBaseHeight: rowBHeight,
    fixedPaneHeight: rowAVisible ? rowBHeight + rowAHeight : rowBHeight,
  };

  const [visible, setVisible] = useState(true);

  return (
    <div className="container" style={s.current.getContainerStyle()}>
      <div className="c1-fixedPane" ref={ref}>
        {rowAVisible ? (
          <div className="c1-row-a">current: group #{stickGroupKey}</div>
        ) : null}
        <div className="c1-row-b">
          {visible ? <div className="c1-rect" /> : null}
          <div className="c1-rect" onClick={() => setVisible((v) => !v)} />
        </div>
      </div>

      <div
        className="c1-scroll-container"
        ref={scrollContainerRef}
        style={s.current.getScrollStyle(solutionOptions)}
      >
        {groups.map((group) => {
          return (
            <div key={group.key} ref={(el) => onGroupNodeUpdate(group.key, el)}>
              <GroupView group={group} />
            </div>
          );
        })}
        <div className="c1-footer" />
      </div>
    </div>
  );
}
