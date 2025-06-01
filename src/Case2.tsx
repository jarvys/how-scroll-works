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

import img from "./img.webp";

const debug = debugFn("app:case2");

const genId = (() => {
  let _id = 0;
  return () => ++_id;
})();

let cachedPage1 = 0;
const data1: { key: number }[] = [];
for (let i = 0; i < 100; i++) {
  data1.push({ key: genId() });
}
let cachedPage2 = 0;
const data2: { key: number }[] = [];
for (let i = 0; i < 4; i++) {
  data2.push({ key: genId() });
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function loadData(bizType: 1 | 2, page: number): Promise<{ key: number }[]> {
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
}

function Card({
  item,
  isSkeleton = false,
}: {
  item: { key: string | number };
  isSkeleton?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const rect = ref.current?.getBoundingClientRect();
  //   debug(`Card ${item.key} mounted`, rect);
  // }, []);

  let total = 0;
  for (let i = 0; i < 1000000; i++) {
    total += i; // Simulate some heavy computation
  }

  return (
    <div className="c2-card" ref={ref} data-key={item.key}>
      <div className="c2-card-inner">
        <div className="c2-card-img-wrap">
          {isSkeleton ? (
            <div className="c2-card-img-placeholder"></div>
          ) : (
            <img src={img} alt="" />
          )}
        </div>
        <div className="c2-card-info">
          {isSkeleton ? (
            <div
              className="c2-card-info-item"
              style={{ background: "#f5f5f5", height: 20, borderRadius: 4 }}
            />
          ) : (
            <div className="c2-card-info-item">#{item.key}</div>
          )}
          <div
            className="c2-card-info-item"
            style={{ background: "#f5f5f5", height: 20, borderRadius: 4 }}
          />
          <div
            className="c2-card-info-item"
            style={{
              background: "#f5f5f5",
              height: 18,
              borderRadius: 4,
              width: "50%",
            }}
          />
          <div
            className="c2-card-info-item"
            style={{
              background: "#f5f5f5",
              height: 18,
              borderRadius: 4,
              width: "50%",
            }}
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
    <div ref={ref} style={style}>
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

  // debug("render", dataSource);

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

  window.performance.mark('c2-render');

  return (
    <div>
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
        <div className="c2-floor" />
      </div>
      <div className="c2-header-content">
        <div className="c2-floor" />
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
          <div>
            <Card key="skeleton-1" item={{ key: "" }} isSkeleton />
            <Card key="skeleton-2" item={{ key: "" }} isSkeleton />
            <Card key="skeleton-3" item={{ key: "" }} isSkeleton />
            <Card key="skeleton-4" item={{ key: "" }} isSkeleton />
            <Card key="skeleton-5" item={{ key: "" }} isSkeleton />
            <Card key="skeleton-6" item={{ key: "" }} isSkeleton />
            <Card key="skeleton-7" item={{ key: "" }} isSkeleton />
            <Card key="skeleton-8" item={{ key: "" }} isSkeleton />
          </div>
        ) : (
          <div className="c2-footer">
            {hasMore ? "正在加载更多数据..." : "没有更多了"}
          </div>
        )}
      </VisibilityChange>
    </div>
  );
}
