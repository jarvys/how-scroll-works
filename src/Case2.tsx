import "./Case2.css";

import debugFn from "debug";
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSearchParams } from "react-router";

const debug = debugFn("app:case2");

const loadData = (() => {
  const genId = (() => {
    let _id = 0;
    return () => ++_id;
  })();

  function delay(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  const TOTAL1 = 100;
  const TOTAL2 = 30;
  let cachedPage1 = 0;
  let cachedPage2 = 0;

  const data1: { key: number }[] = [];
  const data2: { key: number }[] = [];
  for (let i = 0; i < TOTAL1; i++) {
    data1.push({ key: genId() });
  }
  for (let i = 0; i < TOTAL2; i++) {
    data2.push({ key: genId() });
  }

  return async function (
    bizType: 1 | 2,
    page: number
  ): Promise<{ key: number }[]> {
    const cachedPage = bizType === 1 ? cachedPage1 : cachedPage2;
    const data = bizType === 1 ? data1 : data2;
    if (cachedPage >= page) {
      return delay(100).then(() => data.slice((page - 1) * 7, page * 7));
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        if ((page - 1) * 7 >= data.length) {
          resolve([]);
          return;
        }
        const result = [];
        for (let i = 0; i < 7; i++) {
          result.push({ key: (page - 1) * 7 + i });
        }
        if (bizType === 1) {
          cachedPage1 = page;
        } else if (bizType === 2) {
          cachedPage2 = page;
        }
        resolve(data.slice((page - 1) * 7, page * 7));
      }, 500);
    });
  };
})();

interface LayoutSolution {
  getScrollContainer(): EventTarget;
  getScrollTop(): number;
  getRootStyle(): CSSProperties;
  renderSkeleton(): React.ReactNode;
}

// 使用 viewport 作为 scroll container
class LayoutSolutionByViewPort implements LayoutSolution {
  constructor(private skeletonCards: number) {}

  getScrollTop() {
    return window.scrollY;
  }

  getScrollContainer() {
    return window;
  }

  getRootStyle() {
    return {};
  }

  renderSkeleton(): React.ReactNode {
    return Array.from({ length: this.skeletonCards }).map((_, index) => (
      <Card key={`skeleton-${index + 1}`} item={{ key: "" }} isSkeleton />
    ));
  }
}

// 使用 #c2-root 作为 scroll container
class LayoutSolutionByRoot implements LayoutSolution {
  constructor(private skeletonCards: number) {}

  getScrollTop(): number {
    return this.getScrollContainer().scrollTop;
  }

  getScrollContainer() {
    return document.getElementById("c2-root")!;
  }

  getRootStyle() {
    return {
      height: "100vh",
      overflow: "auto",
    };
  }

  renderSkeleton(): React.ReactNode {
    return Array.from({ length: this.skeletonCards }).map((_, index) => (
      <Card key={`skeleton-${index + 1}`} item={{ key: "" }} isSkeleton />
    ));
  }
}

function Card({
  item,
  isSkeleton = false,
}: {
  item: { key: string | number };
  isSkeleton?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="c2-card" ref={ref} id={`c2-card-${item.key}`}>
      <div className="c2-card-inner" id={`c2-card-inner-${item.key}`}>
        <div className="c2-card-img-wrap" id={`c2-card-img-wrap-${item.key}`}>
          {isSkeleton ? (
            <div className="c2-card-img-placeholder"></div>
          ) : (
            <div className="c2-card-img-placeholder">#{item.key}</div>
          )}
        </div>
        <div className="c2-card-info" id={`c2-card-info-${item.key}`}>
          {isSkeleton ? (
            <div className="c2-card-info-item c2-skeleton" />
          ) : (
            <div className="c2-card-info-item">#{item.key}</div>
          )}
          <div className="c2-card-info-item c2-skeleton" />
          <div
            className="c2-card-info-item c2-skeleton"
            style={{ width: "50%" }}
          />
          <div
            className="c2-card-info-item c2-skeleton"
            style={{ width: "50%" }}
          />
        </div>
      </div>
    </div>
  );
}

interface FeedRecord {
  type: string;
  data: { key: string | number };
}

function useInserted(dataSource: { key: number }[]) {
  // const [finalDataSource, setFinalDataSource] = useState<FeedRecord[]>([]);

  // let requestIdRef = useRef<number>(0);

  // useEffect(() => {
  //   setFinalDataSource((prev) => {
  //     if (dataSource.length === 0) {
  //       return [];
  //     }
  //     let latestKey: number = 65535;
  //     let index = 0;
  //     if (prev.length > 0) {
  //       const item = finalDataSource[finalDataSource.length - 1];
  //       latestKey = item.data.key as number;
  //       index = dataSource.findIndex((item) => item.key > latestKey);
  //     }
  //     return [
  //       ...prev,
  //       ...dataSource.slice(index).map((item) => {
  //         return { type: "card", data: item };
  //       }),
  //     ];
  //   });

  //   const requestId = ++requestIdRef.current;
  //   new Promise<FeedRecord[]>((resolve) => {
  //     setTimeout(() => {
  //       const ret: FeedRecord[] = [];
  //       dataSource.forEach((item, index) => {
  //         ret.push({ type: "card", data: item });
  //         if (
  //           (item.key % 7 === 0 || `${item.key}`.includes("7")) &&
  //           index * 2 < dataSource.length - 1
  //         ) {
  //           ret.push({ type: "divider", data: { key: "divider-" + item.key } });
  //         }
  //       });
  //       resolve(ret);
  //     }, 200);
  //   }).then((res) => {
  //     if (requestIdRef.current !== requestId) {
  //       debug("ignore old request", requestId, requestIdRef.current);
  //       return;
  //     }
  //     setFinalDataSource(res);
  //   });
  // }, [dataSource]);

  // return finalDataSource;

  const result = useMemo(() => {
    const ret: FeedRecord[] = [];
    dataSource?.forEach((item) => {
      ret.push({ type: "card", data: item });
    });
    return ret;
  }, [dataSource]);
  return result;
}

function VisibilityChange({
  children,
  onAppear,
  onDisappear,
  style,
}: {
  children?: any;
  onAppear?: () => void;
  onDisappear?: () => void;
  style?: CSSProperties;
}) {
  const onAppearRef = useRef(onAppear);
  onAppearRef.current = onAppear;
  const onDisappearRef = useRef(onDisappear);
  onDisappearRef.current = onDisappear;
  const ref = useRef<HTMLDivElement>(null);
  const visibleRef = useRef<boolean | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let flag = false;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            flag = true;
            break;
          }
        }

        if (visibleRef.current !== flag) {
          visibleRef.current = flag;
          if (flag) {
            onAppearRef?.current?.();
          } else {
            onDisappearRef?.current?.();
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} style={style} className="c2-visibility-change">
      {children}
    </div>
  );
}

export default function Case2() {
  const [tab, setTab] = useState<1 | 2>(1);
  const [page, setPage] = useState(1);
  const [dataSource, setDataSource] = useState<{ key: number }[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(() => {
    if (!hasMore) {
      debug("no more data");
      return;
    }
    if (loadingMore) {
      debug("loading more data, ignore");
      return;
    }

    debug("loadMore", tab, page);
    window.performance.mark(`c2-load-more-t${tab}-p${page}`);
    setLoadingMore(true);
    loadData(tab, page)
      .then((data) => {
        if (data.length) {
          setPage(page + 1);
          setDataSource((prev) => {
            const ret = [...prev, ...data];
            return ret;
          });
        } else {
          setHasMore(false);
        }
      })
      .finally(() => {
        setLoadingMore(false);
      });
  }, [hasMore, loadingMore, page, tab]);

  useEffect(() => {
    const originOverflowY = document.body.style.overflowY;
    const originBackgroundColor = document.body.style.backgroundColor;
    document.body.style.overflowY = "auto";
    document.body.style.backgroundColor = "#fff";
    return () => {
      document.body.style.overflowY = originOverflowY;
      document.body.style.backgroundColor = originBackgroundColor;
    };
  }, []);

  function handleChangeTab(nextTab: 1 | 2) {
    if (tab === nextTab) {
      return;
    }
    debug("change tab", nextTab);
    window.performance.mark(`c2-change-tag-${nextTab}`);
    setTab(nextTab);
    setDataSource([]);
    setHasMore(true);
    setLoadingMore(false);
    setPage(1);
  }

  const [headerStyle, setHeaderStyle] = useState({
    backgroundColor: "transparent",
  });
  const finalDataSource = useInserted(dataSource);

  const [searchParams] = useSearchParams();

  const s = useMemo(() => {
    const search = window.location.hash.split("?")[1];
    const searchParams = new URLSearchParams(search);
    const skeletonCards = searchParams.get("skeleton")
      ? +(searchParams.get("skeleton") as string)
      : 8;
    if (searchParams.get("s") === "root") {
      return new LayoutSolutionByRoot(skeletonCards);
    } else if (searchParams.get("s") === "viewport") {
      return new LayoutSolutionByViewPort(skeletonCards);
    } else {
      return new LayoutSolutionByViewPort(skeletonCards);
    }
  }, []);

  useEffect(() => {
    function listener() {
      debug("scroll", s.getScrollTop());
      window.performance.mark(`c2-scroll-${s.getScrollTop()}`);
    }

    s.getScrollContainer().addEventListener("scroll", listener);
    return () => {
      s.getScrollContainer().removeEventListener("scroll", listener);
    };
  }, [s]);

  window.performance.mark(`c2-render-t${tab}-${finalDataSource.length}`);

  const keepFooter = searchParams.get("keepFooter") === "true";

  return (
    <div id="c2-root" style={s.getRootStyle()}>
      <div className="c2-sticky-header" style={headerStyle}>
        sticky header
      </div>

      <div className="c2-header-content">
        <VisibilityChange
          onAppear={() => {
            setHeaderStyle({ backgroundColor: "transparent" });
          }}
          onDisappear={() => {
            setHeaderStyle({ backgroundColor: "#fff" });
          }}
        >
          <div className="c2-header-content-intersection" />
        </VisibilityChange>
        <div className="c2-header-card" id="c2-header-1" />
      </div>
      <div className="c2-header-content">
        <div className="c2-header-card" id="c2-header-2" />
      </div>

      <div className="c2-sticky-tab">
        {[1, 2].map((t) => (
          <div
            key={t}
            className={tab === t ? "c2-tab-item c2-active" : "c2-tab-item"}
            onClick={() => handleChangeTab(t as 1 | 2)}
          >
            tab-{t}
          </div>
        ))}
      </div>

      {finalDataSource
        .map((item) => {
          if (item.type === "card") {
            return <Card key={item.data.key} item={item.data} />;
          } else if (item.type === "divider") {
            return (
              <div
                className="c2-divider"
                data-key={item.data.key}
                key={item.data.key}
              />
            );
          } else {
            return null;
          }
        })
        .filter(Boolean)}

      <VisibilityChange
        onAppear={() => loadMore()}
        key={`tab-${tab}-page-${page}`}
      >
        {!finalDataSource?.length && hasMore ? (
          <div id="c2-skeleton-wrap">{s.renderSkeleton()}</div>
        ) : (
          <div
            className="c2-footer"
            style={{ display: keepFooter ? "none" : undefined }}
          >
            {hasMore ? "正在加载更多数据..." : "没有更多了"}
          </div>
        )}
      </VisibilityChange>
      {keepFooter ? (
        <div className="c2-footer">
          {hasMore ? "正在加载更多数据..." : "没有更多了"}
        </div>
      ) : null}
    </div>
  );
}
