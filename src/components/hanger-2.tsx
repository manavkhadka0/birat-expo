"use client";

import React, { useEffect, useRef, useCallback } from "react";

type StallInfo = {
  id: string;
  companyName?: string;
};

type HangerOneProps = {
  reservedStalls: StallInfo[];
  bookedStalls: StallInfo[];
  primeStallsType1: string[];
  primeStallsType2: string[];
  notAvailableStalls: string[];
  toiletStalls: string[];
  selectedStalls: string[];
  onAvailableStallClick: (stallId: string) => void;
  totalPrice: number;
  setTotalPrice: (price: number) => void;
};

const Hanger2: React.FC<HangerOneProps> = ({
  bookedStalls,
  reservedStalls,
  primeStallsType1,
  primeStallsType2,
  notAvailableStalls,
  toiletStalls,
  selectedStalls,
  onAvailableStallClick,
  totalPrice,
  setTotalPrice,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const updateStallColorAndCursor = useCallback(
    (
      svg: SVGSVGElement,
      clipPathId: string,
      color: string,
      cursor: string,
      opacity: number = 1
    ) => {
      const stall = svg.querySelector(
        `g[clip-path="url(#${clipPathId})"] path`
      );
      if (stall) {
        stall.setAttribute("fill", color);
        stall.setAttribute("fill-opacity", opacity.toString());
        const parentG = stall.closest("g[clip-path]");
        if (parentG) {
          (parentG as HTMLElement).style.cursor = cursor;
        }
      }
    },
    []
  );

  const showTooltip = useCallback((content: string, element: HTMLElement) => {
    const tooltip = document.createElement("div");
    tooltip.textContent = content;
    tooltip.style.position = "absolute";
    tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    tooltip.style.color = "white";
    tooltip.style.padding = "5px";
    tooltip.style.borderRadius = "3px";
    tooltip.style.zIndex = "1000";

    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left - 20}px`;
    tooltip.style.top = `${rect.bottom + 5}px`;

    document.body.appendChild(tooltip);
  }, []);

  const hideTooltip = useCallback(() => {
    const tooltip = document.querySelector("div[style*='position: absolute']");
    if (tooltip) {
      tooltip.remove();
    }
  }, []);

  const setStallInteraction = useCallback(
    (
      svg: SVGSVGElement,
      clipPathId: string,
      defaultColor: string,
      isClickable: boolean,
      isPrime: boolean,
      companyName?: string
    ) => {
      const parentG = svg.querySelector(
        `g[clip-path="url(#${clipPathId})"]`
      ) as HTMLElement | null;

      if (parentG) {
        const stallPrice = isPrime ? 60000 : 50000;
        const tooltipContent = `${
          companyName
            ? `${companyName}`
            : `Stall ${clipPathId}- Rs. ${stallPrice.toLocaleString()}`
        } `;

        parentG.onmouseover = () => {
          updateStallColorAndCursor(
            svg,
            clipPathId,
            defaultColor,
            isClickable ? "pointer" : "not-allowed",
            0.5
          );
          showTooltip(tooltipContent, parentG);
        };
        parentG.onmouseout = () => {
          updateStallColorAndCursor(
            svg,
            clipPathId,
            selectedStalls.includes(clipPathId) ? "#00ff00" : defaultColor,
            isClickable ? "pointer" : "not-allowed",
            1
          );
          hideTooltip();
        };
        if (isClickable) {
          parentG.onclick = () => {
            onAvailableStallClick(clipPathId);
            const newPrice = selectedStalls.includes(clipPathId)
              ? totalPrice - stallPrice
              : totalPrice + stallPrice;
            setTotalPrice(newPrice);
          };
        } else {
          parentG.onclick = null;
        }
      }
    },
    [
      updateStallColorAndCursor,
      showTooltip,
      hideTooltip,
      selectedStalls,
      onAvailableStallClick,
      totalPrice,
      setTotalPrice,
    ]
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const bookedStallIds = new Set(bookedStalls.map((s) => s.id));
    const reservedStallIds = new Set(reservedStalls.map((s) => s.id));
    const primeStallsSet = new Set([...primeStallsType1, ...primeStallsType2]);
    const notAvailableSet = new Set(notAvailableStalls);
    const toiletStallsSet = new Set(toiletStalls);

    const allStalls = Array.from(svg.querySelectorAll("g[clip-path] path"));
    allStalls.forEach((stall) => {
      const parentG = stall.closest("g[clip-path]");
      const clipPathId = parentG
        ?.getAttribute("clip-path")
        ?.replace("url(#", "")
        .replace(")", "");
      if (!clipPathId) return;

      if (reservedStallIds.has(clipPathId)) {
        updateStallColorAndCursor(svg, clipPathId, "#ffcc00", "not-allowed");
        setStallInteraction(
          svg,
          clipPathId,
          "#ffcc00",
          false,
          false,
          reservedStalls.find((s) => s.id === clipPathId)?.companyName
        );
      } else if (bookedStallIds.has(clipPathId)) {
        updateStallColorAndCursor(svg, clipPathId, "#fb2e01", "not-allowed");
        setStallInteraction(
          svg,
          clipPathId,
          "#fb2e01",
          false,
          false,
          bookedStalls.find((s) => s.id === clipPathId)?.companyName
        );
      } else if (primeStallsSet.has(clipPathId)) {
        const color = selectedStalls.includes(clipPathId)
          ? "#00ff00"
          : primeStallsType1.includes(clipPathId)
          ? "#f5aeae"
          : "#f3efa3";
        updateStallColorAndCursor(svg, clipPathId, color, "pointer");
        setStallInteraction(svg, clipPathId, color, true, true);
      } else if (notAvailableSet.has(clipPathId)) {
        updateStallColorAndCursor(svg, clipPathId, "#fff", "normal");
      } else if (toiletStallsSet.has(clipPathId)) {
        updateStallColorAndCursor(svg, clipPathId, "#26abe2", "not-allowed");
      } else {
        const defaultColor = selectedStalls.includes(clipPathId)
          ? "#00ff00"
          : "#fff";
        updateStallColorAndCursor(svg, clipPathId, defaultColor, "pointer");
        setStallInteraction(svg, clipPathId, defaultColor, true, false);
      }
    });

    // Update total price
    const calculateTotalPrice = () => {
      const primeStallCount = selectedStalls.filter((stall) =>
        primeStallsSet.has(stall)
      ).length;
      const regularStallCount = selectedStalls.length - primeStallCount;
      return primeStallCount * 60000 + regularStallCount * 50000;
    };

    setTotalPrice(calculateTotalPrice());
  }, [
    reservedStalls,
    bookedStalls,
    primeStallsType1,
    primeStallsType2,
    notAvailableStalls,
    toiletStalls,
    selectedStalls,
    updateStallColorAndCursor,
    setStallInteraction,
    setTotalPrice,
  ]);

  return (
    <svg
      version="1.0"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 2155.5 604.499982"
      zoomAndPan="magnify"
      ref={svgRef}
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <g></g>
        <clipPath id="eb1d587ec6">
          <path
            clip-rule="nonzero"
            d="M 0.640625 0 L 2154.359375 0 L 2154.359375 604 L 0.640625 604 Z M 0.640625 0"
          ></path>
        </clipPath>
        <clipPath id="B96">
          <path
            clip-rule="nonzero"
            d="M 171.734375 402.832031 L 271.175781 402.832031 L 271.175781 603.664062 L 171.734375 603.664062 Z M 171.734375 402.832031"
          ></path>
        </clipPath>
        <clipPath id="B95">
          <path
            clip-rule="nonzero"
            d="M 271.183594 502.976562 L 370.621094 502.976562 L 370.621094 603.859375 L 271.183594 603.859375 Z M 271.183594 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B94">
          <path
            clip-rule="nonzero"
            d="M 370.628906 502.976562 L 470.066406 502.976562 L 470.066406 603.859375 L 370.628906 603.859375 Z M 370.628906 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B93">
          <path
            clip-rule="nonzero"
            d="M 470.078125 502.976562 L 569.515625 502.976562 L 569.515625 603.859375 L 470.078125 603.859375 Z M 470.078125 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B92">
          <path
            clip-rule="nonzero"
            d="M 569.523438 502.976562 L 668.960938 502.976562 L 668.960938 603.859375 L 569.523438 603.859375 Z M 569.523438 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B91">
          <path
            clip-rule="nonzero"
            d="M 668.972656 502.976562 L 768.410156 502.976562 L 768.410156 603.859375 L 668.972656 603.859375 Z M 668.972656 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B90">
          <path
            clip-rule="nonzero"
            d="M 761.675781 502.976562 L 861.113281 502.976562 L 861.113281 603.859375 L 761.675781 603.859375 Z M 761.675781 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B89">
          <path
            clip-rule="nonzero"
            d="M 861.121094 502.976562 L 960.558594 502.976562 L 960.558594 603.859375 L 861.121094 603.859375 Z M 861.121094 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B88">
          <path
            clip-rule="nonzero"
            d="M 960.570312 502.976562 L 1060.007812 502.976562 L 1060.007812 603.859375 L 960.570312 603.859375 Z M 960.570312 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B87">
          <path
            clip-rule="nonzero"
            d="M 1060.015625 502.976562 L 1159.453125 502.976562 L 1159.453125 603.859375 L 1060.015625 603.859375 Z M 1060.015625 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B86">
          <path
            clip-rule="nonzero"
            d="M 1159.464844 502.976562 L 1258.902344 502.976562 L 1258.902344 603.859375 L 1159.464844 603.859375 Z M 1159.464844 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B85">
          <path
            clip-rule="nonzero"
            d="M 1258.910156 502.976562 L 1358.347656 502.976562 L 1358.347656 603.859375 L 1258.910156 603.859375 Z M 1258.910156 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B84">
          <path
            clip-rule="nonzero"
            d="M 1358.359375 502.976562 L 1457.796875 502.976562 L 1457.796875 603.859375 L 1358.359375 603.859375 Z M 1358.359375 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B83">
          <path
            clip-rule="nonzero"
            d="M 1457.804688 502.976562 L 1557.242188 502.976562 L 1557.242188 603.859375 L 1457.804688 603.859375 Z M 1457.804688 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B82">
          <path
            clip-rule="nonzero"
            d="M 1557.25 502.976562 L 1656.691406 502.976562 L 1656.691406 603.859375 L 1557.25 603.859375 Z M 1557.25 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B81">
          <path
            clip-rule="nonzero"
            d="M 1656.699219 502.976562 L 1756.136719 502.976562 L 1756.136719 603.859375 L 1656.699219 603.859375 Z M 1656.699219 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B80">
          <path
            clip-rule="nonzero"
            d="M 1756.144531 502.976562 L 1855.585938 502.976562 L 1855.585938 603.859375 L 1756.144531 603.859375 Z M 1756.144531 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B79">
          <path
            clip-rule="nonzero"
            d="M 1855.59375 502.976562 L 1955.03125 502.976562 L 1955.03125 603.859375 L 1855.59375 603.859375 Z M 1855.59375 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B78">
          <path
            clip-rule="nonzero"
            d="M 1955.039062 502.976562 L 2054.476562 502.976562 L 2054.476562 603.859375 L 1955.039062 603.859375 Z M 1955.039062 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B77">
          <path
            clip-rule="nonzero"
            d="M 2054.488281 502.976562 L 2153.925781 502.976562 L 2153.925781 603.859375 L 2054.488281 603.859375 Z M 2054.488281 502.976562"
          ></path>
        </clipPath>
        <clipPath id="B98">
          <path
            clip-rule="nonzero"
            d="M 370.628906 301.1875 L 470.066406 301.1875 L 470.066406 402.070312 L 370.628906 402.070312 Z M 370.628906 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B99">
          <path
            clip-rule="nonzero"
            d="M 465.257812 301.1875 L 564.695312 301.1875 L 564.695312 402.070312 L 465.257812 402.070312 Z M 465.257812 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B100">
          <path
            clip-rule="nonzero"
            d="M 563.957031 301.1875 L 663.394531 301.1875 L 663.394531 402.070312 L 563.957031 402.070312 Z M 563.957031 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B101">
          <path
            clip-rule="nonzero"
            d="M 663.402344 300.589844 L 762.839844 300.589844 L 762.839844 401.472656 L 663.402344 401.472656 Z M 663.402344 300.589844"
          ></path>
        </clipPath>
        <clipPath id="B102">
          <path
            clip-rule="nonzero"
            d="M 762.425781 301.1875 L 861.863281 301.1875 L 861.863281 402.070312 L 762.425781 402.070312 Z M 762.425781 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B103">
          <path
            clip-rule="nonzero"
            d="M 861.121094 301.1875 L 960.558594 301.1875 L 960.558594 402.070312 L 861.121094 402.070312 Z M 861.121094 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B104">
          <path
            clip-rule="nonzero"
            d="M 960.945312 301.1875 L 1060.382812 301.1875 L 1060.382812 402.070312 L 960.945312 402.070312 Z M 960.945312 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B105">
          <path
            clip-rule="nonzero"
            d="M 1060.015625 301.1875 L 1159.453125 301.1875 L 1159.453125 402.070312 L 1060.015625 402.070312 Z M 1060.015625 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B106">
          <path
            clip-rule="nonzero"
            d="M 1159.464844 301.1875 L 1258.902344 301.1875 L 1258.902344 402.070312 L 1159.464844 402.070312 Z M 1159.464844 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B107">
          <path
            clip-rule="nonzero"
            d="M 1258.910156 301.1875 L 1358.347656 301.1875 L 1358.347656 402.070312 L 1258.910156 402.070312 Z M 1258.910156 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B108">
          <path
            clip-rule="nonzero"
            d="M 1358.359375 301.1875 L 1457.796875 301.1875 L 1457.796875 402.070312 L 1358.359375 402.070312 Z M 1358.359375 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B109">
          <path
            clip-rule="nonzero"
            d="M 1457.804688 301.1875 L 1557.242188 301.1875 L 1557.242188 402.070312 L 1457.804688 402.070312 Z M 1457.804688 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B110">
          <path
            clip-rule="nonzero"
            d="M 1557.25 301.1875 L 1656.691406 301.1875 L 1656.691406 402.070312 L 1557.25 402.070312 Z M 1557.25 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B111">
          <path
            clip-rule="nonzero"
            d="M 1656.699219 301.1875 L 1756.136719 301.1875 L 1756.136719 402.070312 L 1656.699219 402.070312 Z M 1656.699219 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B112">
          <path
            clip-rule="nonzero"
            d="M 1756.144531 301.1875 L 1855.585938 301.1875 L 1855.585938 402.070312 L 1756.144531 402.070312 Z M 1756.144531 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B113">
          <path
            clip-rule="nonzero"
            d="M 1855.59375 301.1875 L 1955.03125 301.1875 L 1955.03125 402.070312 L 1855.59375 402.070312 Z M 1855.59375 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B130">
          <path
            clip-rule="nonzero"
            d="M 465.257812 200.289062 L 564.695312 200.289062 L 564.695312 301.175781 L 465.257812 301.175781 Z M 465.257812 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B129">
          <path
            clip-rule="nonzero"
            d="M 564.703125 200.289062 L 664.144531 200.289062 L 664.144531 301.175781 L 564.703125 301.175781 Z M 564.703125 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B128">
          <path
            clip-rule="nonzero"
            d="M 664.152344 200.289062 L 763.589844 200.289062 L 763.589844 301.175781 L 664.152344 301.175781 Z M 664.152344 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B127">
          <path
            clip-rule="nonzero"
            d="M 763.597656 200.289062 L 863.035156 200.289062 L 863.035156 301.175781 L 763.597656 301.175781 Z M 763.597656 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B126">
          <path
            clip-rule="nonzero"
            d="M 863.046875 200.289062 L 962.484375 200.289062 L 962.484375 301.175781 L 863.046875 301.175781 Z M 863.046875 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B125">
          <path
            clip-rule="nonzero"
            d="M 955.75 200.289062 L 1055.1875 200.289062 L 1055.1875 301.175781 L 955.75 301.175781 Z M 955.75 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B124">
          <path
            clip-rule="nonzero"
            d="M 1055.195312 200.289062 L 1154.632812 200.289062 L 1154.632812 301.175781 L 1055.195312 301.175781 Z M 1055.195312 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B123">
          <path
            clip-rule="nonzero"
            d="M 1154.644531 200.289062 L 1254.082031 200.289062 L 1254.082031 301.175781 L 1154.644531 301.175781 Z M 1154.644531 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B122">
          <path
            clip-rule="nonzero"
            d="M 1254.089844 200.289062 L 1353.527344 200.289062 L 1353.527344 301.175781 L 1254.089844 301.175781 Z M 1254.089844 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B121">
          <path
            clip-rule="nonzero"
            d="M 1353.539062 200.289062 L 1452.976562 200.289062 L 1452.976562 301.175781 L 1353.539062 301.175781 Z M 1353.539062 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B120">
          <path
            clip-rule="nonzero"
            d="M 1452.984375 200.289062 L 1552.421875 200.289062 L 1552.421875 301.175781 L 1452.984375 301.175781 Z M 1452.984375 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B119">
          <path
            clip-rule="nonzero"
            d="M 1552.433594 200.289062 L 1651.871094 200.289062 L 1651.871094 301.175781 L 1552.433594 301.175781 Z M 1552.433594 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B118">
          <path
            clip-rule="nonzero"
            d="M 1651.878906 200.289062 L 1751.316406 200.289062 L 1751.316406 301.175781 L 1651.878906 301.175781 Z M 1651.878906 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B117">
          <path
            clip-rule="nonzero"
            d="M 1751.328125 200.289062 L 1850.765625 200.289062 L 1850.765625 301.175781 L 1751.328125 301.175781 Z M 1751.328125 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B116">
          <path
            clip-rule="nonzero"
            d="M 1850.773438 200.289062 L 1950.210938 200.289062 L 1950.210938 301.175781 L 1850.773438 301.175781 Z M 1850.773438 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B115">
          <path
            clip-rule="nonzero"
            d="M 1950.222656 200.289062 L 2049.660156 200.289062 L 2049.660156 301.175781 L 1950.222656 301.175781 Z M 1950.222656 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B134">
          <path
            clip-rule="nonzero"
            d="M 271.183594 0 L 370.621094 0 L 370.621094 100.886719 L 271.183594 100.886719 Z M 271.183594 0"
          ></path>
        </clipPath>
        <clipPath id="B135">
          <path
            clip-rule="nonzero"
            d="M 370.628906 0 L 470.066406 0 L 470.066406 100.886719 L 370.628906 100.886719 Z M 370.628906 0"
          ></path>
        </clipPath>
        <clipPath id="B136">
          <path
            clip-rule="nonzero"
            d="M 470.078125 0 L 569.515625 0 L 569.515625 100.886719 L 470.078125 100.886719 Z M 470.078125 0"
          ></path>
        </clipPath>
        <clipPath id="B137">
          <path
            clip-rule="nonzero"
            d="M 569.523438 0 L 668.960938 0 L 668.960938 100.886719 L 569.523438 100.886719 Z M 569.523438 0"
          ></path>
        </clipPath>
        <clipPath id="B138">
          <path
            clip-rule="nonzero"
            d="M 668.972656 0 L 768.410156 0 L 768.410156 100.886719 L 668.972656 100.886719 Z M 668.972656 0"
          ></path>
        </clipPath>
        <clipPath id="B139">
          <path
            clip-rule="nonzero"
            d="M 761.675781 0 L 861.113281 0 L 861.113281 100.886719 L 761.675781 100.886719 Z M 761.675781 0"
          ></path>
        </clipPath>
        <clipPath id="B140">
          <path
            clip-rule="nonzero"
            d="M 861.121094 0 L 960.558594 0 L 960.558594 100.886719 L 861.121094 100.886719 Z M 861.121094 0"
          ></path>
        </clipPath>
        <clipPath id="B141">
          <path
            clip-rule="nonzero"
            d="M 960.570312 0 L 1060.007812 0 L 1060.007812 100.886719 L 960.570312 100.886719 Z M 960.570312 0"
          ></path>
        </clipPath>
        <clipPath id="B142">
          <path
            clip-rule="nonzero"
            d="M 1060.015625 0 L 1159.453125 0 L 1159.453125 100.886719 L 1060.015625 100.886719 Z M 1060.015625 0"
          ></path>
        </clipPath>
        <clipPath id="B143">
          <path
            clip-rule="nonzero"
            d="M 1159.464844 0 L 1258.902344 0 L 1258.902344 100.886719 L 1159.464844 100.886719 Z M 1159.464844 0"
          ></path>
        </clipPath>
        <clipPath id="B145">
          <path
            clip-rule="nonzero"
            d="M 1351.832031 0 L 1451.269531 0 L 1451.269531 100.886719 L 1351.832031 100.886719 Z M 1351.832031 0"
          ></path>
        </clipPath>
        <clipPath id="B146">
          <path
            clip-rule="nonzero"
            d="M 1451.28125 0 L 1550.71875 0 L 1550.71875 100.886719 L 1451.28125 100.886719 Z M 1451.28125 0"
          ></path>
        </clipPath>
        <clipPath id="B147">
          <path
            clip-rule="nonzero"
            d="M 1550.726562 0 L 1650.164062 0 L 1650.164062 100.886719 L 1550.726562 100.886719 Z M 1550.726562 0"
          ></path>
        </clipPath>
        <clipPath id="B148">
          <path
            clip-rule="nonzero"
            d="M 1650.175781 0 L 1749.613281 0 L 1749.613281 100.886719 L 1650.175781 100.886719 Z M 1650.175781 0"
          ></path>
        </clipPath>
        <clipPath id="B149">
          <path
            clip-rule="nonzero"
            d="M 1749.621094 0 L 1849.058594 0 L 1849.058594 100.886719 L 1749.621094 100.886719 Z M 1749.621094 0"
          ></path>
        </clipPath>
        <clipPath id="B150">
          <path
            clip-rule="nonzero"
            d="M 1849.070312 0 L 1948.507812 0 L 1948.507812 100.886719 L 1849.070312 100.886719 Z M 1849.070312 0"
          ></path>
        </clipPath>
        <clipPath id="B151">
          <path
            clip-rule="nonzero"
            d="M 1948.515625 0 L 2047.953125 0 L 2047.953125 100.886719 L 1948.515625 100.886719 Z M 1948.515625 0"
          ></path>
        </clipPath>
        <clipPath id="B152">
          <path
            clip-rule="nonzero"
            d="M 2047.964844 0 L 2147.402344 0 L 2147.402344 100.886719 L 2047.964844 100.886719 Z M 2047.964844 0"
          ></path>
        </clipPath>
        <clipPath id="B133">
          <path
            clip-rule="nonzero"
            d="M 171.734375 0 L 271.175781 0 L 271.175781 200.832031 L 171.734375 200.832031 Z M 171.734375 0"
          ></path>
        </clipPath>
        <clipPath id="B97">
          <path
            clip-rule="nonzero"
            d="M 171.734375 301.1875 L 271.175781 301.1875 L 271.175781 402.070312 L 171.734375 402.070312 Z M 171.734375 301.1875"
          ></path>
        </clipPath>
        <clipPath id="B132">
          <path
            clip-rule="nonzero"
            d="M 171.734375 200.289062 L 271.175781 200.289062 L 271.175781 301.175781 L 171.734375 301.175781 Z M 171.734375 200.289062"
          ></path>
        </clipPath>
        <clipPath id="B114">
          <path
            clip-rule="nonzero"
            d="M 1953.59375 301.933594 L 2053.03125 301.933594 L 2053.03125 402.820312 L 1953.59375 402.820312 Z M 1953.59375 301.933594"
          ></path>
        </clipPath>
        <clipPath id="B131">
          <path
            clip-rule="nonzero"
            d="M 370.835938 201.996094 L 470.273438 201.996094 L 470.273438 302.882812 L 370.835938 302.882812 Z M 370.835938 201.996094"
          ></path>
        </clipPath>
        <clipPath id="B144">
          <path
            clip-rule="nonzero"
            d="M 1254.089844 0.824219 L 1353.527344 0.824219 L 1353.527344 101.710938 L 1254.089844 101.710938 Z M 1254.089844 0.824219"
          ></path>
        </clipPath>
      </defs>
      <g clip-path="url(#eb1d587ec6)">
        <path
          fill-rule="nonzero"
          fill-opacity="1"
          d="M 0.640625 0 L 2154.359375 0 L 2154.359375 604 L 0.640625 604 Z M 0.640625 0"
          fill="#ffffff"
        ></path>
      </g>
      <g clip-path="url(#B96)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00144661 0.00250461 L 132.699644 0.00250461 L 132.699644 268.265853 L 0.00144661 268.265853 Z M 0.00144661 0.00250461"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 171.733291, 402.830154)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(189.916663, 515.237178)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(211.877507, 515.237178)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(232.417996, 515.237178)">
          <g>
            <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B95)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000366183 0.0011752 L 132.693364 0.0011752 L 132.693364 134.62285 L 0.000366183 134.62285 Z M 0.000366183 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 271.183319, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(290.206862, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(312.167705, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(332.708195, 565.174235)">
          <g>
            <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B94)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00214129 0.0011752 L 132.690857 0.0011752 L 132.690857 134.62285 L -0.00214129 134.62285 Z M -0.00214129 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 370.630511, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(389.419872, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(411.380715, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(431.921205, 565.174235)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B93)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000659885 0.0011752 L 132.693658 0.0011752 L 132.693658 134.62285 L 0.000659885 134.62285 Z M 0.000659885 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 470.07763, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(489.265119, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(511.225962, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(531.766452, 565.174235)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B92)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00186038 0.0011752 L 132.691138 0.0011752 L 132.691138 134.62285 L -0.00186038 134.62285 Z M -0.00186038 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 569.524832, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(589.215786, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(611.176629, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(631.717119, 565.174235)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B91)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000831988 0.0011752 L 132.69383 0.0011752 L 132.69383 134.62285 L 0.000831988 134.62285 Z M 0.000831988 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 668.972033, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(688.932296, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(710.893139, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(731.433629, 565.174235)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B90)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00138819 0.0011752 L 132.694386 0.0011752 L 132.694386 134.62285 L 0.00138819 134.62285 Z M 0.00138819 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 761.674741, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(778.918501, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(800.879344, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(821.419834, 565.174235)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B89)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00103608 0.0011752 L 132.691962 0.0011752 L 132.691962 134.62285 L -0.00103608 134.62285 Z M -0.00103608 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 861.12187, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(879.934645, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(901.895488, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(921.202925, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B88)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00168829 0.0011752 L 132.694686 0.0011752 L 132.694686 134.62285 L 0.00168829 134.62285 Z M 0.00168829 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 960.569047, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(979.990717, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1001.951561, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1021.258997, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B87)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.000735977 0.0011752 L 132.692262 0.0011752 L 132.692262 134.62285 L -0.000735977 134.62285 Z M -0.000735977 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1060.016177, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1081.217672, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1103.178516, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1122.485952, 565.174235)">
          <g>
            <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B86)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.0021164 0.0011752 L 132.695114 0.0011752 L 132.695114 134.62285 L 0.0021164 134.62285 Z M 0.0021164 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1159.463258, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1178.264395, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1200.225239, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1219.532675, 565.174235)">
          <g>
            <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B85)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.000403874 0.0011752 L 132.692594 0.0011752 L 132.692594 134.62285 L -0.000403874 134.62285 Z M -0.000403874 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1258.910459, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1278.542916, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1300.503759, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1319.811196, 565.174235)">
          <g>
            <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B84)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.0023205 0.0011752 L 132.695318 0.0011752 L 132.695318 134.62285 L 0.0023205 134.62285 Z M 0.0023205 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1358.357636, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1377.767645, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1399.728488, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1419.035925, 565.174235)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B83)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.000199771 0.0011752 L 132.692798 0.0011752 L 132.692798 134.62285 L -0.000199771 134.62285 Z M -0.000199771 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1457.804837, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1477.61293, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1499.573774, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1518.88121, 565.174235)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B82)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00252804 0.0011752 L 132.695683 0.0011752 L 132.695683 134.62285 L -0.00252804 134.62285 Z M -0.00252804 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1557.251894, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1577.563501, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1599.524345, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1618.831781, 565.174235)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B81)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.0000043318 0.0011752 L 132.693002 0.0011752 L 132.693002 134.62285 L 0.0000043318 134.62285 Z M 0.0000043318 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1656.699216, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1677.268398, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1699.229241, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1718.536678, 565.174235)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B80)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00235594 0.0011752 L 132.695855 0.0011752 L 132.695855 134.62285 L -0.00235594 134.62285 Z M -0.00235594 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1756.146297, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1773.998976, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1795.959819, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1815.267256, 565.174235)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B79)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000528435 0.0011752 L 132.693526 0.0011752 L 132.693526 134.62285 L 0.000528435 134.62285 Z M 0.000528435 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1855.593354, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1876.174269, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1898.135113, 565.174235)">
          <g>
            <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1913.899471, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B78)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00215183 0.0011752 L 132.690846 0.0011752 L 132.690846 134.62285 L -0.00215183 134.62285 Z M -0.00215183 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1955.040675, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1976.242147, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1998.20299, 565.174235)">
          <g>
            <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2013.967348, 565.174235)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B77)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000572537 0.0011752 L 132.69357 0.0011752 L 132.69357 134.62285 L 0.000572537 134.62285 Z M 0.000572537 0.0011752"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 2054.487852, 502.975682)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2077.457297, 565.174235)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2099.41814, 565.174235)">
          <g>
            <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2115.182498, 565.174235)">
          <g>
            <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B98)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00214129 0.00216361 L 132.690857 0.00216361 L 132.690857 134.623839 L -0.00214129 134.623839 Z M -0.00214129 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 370.630511, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(389.44329, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(411.404134, 363.384432)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(431.944623, 363.384432)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B99)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00013206 0.00216361 L 132.69313 0.00216361 L 132.69313 134.623839 L 0.00013206 134.623839 Z M 0.00013206 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 465.257714, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(483.449932, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(505.410775, 363.384432)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(525.951265, 363.384432)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B100)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00199723 0.00216361 L 132.694995 0.00216361 L 132.694995 134.623839 L 0.00199723 134.623839 Z M 0.00199723 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 563.955535, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(571.73837, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(593.699213, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(610.712233, 363.384432)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(633.156932, 363.384432)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B101)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.000427038 0.000763837 L 132.692571 0.000763837 L 132.692571 134.622439 L -0.000427038 134.622439 Z M -0.000427038 0.000763837"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 663.402664, 300.589271)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(673.902002, 362.787825)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(695.862845, 362.787825)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(712.875865, 362.787825)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(735.320565, 362.787825)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B102)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00221539 0.00216361 L 132.695213 0.00216361 L 132.695213 134.623839 L 0.00221539 134.623839 Z M 0.00221539 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 762.424121, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(772.654151, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(794.614994, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(811.628014, 363.384432)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(834.072713, 363.384432)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B103)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00103608 0.00216361 L 132.691962 0.00216361 L 132.691962 134.623839 L -0.00103608 134.623839 Z M -0.00103608 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 861.12187, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(870.860119, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(892.820963, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(909.833982, 363.384432)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(932.278682, 363.384432)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B104)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00210189 0.00216361 L 132.6951 0.00216361 L 132.6951 134.623839 L 0.00210189 134.623839 Z M 0.00210189 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 960.943737, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(970.283902, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(992.244746, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1009.257765, 363.384432)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1031.702465, 363.384432)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B105)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.000735977 0.00216361 L 132.692262 0.00216361 L 132.692262 134.623839 L -0.000735977 134.623839 Z M -0.000735977 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1060.016177, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1069.578862, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1091.539705, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1108.552725, 363.384432)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1130.997424, 363.384432)">
          <g>
            <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B106)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.0021164 0.00216361 L 132.695114 0.00216361 L 132.695114 134.623839 L 0.0021164 134.623839 Z M 0.0021164 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1159.463258, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1168.194599, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1190.155443, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1207.168462, 363.384432)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1229.613162, 363.384432)">
          <g>
            <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B107)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.000403874 0.00216361 L 132.692594 0.00216361 L 132.692594 134.623839 L -0.000403874 134.623839 Z M -0.000403874 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1258.910459, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1270.030426, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1291.991269, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1309.004289, 363.384432)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1331.448988, 363.384432)">
          <g>
            <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B108)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.0023205 0.00216361 L 132.695318 0.00216361 L 132.695318 134.623839 L 0.0023205 134.623839 Z M 0.0023205 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1358.357636, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1367.709558, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1389.670401, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1406.683421, 363.384432)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1429.12812, 363.384432)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B109)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.000199771 0.00216361 L 132.692798 0.00216361 L 132.692798 134.623839 L -0.000199771 134.623839 Z M -0.000199771 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1457.804837, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1466.536155, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1488.496998, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1505.510018, 363.384432)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1527.954717, 363.384432)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B110)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00252804 0.00216361 L 132.695683 0.00216361 L 132.695683 134.623839 L -0.00252804 134.623839 Z M -0.00252804 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1557.251894, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1567.751305, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1589.712148, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1606.725168, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1623.738187, 363.384432)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B111)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.0000043318 0.00216361 L 132.693002 0.00216361 L 132.693002 134.623839 L 0.0000043318 134.623839 Z M 0.0000043318 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1656.699216, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1669.915105, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1691.875948, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1708.888968, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1725.901988, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B112)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00235594 0.00216361 L 132.695855 0.00216361 L 132.695855 134.623839 L -0.00235594 134.623839 Z M -0.00235594 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1756.146297, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1768.952369, 363.384432)">
          <g>
            <path d="M 2.96875 0 L 2.96875 -22.828125 L 12.703125 -22.828125 C 14.109375 -22.828125 15.296875 -22.601562 16.265625 -22.15625 C 17.242188 -21.71875 17.984375 -21.085938 18.484375 -20.265625 C 18.984375 -19.453125 19.234375 -18.488281 19.234375 -17.375 C 19.234375 -16.363281 18.988281 -15.472656 18.5 -14.703125 C 18.007812 -13.929688 17.304688 -13.3125 16.390625 -12.84375 L 16.390625 -12.515625 C 17.828125 -12.140625 18.9375 -11.457031 19.71875 -10.46875 C 20.5 -9.476562 20.890625 -8.269531 20.890625 -6.84375 C 20.890625 -4.65625 20.226562 -2.96875 18.90625 -1.78125 C 17.59375 -0.59375 15.640625 0 13.046875 0 Z M 11.765625 -13.71875 C 13.867188 -13.71875 14.921875 -14.664062 14.921875 -16.5625 C 14.921875 -17.53125 14.660156 -18.25 14.140625 -18.71875 C 13.617188 -19.195312 12.828125 -19.4375 11.765625 -19.4375 L 7.484375 -19.4375 L 7.484375 -13.71875 Z M 12.59375 -3.578125 C 15.082031 -3.578125 16.328125 -4.707031 16.328125 -6.96875 C 16.328125 -9.226562 15.082031 -10.359375 12.59375 -10.359375 L 7.484375 -10.359375 L 7.484375 -3.578125 Z M 12.59375 -3.578125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1791.272202, 363.384432)">
          <g>
            <path d="M 1.203125 0 L 1.203125 -3.734375 L 6.71875 -3.734375 L 6.71875 -17.9375 L 6.359375 -18.03125 C 5.578125 -17.65625 4.804688 -17.359375 4.046875 -17.140625 C 3.296875 -16.921875 2.4375 -16.75 1.46875 -16.625 L 1.46875 -20.484375 C 4 -21.015625 6.046875 -21.796875 7.609375 -22.828125 L 11.171875 -22.828125 L 11.171875 -3.734375 L 16.09375 -3.734375 L 16.09375 0 Z M 1.203125 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1808.113531, 363.384432)">
          <g>
            <path d="M 1.203125 0 L 1.203125 -3.734375 L 6.71875 -3.734375 L 6.71875 -17.9375 L 6.359375 -18.03125 C 5.578125 -17.65625 4.804688 -17.359375 4.046875 -17.140625 C 3.296875 -16.921875 2.4375 -16.75 1.46875 -16.625 L 1.46875 -20.484375 C 4 -21.015625 6.046875 -21.796875 7.609375 -22.828125 L 11.171875 -22.828125 L 11.171875 -3.734375 L 16.09375 -3.734375 L 16.09375 0 Z M 1.203125 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1824.95486, 363.384432)">
          <g>
            <path d="M 1.109375 -1.8125 C 1.109375 -3.070312 1.242188 -4.132812 1.515625 -5 C 1.796875 -5.863281 2.25 -6.648438 2.875 -7.359375 C 3.5 -8.066406 4.382812 -8.832031 5.53125 -9.65625 L 8.5625 -11.859375 C 9.394531 -12.453125 10.039062 -12.96875 10.5 -13.40625 C 10.96875 -13.84375 11.316406 -14.300781 11.546875 -14.78125 C 11.785156 -15.257812 11.90625 -15.804688 11.90625 -16.421875 C 11.90625 -17.347656 11.625 -18.0625 11.0625 -18.5625 C 10.5 -19.070312 9.65625 -19.328125 8.53125 -19.328125 C 7.457031 -19.328125 6.5 -19.066406 5.65625 -18.546875 C 4.8125 -18.035156 4.113281 -17.332031 3.5625 -16.4375 L 3.265625 -16.359375 L 0.78125 -19.140625 C 1.59375 -20.347656 2.648438 -21.316406 3.953125 -22.046875 C 5.265625 -22.785156 6.847656 -23.15625 8.703125 -23.15625 C 10.410156 -23.15625 11.835938 -22.875 12.984375 -22.3125 C 14.140625 -21.75 14.992188 -20.976562 15.546875 -20 C 16.109375 -19.03125 16.390625 -17.914062 16.390625 -16.65625 C 16.390625 -15.570312 16.160156 -14.582031 15.703125 -13.6875 C 15.253906 -12.789062 14.628906 -11.960938 13.828125 -11.203125 C 13.023438 -10.441406 12 -9.625 10.75 -8.75 L 8.046875 -6.875 C 7.242188 -6.289062 6.679688 -5.769531 6.359375 -5.3125 C 6.035156 -4.863281 5.875 -4.351562 5.875 -3.78125 L 16.171875 -3.78125 L 16.171875 0 L 1.109375 0 Z M 1.109375 -1.8125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B113)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000528435 0.00216361 L 132.693526 0.00216361 L 132.693526 134.623839 L 0.000528435 134.623839 Z M 0.000528435 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1855.593354, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1868.036469, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1889.997312, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1907.010332, 363.384432)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1924.023352, 363.384432)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B130)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00013206 -0.00259802 L 132.69313 -0.00259802 L 132.69313 134.62429 L 0.00013206 134.62429 Z M 0.00013206 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 465.257714, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(474.995987, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(496.95683, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(513.96985, 262.489563)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(532.512481, 262.489563)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B129)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00238821 -0.00259802 L 132.695822 -0.00259802 L 132.695822 134.62429 L -0.00238821 134.62429 Z M -0.00238821 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 564.704915, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(575.883379, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(597.844222, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(614.857242, 262.489563)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(632.400943, 262.489563)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B128)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000400163 -0.00259802 L 132.693398 -0.00259802 L 132.693398 134.62429 L 0.000400163 134.62429 Z M 0.000400163 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 664.152044, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(675.951088, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(697.911932, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(714.924951, 262.489563)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(732.468653, 262.489563)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B127)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00212011 -0.00259802 L 132.690878 -0.00259802 L 132.690878 134.62429 L -0.00212011 134.62429 Z M -0.00212011 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 763.599245, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(777.166358, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(799.127202, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(816.140221, 262.489563)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(833.683923, 262.489563)">
          <g>
            <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B126)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000668266 -0.00259802 L 132.693666 -0.00259802 L 132.693666 134.62429 L 0.000668266 134.62429 Z M 0.000668266 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 863.046374, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(874.224838, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(896.185682, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(913.198701, 262.489563)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(930.742403, 262.489563)">
          <g>
            <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B125)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00116047 -0.00259802 L 132.694158 -0.00259802 L 132.694158 134.62429 L 0.00116047 134.62429 Z M 0.00116047 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 955.74913, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(967.758938, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(989.719781, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1006.732801, 262.489563)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1024.276503, 262.489563)">
          <g>
            <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B124)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.0012638 -0.00259802 L 132.691734 -0.00259802 L 132.691734 134.62429 L -0.0012638 134.62429 Z M -0.0012638 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1055.19626, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1066.983667, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1088.94451, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1105.95753, 262.489563)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1123.501231, 262.489563)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B123)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00158857 -0.00259802 L 132.694587 -0.00259802 L 132.694587 134.62429 L 0.00158857 134.62429 Z M 0.00158857 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1154.643341, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1166.828856, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1188.7897, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1205.802719, 262.489563)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1223.346421, 262.489563)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B122)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.000931699 -0.00259802 L 132.692066 -0.00259802 L 132.692066 134.62429 L -0.000931699 134.62429 Z M -0.000931699 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1254.090542, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1266.767814, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1288.728658, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1305.741677, 262.489563)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1323.285379, 262.489563)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B121)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00179267 -0.00259802 L 132.694791 -0.00259802 L 132.694791 134.62429 L 0.00179267 134.62429 Z M 0.00179267 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1353.537719, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1366.484324, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1388.445167, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1405.458187, 262.489563)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1423.001888, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B120)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.000727596 -0.00259802 L 132.69227 -0.00259802 L 132.69227 134.62429 L -0.000727596 134.62429 Z M -0.000727596 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1452.98492, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1463.214998, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1485.175841, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1502.188861, 262.489563)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1519.732563, 262.489563)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B119)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00215678 -0.00259802 L 132.695155 -0.00259802 L 132.695155 134.62429 L 0.00215678 134.62429 Z M 0.00215678 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1552.431978, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1563.879822, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1585.840665, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1602.853685, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1619.866705, 262.489563)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B118)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.000523494 -0.00259802 L 132.692474 -0.00259802 L 132.692474 134.62429 L -0.000523494 134.62429 Z M -0.000523494 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1651.879299, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1663.9477, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1685.908543, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1702.921563, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1719.934582, 262.489563)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B117)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00236088 -0.00259802 L 132.695359 -0.00259802 L 132.695359 134.62429 L 0.00236088 134.62429 Z M 0.00236088 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1751.326356, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1765.16285, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1787.123693, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1804.136713, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1821.149732, 262.489563)">
          <g>
            <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B116)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000000609189 -0.00259802 L 132.692999 -0.00259802 L 132.692999 134.62429 L 0.000000609189 134.62429 Z M 0.000000609189 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1850.773437, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1862.209573, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1884.170416, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1901.183436, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1918.196455, 262.489563)">
          <g>
            <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B115)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00253298 -0.00259802 L 132.695531 -0.00259802 L 132.695531 134.62429 L 0.00253298 134.62429 Z M 0.00253298 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1950.220758, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1962.499922, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1984.460766, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2001.473785, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2018.486805, 262.489563)">
          <g>
            <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B134)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000366183 -0.00000000000017053 L 132.693364 -0.00000000000017053 L 132.693364 134.626888 L 0.000366183 134.626888 Z M 0.000366183 -0.00000000000017053"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 271.183319, 0.000000000000127792)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(282.46717, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(304.428013, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(321.441033, 62.198553)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(339.983664, 62.198553)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B135)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00214129 -0.00000000000017053 L 132.690857 -0.00000000000017053 L 132.690857 134.626888 L -0.00214129 134.626888 Z M -0.00214129 -0.00000000000017053"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 370.630511, 0.000000000000127792)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(382.136834, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(404.097677, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(421.110697, 62.198553)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(439.653328, 62.198553)">
          <g>
            <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B136)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000659885 -0.00000000000017053 L 132.693658 -0.00000000000017053 L 132.693658 134.626888 L 0.000659885 134.626888 Z M 0.000659885 -0.00000000000017053"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 470.07763, 0.000000000000127792)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(480.752629, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(502.713472, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(519.726492, 62.198553)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(538.269123, 62.198553)">
          <g>
            <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B137)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00186038 0.000000000000056843 L 132.691138 0.000000000000056843 L 132.691138 134.626888 L -0.00186038 134.626888 Z M -0.00186038 0.000000000000056843"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 569.524832, -0.000000000000042597)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(582.600164, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(604.561008, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(621.574027, 62.198553)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(640.116659, 62.198553)">
          <g>
            <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B138)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000831988 -0.00000000000017053 L 132.69383 -0.00000000000017053 L 132.69383 134.626888 L 0.000831988 134.626888 Z M 0.000831988 -0.00000000000017053"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 668.972033, 0.000000000000127792)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(680.267588, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(702.228431, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(719.241451, 62.198553)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(737.784082, 62.198553)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B139)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00138819 -0.00000000000017053 L 132.694386 -0.00000000000017053 L 132.694386 134.626888 L 0.00138819 134.626888 Z M 0.00138819 -0.00000000000017053"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 761.674741, 0.000000000000127792)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(772.361424, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(794.322268, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(811.335287, 62.198553)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(829.877919, 62.198553)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B140)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00103608 -0.00000000000017053 L 132.691962 -0.00000000000017053 L 132.691962 134.626888 L -0.00103608 134.626888 Z M -0.00103608 -0.00000000000017053"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 861.12187, 0.000000000000127792)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(870.462011, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(892.422854, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(909.435874, 62.198553)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(928.774527, 62.198553)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B141)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00168829 -0.00000000000017053 L 132.694686 -0.00000000000017053 L 132.694686 134.626888 L 0.00168829 134.626888 Z M 0.00168829 -0.00000000000017053"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 960.569047, 0.000000000000127792)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(972.614006, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(994.57485, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1011.587869, 62.198553)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1030.926522, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B142)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.000735977 -0.00000000000017053 L 132.692262 -0.00000000000017053 L 132.692262 134.626888 L -0.000735977 134.626888 Z M -0.000735977 -0.00000000000017053"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1060.016177, 0.000000000000127792)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1071.803584, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1093.764427, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1110.777447, 62.198553)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1130.1161, 62.198553)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B143)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.0021164 0.000000000000056843 L 132.695114 0.000000000000056843 L 132.695114 134.626888 L 0.0021164 134.626888 Z M 0.0021164 0.000000000000056843"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1159.463258, -0.000000000000042597)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1170.747175, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1192.708019, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1209.721038, 62.198553)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1229.059691, 62.198553)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B145)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00208374 -0.000000000000227374 L 132.690914 -0.000000000000227374 L 132.690914 134.626888 L -0.00208374 134.626888 Z M -0.00208374 -0.000000000000227374"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1351.833593, 0.000000000000170389)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1362.94185, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1384.902694, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1401.915713, 62.198553)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1421.254366, 62.198553)">
          <g>
            <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B146)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000480634 -0.000000000000227374 L 132.693479 -0.000000000000227374 L 132.693479 134.626888 L 0.000480634 134.626888 Z M 0.000480634 -0.000000000000227374"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1451.28089, 0.000000000000170389)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1461.557828, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1483.518671, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1500.531691, 62.198553)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1519.870344, 62.198553)">
          <g>
            <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B147)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00187964 -0.000000000000227374 L 132.691118 -0.000000000000227374 L 132.691118 134.626888 L -0.00187964 134.626888 Z M -0.00187964 -0.000000000000227374"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1550.727971, 0.000000000000170389)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1574.388346, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1591.401366, 62.198553)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1610.740019, 62.198553)">
          <g>
            <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B148)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000684737 -0.000000000000227374 L 132.693683 -0.000000000000227374 L 132.693683 134.626888 L 0.000684737 134.626888 Z M 0.000684737 -0.000000000000227374"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1650.175268, 0.000000000000170389)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1661.072787, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1683.03363, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1700.04665, 62.198553)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1719.385302, 62.198553)">
          <g>
            <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B149)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00167553 -0.000000000000227374 L 132.691322 -0.000000000000227374 L 132.691322 134.626888 L -0.00167553 134.626888 Z M -0.00167553 -0.000000000000227374"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1749.622349, 0.000000000000170389)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1759.910973, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1781.871816, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1798.884836, 62.198553)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1818.223488, 62.198553)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B150)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00117684 0 L 132.694175 0 L 132.694175 134.626888 L 0.00117684 134.626888 Z M 0.00117684 0"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1849.069431, 0)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1858.632092, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1880.592935, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1897.605955, 62.198553)">
          <g>
            <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1916.491968, 62.198553)">
          <g>
            <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B151)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00147143 -0.000000000000227374 L 132.691527 -0.000000000000227374 L 132.691527 134.626888 L -0.00147143 134.626888 Z M -0.00147143 -0.000000000000227374"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1948.516728, 0.000000000000170389)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1960.795916, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1982.756759, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1999.769779, 62.198553)">
          <g>
            <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2018.655792, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B152)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00109294 0 L 132.694091 0 L 132.694091 134.626888 L 0.00109294 134.626888 Z M 0.00109294 0"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 2047.964025, 0)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2059.973785, 62.198553)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2081.934628, 62.198553)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2098.947648, 62.198553)">
          <g>
            <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2117.83366, 62.198553)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B133)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00144661 -0.000000000000511591 L 132.699644 -0.000000000000511591 L 132.699644 268.263348 L 0.00144661 268.263348 Z M 0.00144661 -0.000000000000511591"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 171.733291, 0.000000000000383376)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(183.418132, 112.407024)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(205.378975, 112.407024)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(222.391995, 112.407024)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(240.934626, 112.407024)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B97)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00239979 0.00216361 L 132.695811 0.00216361 L 132.695811 134.623839 L -0.00239979 134.623839 Z M -0.00239979 0.00216361"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 171.736173, 301.185879)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(192.317021, 363.384432)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(214.277865, 363.384432)">
          <g>
            <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(234.818355, 363.384432)">
          <g>
            <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B132)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.00239979 -0.00259802 L 132.695811 -0.00259802 L 132.695811 134.62429 L -0.00239979 134.62429 Z M -0.00239979 -0.00259802"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 171.736173, 200.291009)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(183.921622, 262.489563)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(205.882465, 262.489563)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(222.895485, 262.489563)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(241.438116, 262.489563)">
          <g>
            <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(688.252516, 472.025832)">
          <g>
            <path d="M 4.890625 -41.265625 L 14.4375 -41.265625 L 14.4375 0 L 4.890625 0 Z M 4.890625 -41.265625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(707.585955, 472.025832)">
          <g>
            <path d="M 23.515625 -32.1875 C 27.453125 -32.1875 30.628906 -31.003906 33.046875 -28.640625 C 35.460938 -26.285156 36.671875 -22.789062 36.671875 -18.15625 L 36.671875 0 L 27.46875 0 L 27.46875 -16.75 C 27.46875 -19.257812 26.914062 -21.132812 25.8125 -22.375 C 24.71875 -23.613281 23.128906 -24.234375 21.046875 -24.234375 C 18.722656 -24.234375 16.875 -23.515625 15.5 -22.078125 C 14.125 -20.640625 13.4375 -18.507812 13.4375 -15.6875 L 13.4375 0 L 4.25 0 L 4.25 -31.71875 L 13.03125 -31.71875 L 13.03125 -28 C 14.25 -29.332031 15.757812 -30.363281 17.5625 -31.09375 C 19.375 -31.820312 21.359375 -32.1875 23.515625 -32.1875 Z M 23.515625 -32.1875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(748.315834, 472.025832)">
          <g>
            <path d="M 36.546875 -43.75 L 36.546875 0 L 27.765625 0 L 27.765625 -3.65625 C 25.484375 -0.90625 22.179688 0.46875 17.859375 0.46875 C 14.867188 0.46875 12.164062 -0.195312 9.75 -1.53125 C 7.332031 -2.863281 5.4375 -4.769531 4.0625 -7.25 C 2.6875 -9.726562 2 -12.597656 2 -15.859375 C 2 -19.117188 2.6875 -21.984375 4.0625 -24.453125 C 5.4375 -26.929688 7.332031 -28.835938 9.75 -30.171875 C 12.164062 -31.515625 14.867188 -32.1875 17.859375 -32.1875 C 21.910156 -32.1875 25.078125 -30.910156 27.359375 -28.359375 L 27.359375 -43.75 Z M 19.453125 -7.078125 C 21.773438 -7.078125 23.703125 -7.867188 25.234375 -9.453125 C 26.765625 -11.046875 27.53125 -13.179688 27.53125 -15.859375 C 27.53125 -18.523438 26.765625 -20.65625 25.234375 -22.25 C 23.703125 -23.84375 21.773438 -24.640625 19.453125 -24.640625 C 17.097656 -24.640625 15.148438 -23.84375 13.609375 -22.25 C 12.078125 -20.65625 11.3125 -18.523438 11.3125 -15.859375 C 11.3125 -13.179688 12.078125 -11.046875 13.609375 -9.453125 C 15.148438 -7.867188 17.097656 -7.078125 19.453125 -7.078125 Z M 19.453125 -7.078125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(789.104659, 472.025832)">
          <g>
            <path d="M 36.203125 -31.71875 L 36.203125 0 L 27.46875 0 L 27.46875 -3.765625 C 26.25 -2.390625 24.796875 -1.335938 23.109375 -0.609375 C 21.421875 0.109375 19.59375 0.46875 17.625 0.46875 C 13.457031 0.46875 10.15625 -0.726562 7.71875 -3.125 C 5.28125 -5.519531 4.0625 -9.078125 4.0625 -13.796875 L 4.0625 -31.71875 L 13.265625 -31.71875 L 13.265625 -15.15625 C 13.265625 -10.039062 15.40625 -7.484375 19.6875 -7.484375 C 21.882812 -7.484375 23.648438 -8.203125 24.984375 -9.640625 C 26.328125 -11.078125 27 -13.207031 27 -16.03125 L 27 -31.71875 Z M 36.203125 -31.71875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(829.598768, 472.025832)">
          <g>
            <path d="M 14.921875 0.46875 C 12.285156 0.46875 9.707031 0.144531 7.1875 -0.5 C 4.675781 -1.144531 2.671875 -1.960938 1.171875 -2.953125 L 4.25 -9.546875 C 5.65625 -8.640625 7.359375 -7.898438 9.359375 -7.328125 C 11.367188 -6.765625 13.335938 -6.484375 15.265625 -6.484375 C 19.160156 -6.484375 21.109375 -7.445312 21.109375 -9.375 C 21.109375 -10.28125 20.578125 -10.925781 19.515625 -11.3125 C 18.453125 -11.707031 16.820312 -12.046875 14.625 -12.328125 C 12.03125 -12.710938 9.882812 -13.160156 8.1875 -13.671875 C 6.5 -14.179688 5.035156 -15.082031 3.796875 -16.375 C 2.566406 -17.675781 1.953125 -19.53125 1.953125 -21.9375 C 1.953125 -23.9375 2.53125 -25.710938 3.6875 -27.265625 C 4.84375 -28.816406 6.53125 -30.023438 8.75 -30.890625 C 10.96875 -31.753906 13.59375 -32.1875 16.625 -32.1875 C 18.863281 -32.1875 21.09375 -31.941406 23.3125 -31.453125 C 25.53125 -30.960938 27.367188 -30.285156 28.828125 -29.421875 L 25.765625 -22.875 C 22.972656 -24.445312 19.925781 -25.234375 16.625 -25.234375 C 14.65625 -25.234375 13.179688 -24.957031 12.203125 -24.40625 C 11.222656 -23.851562 10.734375 -23.144531 10.734375 -22.28125 C 10.734375 -21.300781 11.257812 -20.613281 12.3125 -20.21875 C 13.375 -19.820312 15.066406 -19.445312 17.390625 -19.09375 C 19.984375 -18.664062 22.101562 -18.207031 23.75 -17.71875 C 25.40625 -17.226562 26.84375 -16.332031 28.0625 -15.03125 C 29.28125 -13.738281 29.890625 -11.929688 29.890625 -9.609375 C 29.890625 -7.640625 29.300781 -5.890625 28.125 -4.359375 C 26.945312 -2.828125 25.226562 -1.640625 22.96875 -0.796875 C 20.707031 0.046875 18.023438 0.46875 14.921875 0.46875 Z M 14.921875 0.46875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(860.897705, 472.025832)">
          <g>
            <path d="M 24.703125 -1.53125 C 23.796875 -0.863281 22.679688 -0.363281 21.359375 -0.03125 C 20.046875 0.300781 18.664062 0.46875 17.21875 0.46875 C 13.445312 0.46875 10.523438 -0.492188 8.453125 -2.421875 C 6.390625 -4.347656 5.359375 -7.175781 5.359375 -10.90625 L 5.359375 -23.9375 L 0.46875 -23.9375 L 0.46875 -31.015625 L 5.359375 -31.015625 L 5.359375 -38.734375 L 14.5625 -38.734375 L 14.5625 -31.015625 L 22.46875 -31.015625 L 22.46875 -23.9375 L 14.5625 -23.9375 L 14.5625 -11.03125 C 14.5625 -9.6875 14.90625 -8.648438 15.59375 -7.921875 C 16.28125 -7.203125 17.253906 -6.84375 18.515625 -6.84375 C 19.960938 -6.84375 21.195312 -7.234375 22.21875 -8.015625 Z M 24.703125 -1.53125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(886.538076, 472.025832)">
          <g>
            <path d="M 13.03125 -27.53125 C 14.125 -29.0625 15.601562 -30.21875 17.46875 -31 C 19.34375 -31.789062 21.5 -32.1875 23.9375 -32.1875 L 23.9375 -23.703125 C 22.914062 -23.773438 22.226562 -23.8125 21.875 -23.8125 C 19.238281 -23.8125 17.171875 -23.070312 15.671875 -21.59375 C 14.179688 -20.125 13.4375 -17.914062 13.4375 -14.96875 L 13.4375 0 L 4.25 0 L 4.25 -31.71875 L 13.03125 -31.71875 Z M 13.03125 -27.53125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(911.942676, 472.025832)">
          <g>
            <path d="M 4.25 -31.71875 L 13.4375 -31.71875 L 13.4375 0 L 4.25 0 Z M 8.84375 -36.140625 C 7.15625 -36.140625 5.78125 -36.628906 4.71875 -37.609375 C 3.65625 -38.585938 3.125 -39.804688 3.125 -41.265625 C 3.125 -42.722656 3.65625 -43.941406 4.71875 -44.921875 C 5.78125 -45.898438 7.15625 -46.390625 8.84375 -46.390625 C 10.53125 -46.390625 11.90625 -45.914062 12.96875 -44.96875 C 14.03125 -44.03125 14.5625 -42.851562 14.5625 -41.4375 C 14.5625 -39.90625 14.03125 -38.640625 12.96875 -37.640625 C 11.90625 -36.640625 10.53125 -36.140625 8.84375 -36.140625 Z M 8.84375 -36.140625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(929.684654, 472.025832)">
          <g>
            <path d="M 17.03125 -32.1875 C 21.945312 -32.1875 25.722656 -31.015625 28.359375 -28.671875 C 30.992188 -26.335938 32.3125 -22.8125 32.3125 -18.09375 L 32.3125 0 L 23.703125 0 L 23.703125 -3.953125 C 21.972656 -1.003906 18.75 0.46875 14.03125 0.46875 C 11.59375 0.46875 9.476562 0.0546875 7.6875 -0.765625 C 5.90625 -1.585938 4.539062 -2.722656 3.59375 -4.171875 C 2.65625 -5.628906 2.1875 -7.285156 2.1875 -9.140625 C 2.1875 -12.085938 3.296875 -14.40625 5.515625 -16.09375 C 7.734375 -17.78125 11.160156 -18.625 15.796875 -18.625 L 23.109375 -18.625 C 23.109375 -20.632812 22.5 -22.175781 21.28125 -23.25 C 20.0625 -24.332031 18.234375 -24.875 15.796875 -24.875 C 14.109375 -24.875 12.445312 -24.609375 10.8125 -24.078125 C 9.1875 -23.546875 7.800781 -22.832031 6.65625 -21.9375 L 3.359375 -28.359375 C 5.085938 -29.578125 7.160156 -30.519531 9.578125 -31.1875 C 11.992188 -31.851562 14.476562 -32.1875 17.03125 -32.1875 Z M 16.328125 -5.71875 C 17.898438 -5.71875 19.296875 -6.082031 20.515625 -6.8125 C 21.734375 -7.539062 22.597656 -8.609375 23.109375 -10.015625 L 23.109375 -13.265625 L 16.796875 -13.265625 C 13.023438 -13.265625 11.140625 -12.023438 11.140625 -9.546875 C 11.140625 -8.367188 11.597656 -7.4375 12.515625 -6.75 C 13.441406 -6.0625 14.710938 -5.71875 16.328125 -5.71875 Z M 16.328125 -5.71875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(966.052736, 472.025832)">
          <g>
            <path d="M 4.25 -43.75 L 13.4375 -43.75 L 13.4375 0 L 4.25 0 Z M 4.25 -43.75"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(983.794713, 472.025832)">
          <g></g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1000.475695, 472.025832)">
          <g>
            <path d="M 17.03125 -32.1875 C 21.945312 -32.1875 25.722656 -31.015625 28.359375 -28.671875 C 30.992188 -26.335938 32.3125 -22.8125 32.3125 -18.09375 L 32.3125 0 L 23.703125 0 L 23.703125 -3.953125 C 21.972656 -1.003906 18.75 0.46875 14.03125 0.46875 C 11.59375 0.46875 9.476562 0.0546875 7.6875 -0.765625 C 5.90625 -1.585938 4.539062 -2.722656 3.59375 -4.171875 C 2.65625 -5.628906 2.1875 -7.285156 2.1875 -9.140625 C 2.1875 -12.085938 3.296875 -14.40625 5.515625 -16.09375 C 7.734375 -17.78125 11.160156 -18.625 15.796875 -18.625 L 23.109375 -18.625 C 23.109375 -20.632812 22.5 -22.175781 21.28125 -23.25 C 20.0625 -24.332031 18.234375 -24.875 15.796875 -24.875 C 14.109375 -24.875 12.445312 -24.609375 10.8125 -24.078125 C 9.1875 -23.546875 7.800781 -22.832031 6.65625 -21.9375 L 3.359375 -28.359375 C 5.085938 -29.578125 7.160156 -30.519531 9.578125 -31.1875 C 11.992188 -31.851562 14.476562 -32.1875 17.03125 -32.1875 Z M 16.328125 -5.71875 C 17.898438 -5.71875 19.296875 -6.082031 20.515625 -6.8125 C 21.734375 -7.539062 22.597656 -8.609375 23.109375 -10.015625 L 23.109375 -13.265625 L 16.796875 -13.265625 C 13.023438 -13.265625 11.140625 -12.023438 11.140625 -9.546875 C 11.140625 -8.367188 11.597656 -7.4375 12.515625 -6.75 C 13.441406 -6.0625 14.710938 -5.71875 16.328125 -5.71875 Z M 16.328125 -5.71875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1036.843776, 472.025832)">
          <g>
            <path d="M 23.515625 -32.1875 C 27.453125 -32.1875 30.628906 -31.003906 33.046875 -28.640625 C 35.460938 -26.285156 36.671875 -22.789062 36.671875 -18.15625 L 36.671875 0 L 27.46875 0 L 27.46875 -16.75 C 27.46875 -19.257812 26.914062 -21.132812 25.8125 -22.375 C 24.71875 -23.613281 23.128906 -24.234375 21.046875 -24.234375 C 18.722656 -24.234375 16.875 -23.515625 15.5 -22.078125 C 14.125 -20.640625 13.4375 -18.507812 13.4375 -15.6875 L 13.4375 0 L 4.25 0 L 4.25 -31.71875 L 13.03125 -31.71875 L 13.03125 -28 C 14.25 -29.332031 15.757812 -30.363281 17.5625 -31.09375 C 19.375 -31.820312 21.359375 -32.1875 23.515625 -32.1875 Z M 23.515625 -32.1875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1077.573667, 472.025832)">
          <g>
            <path d="M 36.546875 -43.75 L 36.546875 0 L 27.765625 0 L 27.765625 -3.65625 C 25.484375 -0.90625 22.179688 0.46875 17.859375 0.46875 C 14.867188 0.46875 12.164062 -0.195312 9.75 -1.53125 C 7.332031 -2.863281 5.4375 -4.769531 4.0625 -7.25 C 2.6875 -9.726562 2 -12.597656 2 -15.859375 C 2 -19.117188 2.6875 -21.984375 4.0625 -24.453125 C 5.4375 -26.929688 7.332031 -28.835938 9.75 -30.171875 C 12.164062 -31.515625 14.867188 -32.1875 17.859375 -32.1875 C 21.910156 -32.1875 25.078125 -30.910156 27.359375 -28.359375 L 27.359375 -43.75 Z M 19.453125 -7.078125 C 21.773438 -7.078125 23.703125 -7.867188 25.234375 -9.453125 C 26.765625 -11.046875 27.53125 -13.179688 27.53125 -15.859375 C 27.53125 -18.523438 26.765625 -20.65625 25.234375 -22.25 C 23.703125 -23.84375 21.773438 -24.640625 19.453125 -24.640625 C 17.097656 -24.640625 15.148438 -23.84375 13.609375 -22.25 C 12.078125 -20.65625 11.3125 -18.523438 11.3125 -15.859375 C 11.3125 -13.179688 12.078125 -11.046875 13.609375 -9.453125 C 15.148438 -7.867188 17.097656 -7.078125 19.453125 -7.078125 Z M 19.453125 -7.078125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1118.362515, 472.025832)">
          <g></g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1135.043497, 472.025832)">
          <g>
            <path d="M 24.640625 0.703125 C 20.429688 0.703125 16.628906 -0.207031 13.234375 -2.03125 C 9.835938 -3.863281 7.164062 -6.398438 5.21875 -9.640625 C 3.269531 -12.878906 2.296875 -16.546875 2.296875 -20.640625 C 2.296875 -24.722656 3.269531 -28.382812 5.21875 -31.625 C 7.164062 -34.863281 9.835938 -37.394531 13.234375 -39.21875 C 16.628906 -41.050781 20.453125 -41.96875 24.703125 -41.96875 C 28.273438 -41.96875 31.503906 -41.335938 34.390625 -40.078125 C 37.285156 -38.828125 39.71875 -37.023438 41.6875 -34.671875 L 35.546875 -29 C 32.753906 -32.226562 29.296875 -33.84375 25.171875 -33.84375 C 22.617188 -33.84375 20.335938 -33.28125 18.328125 -32.15625 C 16.328125 -31.039062 14.765625 -29.476562 13.640625 -27.46875 C 12.523438 -25.46875 11.96875 -23.191406 11.96875 -20.640625 C 11.96875 -18.078125 12.523438 -15.789062 13.640625 -13.78125 C 14.765625 -11.78125 16.328125 -10.21875 18.328125 -9.09375 C 20.335938 -7.976562 22.617188 -7.421875 25.171875 -7.421875 C 29.296875 -7.421875 32.753906 -9.054688 35.546875 -12.328125 L 41.6875 -6.65625 C 39.71875 -4.257812 37.273438 -2.429688 34.359375 -1.171875 C 31.453125 0.078125 28.210938 0.703125 24.640625 0.703125 Z M 24.640625 0.703125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1178.248986, 472.025832)">
          <g>
            <path d="M 19.34375 0.46875 C 16 0.46875 13 -0.226562 10.34375 -1.625 C 7.6875 -3.019531 5.613281 -4.953125 4.125 -7.421875 C 2.632812 -9.898438 1.890625 -12.710938 1.890625 -15.859375 C 1.890625 -19.003906 2.632812 -21.8125 4.125 -24.28125 C 5.613281 -26.757812 7.6875 -28.695312 10.34375 -30.09375 C 13 -31.488281 16 -32.1875 19.34375 -32.1875 C 22.675781 -32.1875 25.660156 -31.488281 28.296875 -30.09375 C 30.929688 -28.695312 32.992188 -26.757812 34.484375 -24.28125 C 35.984375 -21.8125 36.734375 -19.003906 36.734375 -15.859375 C 36.734375 -12.710938 35.984375 -9.898438 34.484375 -7.421875 C 32.992188 -4.953125 30.929688 -3.019531 28.296875 -1.625 C 25.660156 -0.226562 22.675781 0.46875 19.34375 0.46875 Z M 19.34375 -7.078125 C 21.695312 -7.078125 23.628906 -7.867188 25.140625 -9.453125 C 26.648438 -11.046875 27.40625 -13.179688 27.40625 -15.859375 C 27.40625 -18.523438 26.648438 -20.65625 25.140625 -22.25 C 23.628906 -23.84375 21.695312 -24.640625 19.34375 -24.640625 C 16.976562 -24.640625 15.03125 -23.84375 13.5 -22.25 C 11.96875 -20.65625 11.203125 -18.523438 11.203125 -15.859375 C 11.203125 -13.179688 11.96875 -11.046875 13.5 -9.453125 C 15.03125 -7.867188 16.976562 -7.078125 19.34375 -7.078125 Z M 19.34375 -7.078125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1216.856883, 472.025832)">
          <g>
            <path d="M 13.03125 -27.53125 C 14.125 -29.0625 15.601562 -30.21875 17.46875 -31 C 19.34375 -31.789062 21.5 -32.1875 23.9375 -32.1875 L 23.9375 -23.703125 C 22.914062 -23.773438 22.226562 -23.8125 21.875 -23.8125 C 19.238281 -23.8125 17.171875 -23.070312 15.671875 -21.59375 C 14.179688 -20.125 13.4375 -17.914062 13.4375 -14.96875 L 13.4375 0 L 4.25 0 L 4.25 -31.71875 L 13.03125 -31.71875 Z M 13.03125 -27.53125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1242.261483, 472.025832)">
          <g>
            <path d="M 22.984375 -32.1875 C 25.929688 -32.1875 28.613281 -31.507812 31.03125 -30.15625 C 33.457031 -28.800781 35.359375 -26.894531 36.734375 -24.4375 C 38.109375 -21.976562 38.796875 -19.117188 38.796875 -15.859375 C 38.796875 -12.597656 38.109375 -9.738281 36.734375 -7.28125 C 35.359375 -4.820312 33.457031 -2.914062 31.03125 -1.5625 C 28.613281 -0.207031 25.929688 0.46875 22.984375 0.46875 C 18.941406 0.46875 15.757812 -0.804688 13.4375 -3.359375 L 13.4375 11.4375 L 4.25 11.4375 L 4.25 -31.71875 L 13.03125 -31.71875 L 13.03125 -28.0625 C 15.3125 -30.8125 18.628906 -32.1875 22.984375 -32.1875 Z M 21.40625 -7.078125 C 23.757812 -7.078125 25.691406 -7.867188 27.203125 -9.453125 C 28.710938 -11.046875 29.46875 -13.179688 29.46875 -15.859375 C 29.46875 -18.523438 28.710938 -20.65625 27.203125 -22.25 C 25.691406 -23.84375 23.757812 -24.640625 21.40625 -24.640625 C 19.039062 -24.640625 17.101562 -23.84375 15.59375 -22.25 C 14.082031 -20.65625 13.328125 -18.523438 13.328125 -15.859375 C 13.328125 -13.179688 14.082031 -11.046875 15.59375 -9.453125 C 17.101562 -7.867188 19.039062 -7.078125 21.40625 -7.078125 Z M 21.40625 -7.078125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1282.932417, 472.025832)">
          <g>
            <path d="M 19.34375 0.46875 C 16 0.46875 13 -0.226562 10.34375 -1.625 C 7.6875 -3.019531 5.613281 -4.953125 4.125 -7.421875 C 2.632812 -9.898438 1.890625 -12.710938 1.890625 -15.859375 C 1.890625 -19.003906 2.632812 -21.8125 4.125 -24.28125 C 5.613281 -26.757812 7.6875 -28.695312 10.34375 -30.09375 C 13 -31.488281 16 -32.1875 19.34375 -32.1875 C 22.675781 -32.1875 25.660156 -31.488281 28.296875 -30.09375 C 30.929688 -28.695312 32.992188 -26.757812 34.484375 -24.28125 C 35.984375 -21.8125 36.734375 -19.003906 36.734375 -15.859375 C 36.734375 -12.710938 35.984375 -9.898438 34.484375 -7.421875 C 32.992188 -4.953125 30.929688 -3.019531 28.296875 -1.625 C 25.660156 -0.226562 22.675781 0.46875 19.34375 0.46875 Z M 19.34375 -7.078125 C 21.695312 -7.078125 23.628906 -7.867188 25.140625 -9.453125 C 26.648438 -11.046875 27.40625 -13.179688 27.40625 -15.859375 C 27.40625 -18.523438 26.648438 -20.65625 25.140625 -22.25 C 23.628906 -23.84375 21.695312 -24.640625 19.34375 -24.640625 C 16.976562 -24.640625 15.03125 -23.84375 13.5 -22.25 C 11.96875 -20.65625 11.203125 -18.523438 11.203125 -15.859375 C 11.203125 -13.179688 11.96875 -11.046875 13.5 -9.453125 C 15.03125 -7.867188 16.976562 -7.078125 19.34375 -7.078125 Z M 19.34375 -7.078125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1321.540315, 472.025832)">
          <g>
            <path d="M 13.03125 -27.53125 C 14.125 -29.0625 15.601562 -30.21875 17.46875 -31 C 19.34375 -31.789062 21.5 -32.1875 23.9375 -32.1875 L 23.9375 -23.703125 C 22.914062 -23.773438 22.226562 -23.8125 21.875 -23.8125 C 19.238281 -23.8125 17.171875 -23.070312 15.671875 -21.59375 C 14.179688 -20.125 13.4375 -17.914062 13.4375 -14.96875 L 13.4375 0 L 4.25 0 L 4.25 -31.71875 L 13.03125 -31.71875 Z M 13.03125 -27.53125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1346.944915, 472.025832)">
          <g>
            <path d="M 17.03125 -32.1875 C 21.945312 -32.1875 25.722656 -31.015625 28.359375 -28.671875 C 30.992188 -26.335938 32.3125 -22.8125 32.3125 -18.09375 L 32.3125 0 L 23.703125 0 L 23.703125 -3.953125 C 21.972656 -1.003906 18.75 0.46875 14.03125 0.46875 C 11.59375 0.46875 9.476562 0.0546875 7.6875 -0.765625 C 5.90625 -1.585938 4.539062 -2.722656 3.59375 -4.171875 C 2.65625 -5.628906 2.1875 -7.285156 2.1875 -9.140625 C 2.1875 -12.085938 3.296875 -14.40625 5.515625 -16.09375 C 7.734375 -17.78125 11.160156 -18.625 15.796875 -18.625 L 23.109375 -18.625 C 23.109375 -20.632812 22.5 -22.175781 21.28125 -23.25 C 20.0625 -24.332031 18.234375 -24.875 15.796875 -24.875 C 14.109375 -24.875 12.445312 -24.609375 10.8125 -24.078125 C 9.1875 -23.546875 7.800781 -22.832031 6.65625 -21.9375 L 3.359375 -28.359375 C 5.085938 -29.578125 7.160156 -30.519531 9.578125 -31.1875 C 11.992188 -31.851562 14.476562 -32.1875 17.03125 -32.1875 Z M 16.328125 -5.71875 C 17.898438 -5.71875 19.296875 -6.082031 20.515625 -6.8125 C 21.734375 -7.539062 22.597656 -8.609375 23.109375 -10.015625 L 23.109375 -13.265625 L 16.796875 -13.265625 C 13.023438 -13.265625 11.140625 -12.023438 11.140625 -9.546875 C 11.140625 -8.367188 11.597656 -7.4375 12.515625 -6.75 C 13.441406 -6.0625 14.710938 -5.71875 16.328125 -5.71875 Z M 16.328125 -5.71875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1383.312997, 472.025832)">
          <g>
            <path d="M 24.703125 -1.53125 C 23.796875 -0.863281 22.679688 -0.363281 21.359375 -0.03125 C 20.046875 0.300781 18.664062 0.46875 17.21875 0.46875 C 13.445312 0.46875 10.523438 -0.492188 8.453125 -2.421875 C 6.390625 -4.347656 5.359375 -7.175781 5.359375 -10.90625 L 5.359375 -23.9375 L 0.46875 -23.9375 L 0.46875 -31.015625 L 5.359375 -31.015625 L 5.359375 -38.734375 L 14.5625 -38.734375 L 14.5625 -31.015625 L 22.46875 -31.015625 L 22.46875 -23.9375 L 14.5625 -23.9375 L 14.5625 -11.03125 C 14.5625 -9.6875 14.90625 -8.648438 15.59375 -7.921875 C 16.28125 -7.203125 17.253906 -6.84375 18.515625 -6.84375 C 19.960938 -6.84375 21.195312 -7.234375 22.21875 -8.015625 Z M 24.703125 -1.53125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1408.953379, 472.025832)">
          <g>
            <path d="M 35.3125 -15.734375 C 35.3125 -15.617188 35.253906 -14.796875 35.140625 -13.265625 L 11.140625 -13.265625 C 11.578125 -11.296875 12.597656 -9.738281 14.203125 -8.59375 C 15.816406 -7.457031 17.820312 -6.890625 20.21875 -6.890625 C 21.875 -6.890625 23.335938 -7.132812 24.609375 -7.625 C 25.890625 -8.125 27.078125 -8.90625 28.171875 -9.96875 L 33.078125 -4.65625 C 30.085938 -1.238281 25.722656 0.46875 19.984375 0.46875 C 16.410156 0.46875 13.242188 -0.226562 10.484375 -1.625 C 7.734375 -3.019531 5.613281 -4.953125 4.125 -7.421875 C 2.632812 -9.898438 1.890625 -12.710938 1.890625 -15.859375 C 1.890625 -18.960938 2.625 -21.757812 4.09375 -24.25 C 5.570312 -26.75 7.597656 -28.695312 10.171875 -30.09375 C 12.742188 -31.488281 15.625 -32.1875 18.8125 -32.1875 C 21.914062 -32.1875 24.722656 -31.515625 27.234375 -30.171875 C 29.753906 -28.835938 31.726562 -26.921875 33.15625 -24.421875 C 34.59375 -21.929688 35.3125 -19.035156 35.3125 -15.734375 Z M 18.859375 -25.234375 C 16.773438 -25.234375 15.023438 -24.640625 13.609375 -23.453125 C 12.203125 -22.273438 11.34375 -20.664062 11.03125 -18.625 L 26.640625 -18.625 C 26.328125 -20.632812 25.460938 -22.238281 24.046875 -23.4375 C 22.640625 -24.632812 20.910156 -25.234375 18.859375 -25.234375 Z M 18.859375 -25.234375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1446.146675, 472.025832)">
          <g></g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1462.827656, 472.025832)">
          <g>
            <path d="M 18.453125 0.703125 C 15.191406 0.703125 12.035156 0.257812 8.984375 -0.625 C 5.941406 -1.507812 3.5 -2.65625 1.65625 -4.0625 L 4.890625 -11.265625 C 6.660156 -9.960938 8.765625 -8.914062 11.203125 -8.125 C 13.640625 -7.34375 16.078125 -6.953125 18.515625 -6.953125 C 21.222656 -6.953125 23.222656 -7.351562 24.515625 -8.15625 C 25.816406 -8.96875 26.46875 -10.039062 26.46875 -11.375 C 26.46875 -12.363281 26.082031 -13.179688 25.3125 -13.828125 C 24.550781 -14.472656 23.570312 -14.988281 22.375 -15.375 C 21.175781 -15.769531 19.554688 -16.207031 17.515625 -16.6875 C 14.367188 -17.425781 11.789062 -18.171875 9.78125 -18.921875 C 7.78125 -19.671875 6.0625 -20.867188 4.625 -22.515625 C 3.1875 -24.171875 2.46875 -26.375 2.46875 -29.125 C 2.46875 -31.519531 3.113281 -33.691406 4.40625 -35.640625 C 5.707031 -37.585938 7.664062 -39.128906 10.28125 -40.265625 C 12.894531 -41.398438 16.085938 -41.96875 19.859375 -41.96875 C 22.492188 -41.96875 25.066406 -41.65625 27.578125 -41.03125 C 30.097656 -40.40625 32.300781 -39.5 34.1875 -38.3125 L 31.25 -31.0625 C 27.4375 -33.226562 23.625 -34.3125 19.8125 -34.3125 C 17.132812 -34.3125 15.15625 -33.878906 13.875 -33.015625 C 12.601562 -32.148438 11.96875 -31.007812 11.96875 -29.59375 C 11.96875 -28.175781 12.703125 -27.125 14.171875 -26.4375 C 15.648438 -25.75 17.898438 -25.070312 20.921875 -24.40625 C 24.066406 -23.65625 26.640625 -22.90625 28.640625 -22.15625 C 30.648438 -21.414062 32.375 -20.238281 33.8125 -18.625 C 35.25 -17.019531 35.96875 -14.835938 35.96875 -12.078125 C 35.96875 -9.722656 35.304688 -7.570312 33.984375 -5.625 C 32.671875 -3.6875 30.695312 -2.144531 28.0625 -1 C 25.425781 0.132812 22.222656 0.703125 18.453125 0.703125 Z M 18.453125 0.703125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1500.433514, 472.025832)">
          <g>
            <path d="M 24.703125 -1.53125 C 23.796875 -0.863281 22.679688 -0.363281 21.359375 -0.03125 C 20.046875 0.300781 18.664062 0.46875 17.21875 0.46875 C 13.445312 0.46875 10.523438 -0.492188 8.453125 -2.421875 C 6.390625 -4.347656 5.359375 -7.175781 5.359375 -10.90625 L 5.359375 -23.9375 L 0.46875 -23.9375 L 0.46875 -31.015625 L 5.359375 -31.015625 L 5.359375 -38.734375 L 14.5625 -38.734375 L 14.5625 -31.015625 L 22.46875 -31.015625 L 22.46875 -23.9375 L 14.5625 -23.9375 L 14.5625 -11.03125 C 14.5625 -9.6875 14.90625 -8.648438 15.59375 -7.921875 C 16.28125 -7.203125 17.253906 -6.84375 18.515625 -6.84375 C 19.960938 -6.84375 21.195312 -7.234375 22.21875 -8.015625 Z M 24.703125 -1.53125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1526.073896, 472.025832)">
          <g>
            <path d="M 17.03125 -32.1875 C 21.945312 -32.1875 25.722656 -31.015625 28.359375 -28.671875 C 30.992188 -26.335938 32.3125 -22.8125 32.3125 -18.09375 L 32.3125 0 L 23.703125 0 L 23.703125 -3.953125 C 21.972656 -1.003906 18.75 0.46875 14.03125 0.46875 C 11.59375 0.46875 9.476562 0.0546875 7.6875 -0.765625 C 5.90625 -1.585938 4.539062 -2.722656 3.59375 -4.171875 C 2.65625 -5.628906 2.1875 -7.285156 2.1875 -9.140625 C 2.1875 -12.085938 3.296875 -14.40625 5.515625 -16.09375 C 7.734375 -17.78125 11.160156 -18.625 15.796875 -18.625 L 23.109375 -18.625 C 23.109375 -20.632812 22.5 -22.175781 21.28125 -23.25 C 20.0625 -24.332031 18.234375 -24.875 15.796875 -24.875 C 14.109375 -24.875 12.445312 -24.609375 10.8125 -24.078125 C 9.1875 -23.546875 7.800781 -22.832031 6.65625 -21.9375 L 3.359375 -28.359375 C 5.085938 -29.578125 7.160156 -30.519531 9.578125 -31.1875 C 11.992188 -31.851562 14.476562 -32.1875 17.03125 -32.1875 Z M 16.328125 -5.71875 C 17.898438 -5.71875 19.296875 -6.082031 20.515625 -6.8125 C 21.734375 -7.539062 22.597656 -8.609375 23.109375 -10.015625 L 23.109375 -13.265625 L 16.796875 -13.265625 C 13.023438 -13.265625 11.140625 -12.023438 11.140625 -9.546875 C 11.140625 -8.367188 11.597656 -7.4375 12.515625 -6.75 C 13.441406 -6.0625 14.710938 -5.71875 16.328125 -5.71875 Z M 16.328125 -5.71875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1562.441978, 472.025832)">
          <g>
            <path d="M 4.25 -43.75 L 13.4375 -43.75 L 13.4375 0 L 4.25 0 Z M 4.25 -43.75"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1580.183956, 472.025832)">
          <g>
            <path d="M 4.25 -43.75 L 13.4375 -43.75 L 13.4375 0 L 4.25 0 Z M 4.25 -43.75"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1597.925933, 472.025832)">
          <g>
            <path d="M 14.921875 0.46875 C 12.285156 0.46875 9.707031 0.144531 7.1875 -0.5 C 4.675781 -1.144531 2.671875 -1.960938 1.171875 -2.953125 L 4.25 -9.546875 C 5.65625 -8.640625 7.359375 -7.898438 9.359375 -7.328125 C 11.367188 -6.765625 13.335938 -6.484375 15.265625 -6.484375 C 19.160156 -6.484375 21.109375 -7.445312 21.109375 -9.375 C 21.109375 -10.28125 20.578125 -10.925781 19.515625 -11.3125 C 18.453125 -11.707031 16.820312 -12.046875 14.625 -12.328125 C 12.03125 -12.710938 9.882812 -13.160156 8.1875 -13.671875 C 6.5 -14.179688 5.035156 -15.082031 3.796875 -16.375 C 2.566406 -17.675781 1.953125 -19.53125 1.953125 -21.9375 C 1.953125 -23.9375 2.53125 -25.710938 3.6875 -27.265625 C 4.84375 -28.816406 6.53125 -30.023438 8.75 -30.890625 C 10.96875 -31.753906 13.59375 -32.1875 16.625 -32.1875 C 18.863281 -32.1875 21.09375 -31.941406 23.3125 -31.453125 C 25.53125 -30.960938 27.367188 -30.285156 28.828125 -29.421875 L 25.765625 -22.875 C 22.972656 -24.445312 19.925781 -25.234375 16.625 -25.234375 C 14.65625 -25.234375 13.179688 -24.957031 12.203125 -24.40625 C 11.222656 -23.851562 10.734375 -23.144531 10.734375 -22.28125 C 10.734375 -21.300781 11.257812 -20.613281 12.3125 -20.21875 C 13.375 -19.820312 15.066406 -19.445312 17.390625 -19.09375 C 19.984375 -18.664062 22.101562 -18.207031 23.75 -17.71875 C 25.40625 -17.226562 26.84375 -16.332031 28.0625 -15.03125 C 29.28125 -13.738281 29.890625 -11.929688 29.890625 -9.609375 C 29.890625 -7.640625 29.300781 -5.890625 28.125 -4.359375 C 26.945312 -2.828125 25.226562 -1.640625 22.96875 -0.796875 C 20.707031 0.046875 18.023438 0.46875 14.921875 0.46875 Z M 14.921875 0.46875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(641.193028, 171.512781)">
          <g>
            <path d="M 4.890625 -41.265625 L 14.4375 -41.265625 L 14.4375 0 L 4.890625 0 Z M 4.890625 -41.265625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(660.526466, 171.512781)">
          <g>
            <path d="M 23.515625 -32.1875 C 27.453125 -32.1875 30.628906 -31.003906 33.046875 -28.640625 C 35.460938 -26.285156 36.671875 -22.789062 36.671875 -18.15625 L 36.671875 0 L 27.46875 0 L 27.46875 -16.75 C 27.46875 -19.257812 26.914062 -21.132812 25.8125 -22.375 C 24.71875 -23.613281 23.128906 -24.234375 21.046875 -24.234375 C 18.722656 -24.234375 16.875 -23.515625 15.5 -22.078125 C 14.125 -20.640625 13.4375 -18.507812 13.4375 -15.6875 L 13.4375 0 L 4.25 0 L 4.25 -31.71875 L 13.03125 -31.71875 L 13.03125 -28 C 14.25 -29.332031 15.757812 -30.363281 17.5625 -31.09375 C 19.375 -31.820312 21.359375 -32.1875 23.515625 -32.1875 Z M 23.515625 -32.1875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(701.256346, 171.512781)">
          <g>
            <path d="M 36.546875 -43.75 L 36.546875 0 L 27.765625 0 L 27.765625 -3.65625 C 25.484375 -0.90625 22.179688 0.46875 17.859375 0.46875 C 14.867188 0.46875 12.164062 -0.195312 9.75 -1.53125 C 7.332031 -2.863281 5.4375 -4.769531 4.0625 -7.25 C 2.6875 -9.726562 2 -12.597656 2 -15.859375 C 2 -19.117188 2.6875 -21.984375 4.0625 -24.453125 C 5.4375 -26.929688 7.332031 -28.835938 9.75 -30.171875 C 12.164062 -31.515625 14.867188 -32.1875 17.859375 -32.1875 C 21.910156 -32.1875 25.078125 -30.910156 27.359375 -28.359375 L 27.359375 -43.75 Z M 19.453125 -7.078125 C 21.773438 -7.078125 23.703125 -7.867188 25.234375 -9.453125 C 26.765625 -11.046875 27.53125 -13.179688 27.53125 -15.859375 C 27.53125 -18.523438 26.765625 -20.65625 25.234375 -22.25 C 23.703125 -23.84375 21.773438 -24.640625 19.453125 -24.640625 C 17.097656 -24.640625 15.148438 -23.84375 13.609375 -22.25 C 12.078125 -20.65625 11.3125 -18.523438 11.3125 -15.859375 C 11.3125 -13.179688 12.078125 -11.046875 13.609375 -9.453125 C 15.148438 -7.867188 17.097656 -7.078125 19.453125 -7.078125 Z M 19.453125 -7.078125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(742.045171, 171.512781)">
          <g>
            <path d="M 36.203125 -31.71875 L 36.203125 0 L 27.46875 0 L 27.46875 -3.765625 C 26.25 -2.390625 24.796875 -1.335938 23.109375 -0.609375 C 21.421875 0.109375 19.59375 0.46875 17.625 0.46875 C 13.457031 0.46875 10.15625 -0.726562 7.71875 -3.125 C 5.28125 -5.519531 4.0625 -9.078125 4.0625 -13.796875 L 4.0625 -31.71875 L 13.265625 -31.71875 L 13.265625 -15.15625 C 13.265625 -10.039062 15.40625 -7.484375 19.6875 -7.484375 C 21.882812 -7.484375 23.648438 -8.203125 24.984375 -9.640625 C 26.328125 -11.078125 27 -13.207031 27 -16.03125 L 27 -31.71875 Z M 36.203125 -31.71875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(782.53928, 171.512781)">
          <g>
            <path d="M 14.921875 0.46875 C 12.285156 0.46875 9.707031 0.144531 7.1875 -0.5 C 4.675781 -1.144531 2.671875 -1.960938 1.171875 -2.953125 L 4.25 -9.546875 C 5.65625 -8.640625 7.359375 -7.898438 9.359375 -7.328125 C 11.367188 -6.765625 13.335938 -6.484375 15.265625 -6.484375 C 19.160156 -6.484375 21.109375 -7.445312 21.109375 -9.375 C 21.109375 -10.28125 20.578125 -10.925781 19.515625 -11.3125 C 18.453125 -11.707031 16.820312 -12.046875 14.625 -12.328125 C 12.03125 -12.710938 9.882812 -13.160156 8.1875 -13.671875 C 6.5 -14.179688 5.035156 -15.082031 3.796875 -16.375 C 2.566406 -17.675781 1.953125 -19.53125 1.953125 -21.9375 C 1.953125 -23.9375 2.53125 -25.710938 3.6875 -27.265625 C 4.84375 -28.816406 6.53125 -30.023438 8.75 -30.890625 C 10.96875 -31.753906 13.59375 -32.1875 16.625 -32.1875 C 18.863281 -32.1875 21.09375 -31.941406 23.3125 -31.453125 C 25.53125 -30.960938 27.367188 -30.285156 28.828125 -29.421875 L 25.765625 -22.875 C 22.972656 -24.445312 19.925781 -25.234375 16.625 -25.234375 C 14.65625 -25.234375 13.179688 -24.957031 12.203125 -24.40625 C 11.222656 -23.851562 10.734375 -23.144531 10.734375 -22.28125 C 10.734375 -21.300781 11.257812 -20.613281 12.3125 -20.21875 C 13.375 -19.820312 15.066406 -19.445312 17.390625 -19.09375 C 19.984375 -18.664062 22.101562 -18.207031 23.75 -17.71875 C 25.40625 -17.226562 26.84375 -16.332031 28.0625 -15.03125 C 29.28125 -13.738281 29.890625 -11.929688 29.890625 -9.609375 C 29.890625 -7.640625 29.300781 -5.890625 28.125 -4.359375 C 26.945312 -2.828125 25.226562 -1.640625 22.96875 -0.796875 C 20.707031 0.046875 18.023438 0.46875 14.921875 0.46875 Z M 14.921875 0.46875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(813.838217, 171.512781)">
          <g>
            <path d="M 24.703125 -1.53125 C 23.796875 -0.863281 22.679688 -0.363281 21.359375 -0.03125 C 20.046875 0.300781 18.664062 0.46875 17.21875 0.46875 C 13.445312 0.46875 10.523438 -0.492188 8.453125 -2.421875 C 6.390625 -4.347656 5.359375 -7.175781 5.359375 -10.90625 L 5.359375 -23.9375 L 0.46875 -23.9375 L 0.46875 -31.015625 L 5.359375 -31.015625 L 5.359375 -38.734375 L 14.5625 -38.734375 L 14.5625 -31.015625 L 22.46875 -31.015625 L 22.46875 -23.9375 L 14.5625 -23.9375 L 14.5625 -11.03125 C 14.5625 -9.6875 14.90625 -8.648438 15.59375 -7.921875 C 16.28125 -7.203125 17.253906 -6.84375 18.515625 -6.84375 C 19.960938 -6.84375 21.195312 -7.234375 22.21875 -8.015625 Z M 24.703125 -1.53125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(839.478588, 171.512781)">
          <g>
            <path d="M 13.03125 -27.53125 C 14.125 -29.0625 15.601562 -30.21875 17.46875 -31 C 19.34375 -31.789062 21.5 -32.1875 23.9375 -32.1875 L 23.9375 -23.703125 C 22.914062 -23.773438 22.226562 -23.8125 21.875 -23.8125 C 19.238281 -23.8125 17.171875 -23.070312 15.671875 -21.59375 C 14.179688 -20.125 13.4375 -17.914062 13.4375 -14.96875 L 13.4375 0 L 4.25 0 L 4.25 -31.71875 L 13.03125 -31.71875 Z M 13.03125 -27.53125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(864.883188, 171.512781)">
          <g>
            <path d="M 4.25 -31.71875 L 13.4375 -31.71875 L 13.4375 0 L 4.25 0 Z M 8.84375 -36.140625 C 7.15625 -36.140625 5.78125 -36.628906 4.71875 -37.609375 C 3.65625 -38.585938 3.125 -39.804688 3.125 -41.265625 C 3.125 -42.722656 3.65625 -43.941406 4.71875 -44.921875 C 5.78125 -45.898438 7.15625 -46.390625 8.84375 -46.390625 C 10.53125 -46.390625 11.90625 -45.914062 12.96875 -44.96875 C 14.03125 -44.03125 14.5625 -42.851562 14.5625 -41.4375 C 14.5625 -39.90625 14.03125 -38.640625 12.96875 -37.640625 C 11.90625 -36.640625 10.53125 -36.140625 8.84375 -36.140625 Z M 8.84375 -36.140625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(882.625166, 171.512781)">
          <g>
            <path d="M 17.03125 -32.1875 C 21.945312 -32.1875 25.722656 -31.015625 28.359375 -28.671875 C 30.992188 -26.335938 32.3125 -22.8125 32.3125 -18.09375 L 32.3125 0 L 23.703125 0 L 23.703125 -3.953125 C 21.972656 -1.003906 18.75 0.46875 14.03125 0.46875 C 11.59375 0.46875 9.476562 0.0546875 7.6875 -0.765625 C 5.90625 -1.585938 4.539062 -2.722656 3.59375 -4.171875 C 2.65625 -5.628906 2.1875 -7.285156 2.1875 -9.140625 C 2.1875 -12.085938 3.296875 -14.40625 5.515625 -16.09375 C 7.734375 -17.78125 11.160156 -18.625 15.796875 -18.625 L 23.109375 -18.625 C 23.109375 -20.632812 22.5 -22.175781 21.28125 -23.25 C 20.0625 -24.332031 18.234375 -24.875 15.796875 -24.875 C 14.109375 -24.875 12.445312 -24.609375 10.8125 -24.078125 C 9.1875 -23.546875 7.800781 -22.832031 6.65625 -21.9375 L 3.359375 -28.359375 C 5.085938 -29.578125 7.160156 -30.519531 9.578125 -31.1875 C 11.992188 -31.851562 14.476562 -32.1875 17.03125 -32.1875 Z M 16.328125 -5.71875 C 17.898438 -5.71875 19.296875 -6.082031 20.515625 -6.8125 C 21.734375 -7.539062 22.597656 -8.609375 23.109375 -10.015625 L 23.109375 -13.265625 L 16.796875 -13.265625 C 13.023438 -13.265625 11.140625 -12.023438 11.140625 -9.546875 C 11.140625 -8.367188 11.597656 -7.4375 12.515625 -6.75 C 13.441406 -6.0625 14.710938 -5.71875 16.328125 -5.71875 Z M 16.328125 -5.71875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(918.993247, 171.512781)">
          <g>
            <path d="M 4.25 -43.75 L 13.4375 -43.75 L 13.4375 0 L 4.25 0 Z M 4.25 -43.75"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(936.735225, 171.512781)">
          <g></g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(953.416206, 171.512781)">
          <g>
            <path d="M 17.03125 -32.1875 C 21.945312 -32.1875 25.722656 -31.015625 28.359375 -28.671875 C 30.992188 -26.335938 32.3125 -22.8125 32.3125 -18.09375 L 32.3125 0 L 23.703125 0 L 23.703125 -3.953125 C 21.972656 -1.003906 18.75 0.46875 14.03125 0.46875 C 11.59375 0.46875 9.476562 0.0546875 7.6875 -0.765625 C 5.90625 -1.585938 4.539062 -2.722656 3.59375 -4.171875 C 2.65625 -5.628906 2.1875 -7.285156 2.1875 -9.140625 C 2.1875 -12.085938 3.296875 -14.40625 5.515625 -16.09375 C 7.734375 -17.78125 11.160156 -18.625 15.796875 -18.625 L 23.109375 -18.625 C 23.109375 -20.632812 22.5 -22.175781 21.28125 -23.25 C 20.0625 -24.332031 18.234375 -24.875 15.796875 -24.875 C 14.109375 -24.875 12.445312 -24.609375 10.8125 -24.078125 C 9.1875 -23.546875 7.800781 -22.832031 6.65625 -21.9375 L 3.359375 -28.359375 C 5.085938 -29.578125 7.160156 -30.519531 9.578125 -31.1875 C 11.992188 -31.851562 14.476562 -32.1875 17.03125 -32.1875 Z M 16.328125 -5.71875 C 17.898438 -5.71875 19.296875 -6.082031 20.515625 -6.8125 C 21.734375 -7.539062 22.597656 -8.609375 23.109375 -10.015625 L 23.109375 -13.265625 L 16.796875 -13.265625 C 13.023438 -13.265625 11.140625 -12.023438 11.140625 -9.546875 C 11.140625 -8.367188 11.597656 -7.4375 12.515625 -6.75 C 13.441406 -6.0625 14.710938 -5.71875 16.328125 -5.71875 Z M 16.328125 -5.71875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(989.784288, 171.512781)">
          <g>
            <path d="M 23.515625 -32.1875 C 27.453125 -32.1875 30.628906 -31.003906 33.046875 -28.640625 C 35.460938 -26.285156 36.671875 -22.789062 36.671875 -18.15625 L 36.671875 0 L 27.46875 0 L 27.46875 -16.75 C 27.46875 -19.257812 26.914062 -21.132812 25.8125 -22.375 C 24.71875 -23.613281 23.128906 -24.234375 21.046875 -24.234375 C 18.722656 -24.234375 16.875 -23.515625 15.5 -22.078125 C 14.125 -20.640625 13.4375 -18.507812 13.4375 -15.6875 L 13.4375 0 L 4.25 0 L 4.25 -31.71875 L 13.03125 -31.71875 L 13.03125 -28 C 14.25 -29.332031 15.757812 -30.363281 17.5625 -31.09375 C 19.375 -31.820312 21.359375 -32.1875 23.515625 -32.1875 Z M 23.515625 -32.1875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1030.514179, 171.512781)">
          <g>
            <path d="M 36.546875 -43.75 L 36.546875 0 L 27.765625 0 L 27.765625 -3.65625 C 25.484375 -0.90625 22.179688 0.46875 17.859375 0.46875 C 14.867188 0.46875 12.164062 -0.195312 9.75 -1.53125 C 7.332031 -2.863281 5.4375 -4.769531 4.0625 -7.25 C 2.6875 -9.726562 2 -12.597656 2 -15.859375 C 2 -19.117188 2.6875 -21.984375 4.0625 -24.453125 C 5.4375 -26.929688 7.332031 -28.835938 9.75 -30.171875 C 12.164062 -31.515625 14.867188 -32.1875 17.859375 -32.1875 C 21.910156 -32.1875 25.078125 -30.910156 27.359375 -28.359375 L 27.359375 -43.75 Z M 19.453125 -7.078125 C 21.773438 -7.078125 23.703125 -7.867188 25.234375 -9.453125 C 26.765625 -11.046875 27.53125 -13.179688 27.53125 -15.859375 C 27.53125 -18.523438 26.765625 -20.65625 25.234375 -22.25 C 23.703125 -23.84375 21.773438 -24.640625 19.453125 -24.640625 C 17.097656 -24.640625 15.148438 -23.84375 13.609375 -22.25 C 12.078125 -20.65625 11.3125 -18.523438 11.3125 -15.859375 C 11.3125 -13.179688 12.078125 -11.046875 13.609375 -9.453125 C 15.148438 -7.867188 17.097656 -7.078125 19.453125 -7.078125 Z M 19.453125 -7.078125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1071.303027, 171.512781)">
          <g></g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1087.984008, 171.512781)">
          <g>
            <path d="M 24.640625 0.703125 C 20.429688 0.703125 16.628906 -0.207031 13.234375 -2.03125 C 9.835938 -3.863281 7.164062 -6.398438 5.21875 -9.640625 C 3.269531 -12.878906 2.296875 -16.546875 2.296875 -20.640625 C 2.296875 -24.722656 3.269531 -28.382812 5.21875 -31.625 C 7.164062 -34.863281 9.835938 -37.394531 13.234375 -39.21875 C 16.628906 -41.050781 20.453125 -41.96875 24.703125 -41.96875 C 28.273438 -41.96875 31.503906 -41.335938 34.390625 -40.078125 C 37.285156 -38.828125 39.71875 -37.023438 41.6875 -34.671875 L 35.546875 -29 C 32.753906 -32.226562 29.296875 -33.84375 25.171875 -33.84375 C 22.617188 -33.84375 20.335938 -33.28125 18.328125 -32.15625 C 16.328125 -31.039062 14.765625 -29.476562 13.640625 -27.46875 C 12.523438 -25.46875 11.96875 -23.191406 11.96875 -20.640625 C 11.96875 -18.078125 12.523438 -15.789062 13.640625 -13.78125 C 14.765625 -11.78125 16.328125 -10.21875 18.328125 -9.09375 C 20.335938 -7.976562 22.617188 -7.421875 25.171875 -7.421875 C 29.296875 -7.421875 32.753906 -9.054688 35.546875 -12.328125 L 41.6875 -6.65625 C 39.71875 -4.257812 37.273438 -2.429688 34.359375 -1.171875 C 31.453125 0.078125 28.210938 0.703125 24.640625 0.703125 Z M 24.640625 0.703125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1131.189497, 171.512781)">
          <g>
            <path d="M 19.34375 0.46875 C 16 0.46875 13 -0.226562 10.34375 -1.625 C 7.6875 -3.019531 5.613281 -4.953125 4.125 -7.421875 C 2.632812 -9.898438 1.890625 -12.710938 1.890625 -15.859375 C 1.890625 -19.003906 2.632812 -21.8125 4.125 -24.28125 C 5.613281 -26.757812 7.6875 -28.695312 10.34375 -30.09375 C 13 -31.488281 16 -32.1875 19.34375 -32.1875 C 22.675781 -32.1875 25.660156 -31.488281 28.296875 -30.09375 C 30.929688 -28.695312 32.992188 -26.757812 34.484375 -24.28125 C 35.984375 -21.8125 36.734375 -19.003906 36.734375 -15.859375 C 36.734375 -12.710938 35.984375 -9.898438 34.484375 -7.421875 C 32.992188 -4.953125 30.929688 -3.019531 28.296875 -1.625 C 25.660156 -0.226562 22.675781 0.46875 19.34375 0.46875 Z M 19.34375 -7.078125 C 21.695312 -7.078125 23.628906 -7.867188 25.140625 -9.453125 C 26.648438 -11.046875 27.40625 -13.179688 27.40625 -15.859375 C 27.40625 -18.523438 26.648438 -20.65625 25.140625 -22.25 C 23.628906 -23.84375 21.695312 -24.640625 19.34375 -24.640625 C 16.976562 -24.640625 15.03125 -23.84375 13.5 -22.25 C 11.96875 -20.65625 11.203125 -18.523438 11.203125 -15.859375 C 11.203125 -13.179688 11.96875 -11.046875 13.5 -9.453125 C 15.03125 -7.867188 16.976562 -7.078125 19.34375 -7.078125 Z M 19.34375 -7.078125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1169.797395, 171.512781)">
          <g>
            <path d="M 13.03125 -27.53125 C 14.125 -29.0625 15.601562 -30.21875 17.46875 -31 C 19.34375 -31.789062 21.5 -32.1875 23.9375 -32.1875 L 23.9375 -23.703125 C 22.914062 -23.773438 22.226562 -23.8125 21.875 -23.8125 C 19.238281 -23.8125 17.171875 -23.070312 15.671875 -21.59375 C 14.179688 -20.125 13.4375 -17.914062 13.4375 -14.96875 L 13.4375 0 L 4.25 0 L 4.25 -31.71875 L 13.03125 -31.71875 Z M 13.03125 -27.53125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1195.201995, 171.512781)">
          <g>
            <path d="M 22.984375 -32.1875 C 25.929688 -32.1875 28.613281 -31.507812 31.03125 -30.15625 C 33.457031 -28.800781 35.359375 -26.894531 36.734375 -24.4375 C 38.109375 -21.976562 38.796875 -19.117188 38.796875 -15.859375 C 38.796875 -12.597656 38.109375 -9.738281 36.734375 -7.28125 C 35.359375 -4.820312 33.457031 -2.914062 31.03125 -1.5625 C 28.613281 -0.207031 25.929688 0.46875 22.984375 0.46875 C 18.941406 0.46875 15.757812 -0.804688 13.4375 -3.359375 L 13.4375 11.4375 L 4.25 11.4375 L 4.25 -31.71875 L 13.03125 -31.71875 L 13.03125 -28.0625 C 15.3125 -30.8125 18.628906 -32.1875 22.984375 -32.1875 Z M 21.40625 -7.078125 C 23.757812 -7.078125 25.691406 -7.867188 27.203125 -9.453125 C 28.710938 -11.046875 29.46875 -13.179688 29.46875 -15.859375 C 29.46875 -18.523438 28.710938 -20.65625 27.203125 -22.25 C 25.691406 -23.84375 23.757812 -24.640625 21.40625 -24.640625 C 19.039062 -24.640625 17.101562 -23.84375 15.59375 -22.25 C 14.082031 -20.65625 13.328125 -18.523438 13.328125 -15.859375 C 13.328125 -13.179688 14.082031 -11.046875 15.59375 -9.453125 C 17.101562 -7.867188 19.039062 -7.078125 21.40625 -7.078125 Z M 21.40625 -7.078125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1235.872929, 171.512781)">
          <g>
            <path d="M 19.34375 0.46875 C 16 0.46875 13 -0.226562 10.34375 -1.625 C 7.6875 -3.019531 5.613281 -4.953125 4.125 -7.421875 C 2.632812 -9.898438 1.890625 -12.710938 1.890625 -15.859375 C 1.890625 -19.003906 2.632812 -21.8125 4.125 -24.28125 C 5.613281 -26.757812 7.6875 -28.695312 10.34375 -30.09375 C 13 -31.488281 16 -32.1875 19.34375 -32.1875 C 22.675781 -32.1875 25.660156 -31.488281 28.296875 -30.09375 C 30.929688 -28.695312 32.992188 -26.757812 34.484375 -24.28125 C 35.984375 -21.8125 36.734375 -19.003906 36.734375 -15.859375 C 36.734375 -12.710938 35.984375 -9.898438 34.484375 -7.421875 C 32.992188 -4.953125 30.929688 -3.019531 28.296875 -1.625 C 25.660156 -0.226562 22.675781 0.46875 19.34375 0.46875 Z M 19.34375 -7.078125 C 21.695312 -7.078125 23.628906 -7.867188 25.140625 -9.453125 C 26.648438 -11.046875 27.40625 -13.179688 27.40625 -15.859375 C 27.40625 -18.523438 26.648438 -20.65625 25.140625 -22.25 C 23.628906 -23.84375 21.695312 -24.640625 19.34375 -24.640625 C 16.976562 -24.640625 15.03125 -23.84375 13.5 -22.25 C 11.96875 -20.65625 11.203125 -18.523438 11.203125 -15.859375 C 11.203125 -13.179688 11.96875 -11.046875 13.5 -9.453125 C 15.03125 -7.867188 16.976562 -7.078125 19.34375 -7.078125 Z M 19.34375 -7.078125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1274.480826, 171.512781)">
          <g>
            <path d="M 13.03125 -27.53125 C 14.125 -29.0625 15.601562 -30.21875 17.46875 -31 C 19.34375 -31.789062 21.5 -32.1875 23.9375 -32.1875 L 23.9375 -23.703125 C 22.914062 -23.773438 22.226562 -23.8125 21.875 -23.8125 C 19.238281 -23.8125 17.171875 -23.070312 15.671875 -21.59375 C 14.179688 -20.125 13.4375 -17.914062 13.4375 -14.96875 L 13.4375 0 L 4.25 0 L 4.25 -31.71875 L 13.03125 -31.71875 Z M 13.03125 -27.53125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1299.885427, 171.512781)">
          <g>
            <path d="M 17.03125 -32.1875 C 21.945312 -32.1875 25.722656 -31.015625 28.359375 -28.671875 C 30.992188 -26.335938 32.3125 -22.8125 32.3125 -18.09375 L 32.3125 0 L 23.703125 0 L 23.703125 -3.953125 C 21.972656 -1.003906 18.75 0.46875 14.03125 0.46875 C 11.59375 0.46875 9.476562 0.0546875 7.6875 -0.765625 C 5.90625 -1.585938 4.539062 -2.722656 3.59375 -4.171875 C 2.65625 -5.628906 2.1875 -7.285156 2.1875 -9.140625 C 2.1875 -12.085938 3.296875 -14.40625 5.515625 -16.09375 C 7.734375 -17.78125 11.160156 -18.625 15.796875 -18.625 L 23.109375 -18.625 C 23.109375 -20.632812 22.5 -22.175781 21.28125 -23.25 C 20.0625 -24.332031 18.234375 -24.875 15.796875 -24.875 C 14.109375 -24.875 12.445312 -24.609375 10.8125 -24.078125 C 9.1875 -23.546875 7.800781 -22.832031 6.65625 -21.9375 L 3.359375 -28.359375 C 5.085938 -29.578125 7.160156 -30.519531 9.578125 -31.1875 C 11.992188 -31.851562 14.476562 -32.1875 17.03125 -32.1875 Z M 16.328125 -5.71875 C 17.898438 -5.71875 19.296875 -6.082031 20.515625 -6.8125 C 21.734375 -7.539062 22.597656 -8.609375 23.109375 -10.015625 L 23.109375 -13.265625 L 16.796875 -13.265625 C 13.023438 -13.265625 11.140625 -12.023438 11.140625 -9.546875 C 11.140625 -8.367188 11.597656 -7.4375 12.515625 -6.75 C 13.441406 -6.0625 14.710938 -5.71875 16.328125 -5.71875 Z M 16.328125 -5.71875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1336.253508, 171.512781)">
          <g>
            <path d="M 24.703125 -1.53125 C 23.796875 -0.863281 22.679688 -0.363281 21.359375 -0.03125 C 20.046875 0.300781 18.664062 0.46875 17.21875 0.46875 C 13.445312 0.46875 10.523438 -0.492188 8.453125 -2.421875 C 6.390625 -4.347656 5.359375 -7.175781 5.359375 -10.90625 L 5.359375 -23.9375 L 0.46875 -23.9375 L 0.46875 -31.015625 L 5.359375 -31.015625 L 5.359375 -38.734375 L 14.5625 -38.734375 L 14.5625 -31.015625 L 22.46875 -31.015625 L 22.46875 -23.9375 L 14.5625 -23.9375 L 14.5625 -11.03125 C 14.5625 -9.6875 14.90625 -8.648438 15.59375 -7.921875 C 16.28125 -7.203125 17.253906 -6.84375 18.515625 -6.84375 C 19.960938 -6.84375 21.195312 -7.234375 22.21875 -8.015625 Z M 24.703125 -1.53125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1361.893891, 171.512781)">
          <g>
            <path d="M 35.3125 -15.734375 C 35.3125 -15.617188 35.253906 -14.796875 35.140625 -13.265625 L 11.140625 -13.265625 C 11.578125 -11.296875 12.597656 -9.738281 14.203125 -8.59375 C 15.816406 -7.457031 17.820312 -6.890625 20.21875 -6.890625 C 21.875 -6.890625 23.335938 -7.132812 24.609375 -7.625 C 25.890625 -8.125 27.078125 -8.90625 28.171875 -9.96875 L 33.078125 -4.65625 C 30.085938 -1.238281 25.722656 0.46875 19.984375 0.46875 C 16.410156 0.46875 13.242188 -0.226562 10.484375 -1.625 C 7.734375 -3.019531 5.613281 -4.953125 4.125 -7.421875 C 2.632812 -9.898438 1.890625 -12.710938 1.890625 -15.859375 C 1.890625 -18.960938 2.625 -21.757812 4.09375 -24.25 C 5.570312 -26.75 7.597656 -28.695312 10.171875 -30.09375 C 12.742188 -31.488281 15.625 -32.1875 18.8125 -32.1875 C 21.914062 -32.1875 24.722656 -31.515625 27.234375 -30.171875 C 29.753906 -28.835938 31.726562 -26.921875 33.15625 -24.421875 C 34.59375 -21.929688 35.3125 -19.035156 35.3125 -15.734375 Z M 18.859375 -25.234375 C 16.773438 -25.234375 15.023438 -24.640625 13.609375 -23.453125 C 12.203125 -22.273438 11.34375 -20.664062 11.03125 -18.625 L 26.640625 -18.625 C 26.328125 -20.632812 25.460938 -22.238281 24.046875 -23.4375 C 22.640625 -24.632812 20.910156 -25.234375 18.859375 -25.234375 Z M 18.859375 -25.234375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1399.087187, 171.512781)">
          <g></g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1415.768168, 171.512781)">
          <g>
            <path d="M 18.453125 0.703125 C 15.191406 0.703125 12.035156 0.257812 8.984375 -0.625 C 5.941406 -1.507812 3.5 -2.65625 1.65625 -4.0625 L 4.890625 -11.265625 C 6.660156 -9.960938 8.765625 -8.914062 11.203125 -8.125 C 13.640625 -7.34375 16.078125 -6.953125 18.515625 -6.953125 C 21.222656 -6.953125 23.222656 -7.351562 24.515625 -8.15625 C 25.816406 -8.96875 26.46875 -10.039062 26.46875 -11.375 C 26.46875 -12.363281 26.082031 -13.179688 25.3125 -13.828125 C 24.550781 -14.472656 23.570312 -14.988281 22.375 -15.375 C 21.175781 -15.769531 19.554688 -16.207031 17.515625 -16.6875 C 14.367188 -17.425781 11.789062 -18.171875 9.78125 -18.921875 C 7.78125 -19.671875 6.0625 -20.867188 4.625 -22.515625 C 3.1875 -24.171875 2.46875 -26.375 2.46875 -29.125 C 2.46875 -31.519531 3.113281 -33.691406 4.40625 -35.640625 C 5.707031 -37.585938 7.664062 -39.128906 10.28125 -40.265625 C 12.894531 -41.398438 16.085938 -41.96875 19.859375 -41.96875 C 22.492188 -41.96875 25.066406 -41.65625 27.578125 -41.03125 C 30.097656 -40.40625 32.300781 -39.5 34.1875 -38.3125 L 31.25 -31.0625 C 27.4375 -33.226562 23.625 -34.3125 19.8125 -34.3125 C 17.132812 -34.3125 15.15625 -33.878906 13.875 -33.015625 C 12.601562 -32.148438 11.96875 -31.007812 11.96875 -29.59375 C 11.96875 -28.175781 12.703125 -27.125 14.171875 -26.4375 C 15.648438 -25.75 17.898438 -25.070312 20.921875 -24.40625 C 24.066406 -23.65625 26.640625 -22.90625 28.640625 -22.15625 C 30.648438 -21.414062 32.375 -20.238281 33.8125 -18.625 C 35.25 -17.019531 35.96875 -14.835938 35.96875 -12.078125 C 35.96875 -9.722656 35.304688 -7.570312 33.984375 -5.625 C 32.671875 -3.6875 30.695312 -2.144531 28.0625 -1 C 25.425781 0.132812 22.222656 0.703125 18.453125 0.703125 Z M 18.453125 0.703125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1453.374026, 171.512781)">
          <g>
            <path d="M 24.703125 -1.53125 C 23.796875 -0.863281 22.679688 -0.363281 21.359375 -0.03125 C 20.046875 0.300781 18.664062 0.46875 17.21875 0.46875 C 13.445312 0.46875 10.523438 -0.492188 8.453125 -2.421875 C 6.390625 -4.347656 5.359375 -7.175781 5.359375 -10.90625 L 5.359375 -23.9375 L 0.46875 -23.9375 L 0.46875 -31.015625 L 5.359375 -31.015625 L 5.359375 -38.734375 L 14.5625 -38.734375 L 14.5625 -31.015625 L 22.46875 -31.015625 L 22.46875 -23.9375 L 14.5625 -23.9375 L 14.5625 -11.03125 C 14.5625 -9.6875 14.90625 -8.648438 15.59375 -7.921875 C 16.28125 -7.203125 17.253906 -6.84375 18.515625 -6.84375 C 19.960938 -6.84375 21.195312 -7.234375 22.21875 -8.015625 Z M 24.703125 -1.53125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1479.014408, 171.512781)">
          <g>
            <path d="M 17.03125 -32.1875 C 21.945312 -32.1875 25.722656 -31.015625 28.359375 -28.671875 C 30.992188 -26.335938 32.3125 -22.8125 32.3125 -18.09375 L 32.3125 0 L 23.703125 0 L 23.703125 -3.953125 C 21.972656 -1.003906 18.75 0.46875 14.03125 0.46875 C 11.59375 0.46875 9.476562 0.0546875 7.6875 -0.765625 C 5.90625 -1.585938 4.539062 -2.722656 3.59375 -4.171875 C 2.65625 -5.628906 2.1875 -7.285156 2.1875 -9.140625 C 2.1875 -12.085938 3.296875 -14.40625 5.515625 -16.09375 C 7.734375 -17.78125 11.160156 -18.625 15.796875 -18.625 L 23.109375 -18.625 C 23.109375 -20.632812 22.5 -22.175781 21.28125 -23.25 C 20.0625 -24.332031 18.234375 -24.875 15.796875 -24.875 C 14.109375 -24.875 12.445312 -24.609375 10.8125 -24.078125 C 9.1875 -23.546875 7.800781 -22.832031 6.65625 -21.9375 L 3.359375 -28.359375 C 5.085938 -29.578125 7.160156 -30.519531 9.578125 -31.1875 C 11.992188 -31.851562 14.476562 -32.1875 17.03125 -32.1875 Z M 16.328125 -5.71875 C 17.898438 -5.71875 19.296875 -6.082031 20.515625 -6.8125 C 21.734375 -7.539062 22.597656 -8.609375 23.109375 -10.015625 L 23.109375 -13.265625 L 16.796875 -13.265625 C 13.023438 -13.265625 11.140625 -12.023438 11.140625 -9.546875 C 11.140625 -8.367188 11.597656 -7.4375 12.515625 -6.75 C 13.441406 -6.0625 14.710938 -5.71875 16.328125 -5.71875 Z M 16.328125 -5.71875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1515.38249, 171.512781)">
          <g>
            <path d="M 4.25 -43.75 L 13.4375 -43.75 L 13.4375 0 L 4.25 0 Z M 4.25 -43.75"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1533.124467, 171.512781)">
          <g>
            <path d="M 4.25 -43.75 L 13.4375 -43.75 L 13.4375 0 L 4.25 0 Z M 4.25 -43.75"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1550.866445, 171.512781)">
          <g>
            <path d="M 14.921875 0.46875 C 12.285156 0.46875 9.707031 0.144531 7.1875 -0.5 C 4.675781 -1.144531 2.671875 -1.960938 1.171875 -2.953125 L 4.25 -9.546875 C 5.65625 -8.640625 7.359375 -7.898438 9.359375 -7.328125 C 11.367188 -6.765625 13.335938 -6.484375 15.265625 -6.484375 C 19.160156 -6.484375 21.109375 -7.445312 21.109375 -9.375 C 21.109375 -10.28125 20.578125 -10.925781 19.515625 -11.3125 C 18.453125 -11.707031 16.820312 -12.046875 14.625 -12.328125 C 12.03125 -12.710938 9.882812 -13.160156 8.1875 -13.671875 C 6.5 -14.179688 5.035156 -15.082031 3.796875 -16.375 C 2.566406 -17.675781 1.953125 -19.53125 1.953125 -21.9375 C 1.953125 -23.9375 2.53125 -25.710938 3.6875 -27.265625 C 4.84375 -28.816406 6.53125 -30.023438 8.75 -30.890625 C 10.96875 -31.753906 13.59375 -32.1875 16.625 -32.1875 C 18.863281 -32.1875 21.09375 -31.941406 23.3125 -31.453125 C 25.53125 -30.960938 27.367188 -30.285156 28.828125 -29.421875 L 25.765625 -22.875 C 22.972656 -24.445312 19.925781 -25.234375 16.625 -25.234375 C 14.65625 -25.234375 13.179688 -24.957031 12.203125 -24.40625 C 11.222656 -23.851562 10.734375 -23.144531 10.734375 -22.28125 C 10.734375 -21.300781 11.257812 -20.613281 12.3125 -20.21875 C 13.375 -19.820312 15.066406 -19.445312 17.390625 -19.09375 C 19.984375 -18.664062 22.101562 -18.207031 23.75 -17.71875 C 25.40625 -17.226562 26.84375 -16.332031 28.0625 -15.03125 C 29.28125 -13.738281 29.890625 -11.929688 29.890625 -9.609375 C 29.890625 -7.640625 29.300781 -5.890625 28.125 -4.359375 C 26.945312 -2.828125 25.226562 -1.640625 22.96875 -0.796875 C 20.707031 0.046875 18.023438 0.46875 14.921875 0.46875 Z M 14.921875 0.46875"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B114)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.00104275 -0.00222183 L 132.694041 -0.00222183 L 132.694041 134.624666 L 0.00104275 134.624666 Z M 0.00104275 -0.00222183"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1953.592969, 301.935259)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1965.637951, 364.133812)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1987.598795, 364.133812)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2004.611814, 364.133812)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(2021.624834, 364.133812)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B131)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M 0.000144722 -0.000219208 L 132.693143 -0.000219208 L 132.693143 134.626669 L 0.000144722 134.626669 Z M 0.000144722 -0.000219208"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 370.835829, 201.996258)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(383.278877, 264.194811)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(405.23972, 264.194811)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(422.25274, 264.194811)">
          <g>
            <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(440.795371, 264.194811)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g clip-path="url(#B144)">
        <path
          stroke-miterlimit="4"
          stroke-opacity="1"
          stroke-width="10"
          stroke="#000000"
          d="M -0.000931699 -0.00182832 L 132.692066 -0.00182832 L 132.692066 134.62506 L -0.000931699 134.62506 Z M -0.000931699 -0.00182832"
          stroke-linejoin="miter"
          fill="none"
          transform="matrix(0.74938, 0, 0, 0.74938, 1254.090542, 0.825589)"
          stroke-linecap="butt"
        ></path>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1264.976327, 63.024142)">
          <g>
            <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1286.937171, 63.024142)">
          <g>
            <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1303.95019, 63.024142)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(1323.288843, 63.024142)">
          <g>
            <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(66.128477, 396.919475)">
          <g>
            <path d="M -37.0625 -37.015625 L 0 -37.015625 L 0 -33.15625 L -17.109375 -33.15625 L -17.109375 -9.953125 L 0 -9.953125 L 0 -6.03125 L -37.0625 -6.03125 L -37.0625 -9.953125 L -20.546875 -9.953125 L -20.546875 -33.15625 L -37.0625 -33.15625 Z M -37.0625 -37.015625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(66.128477, 353.872402)">
          <g>
            <path d="M -28.0625 -14.984375 C -28.0625 -18.617188 -27.148438 -21.40625 -25.328125 -23.34375 C -23.515625 -25.289062 -20.828125 -26.265625 -17.265625 -26.265625 L 0 -26.265625 L 0 -22.65625 L -4.34375 -22.65625 C -2.894531 -21.8125 -1.765625 -20.566406 -0.953125 -18.921875 C -0.140625 -17.285156 0.265625 -15.335938 0.265625 -13.078125 C 0.265625 -9.972656 -0.472656 -7.5 -1.953125 -5.65625 C -3.441406 -3.820312 -5.40625 -2.90625 -7.84375 -2.90625 C -10.207031 -2.90625 -12.113281 -3.757812 -13.5625 -5.46875 C -15.007812 -7.1875 -15.734375 -9.914062 -15.734375 -13.65625 L -15.734375 -22.5 L -17.421875 -22.5 C -19.816406 -22.5 -21.640625 -21.828125 -22.890625 -20.484375 C -24.148438 -19.148438 -24.78125 -17.191406 -24.78125 -14.609375 C -24.78125 -12.847656 -24.488281 -11.15625 -23.90625 -9.53125 C -23.320312 -7.90625 -22.519531 -6.507812 -21.5 -5.34375 L -24.3125 -3.65625 C -25.507812 -5.0625 -26.429688 -6.753906 -27.078125 -8.734375 C -27.734375 -10.710938 -28.0625 -12.796875 -28.0625 -14.984375 Z M -2.703125 -13.65625 C -2.703125 -15.78125 -3.1875 -17.597656 -4.15625 -19.109375 C -5.125 -20.628906 -6.523438 -21.757812 -8.359375 -22.5 L -12.921875 -22.5 L -12.921875 -13.765625 C -12.921875 -9.003906 -11.257812 -6.625 -7.9375 -6.625 C -6.3125 -6.625 -5.03125 -7.238281 -4.09375 -8.46875 C -3.164062 -9.707031 -2.703125 -11.4375 -2.703125 -13.65625 Z M -2.703125 -13.65625"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(66.128477, 322.632833)">
          <g>
            <path d="M -28.0625 -19.4375 C -28.0625 -22.925781 -27.046875 -25.703125 -25.015625 -27.765625 C -22.984375 -29.835938 -20.03125 -30.875 -16.15625 -30.875 L 0 -30.875 L 0 -27.109375 L -15.78125 -27.109375 C -18.675781 -27.109375 -20.878906 -26.382812 -22.390625 -24.9375 C -23.910156 -23.488281 -24.671875 -21.425781 -24.671875 -18.75 C -24.671875 -15.75 -23.78125 -13.375 -22 -11.625 C -20.21875 -9.875 -17.753906 -9 -14.609375 -9 L 0 -9 L 0 -5.25 L -27.859375 -5.25 L -27.859375 -8.84375 L -22.71875 -8.84375 C -24.414062 -9.863281 -25.726562 -11.28125 -26.65625 -13.09375 C -27.59375 -14.914062 -28.0625 -17.03125 -28.0625 -19.4375 Z M -28.0625 -19.4375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(66.128477, 286.786743)">
          <g>
            <path d="M -27.859375 -31.03125 L -3.390625 -31.03125 C 1.335938 -31.03125 4.835938 -29.875 7.109375 -27.5625 C 9.390625 -25.25 10.53125 -21.765625 10.53125 -17.109375 C 10.53125 -14.523438 10.148438 -12.078125 9.390625 -9.765625 C 8.640625 -7.453125 7.59375 -5.570312 6.25 -4.125 L 3.390625 -6.03125 C 4.585938 -7.375 5.519531 -9.007812 6.1875 -10.9375 C 6.863281 -12.863281 7.203125 -14.882812 7.203125 -17 C 7.203125 -20.53125 6.378906 -23.125 4.734375 -24.78125 C 3.097656 -26.4375 0.550781 -27.265625 -2.90625 -27.265625 L -6.453125 -27.265625 C -4.691406 -26.109375 -3.351562 -24.582031 -2.4375 -22.6875 C -1.519531 -20.800781 -1.0625 -18.710938 -1.0625 -16.421875 C -1.0625 -13.804688 -1.632812 -11.429688 -2.78125 -9.296875 C -3.925781 -7.160156 -5.53125 -5.484375 -7.59375 -4.265625 C -9.664062 -3.046875 -12.003906 -2.4375 -14.609375 -2.4375 C -17.222656 -2.4375 -19.550781 -3.046875 -21.59375 -4.265625 C -23.644531 -5.484375 -25.234375 -7.148438 -26.359375 -9.265625 C -27.492188 -11.378906 -28.0625 -13.765625 -28.0625 -16.421875 C -28.0625 -18.785156 -27.582031 -20.921875 -26.625 -22.828125 C -25.675781 -24.734375 -24.300781 -26.269531 -22.5 -27.4375 L -27.859375 -27.4375 Z M -4.390625 -16.78125 C -4.390625 -18.789062 -4.820312 -20.609375 -5.6875 -22.234375 C -6.550781 -23.859375 -7.757812 -25.117188 -9.3125 -26.015625 C -10.875 -26.921875 -12.640625 -27.375 -14.609375 -27.375 C -16.585938 -27.375 -18.34375 -26.921875 -19.875 -26.015625 C -21.414062 -25.117188 -22.617188 -23.867188 -23.484375 -22.265625 C -24.347656 -20.660156 -24.78125 -18.832031 -24.78125 -16.78125 C -24.78125 -14.769531 -24.351562 -12.960938 -23.5 -11.359375 C -22.65625 -9.753906 -21.457031 -8.5 -19.90625 -7.59375 C -18.351562 -6.695312 -16.585938 -6.25 -14.609375 -6.25 C -12.640625 -6.25 -10.875 -6.695312 -9.3125 -7.59375 C -7.757812 -8.5 -6.550781 -9.753906 -5.6875 -11.359375 C -4.820312 -12.960938 -4.390625 -14.769531 -4.390625 -16.78125 Z M -4.390625 -16.78125"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(66.128477, 250.464126)">
          <g>
            <path d="M -12.765625 -29.5 L -12.765625 -6.203125 C -9.867188 -6.410156 -7.53125 -7.519531 -5.75 -9.53125 C -3.96875 -11.539062 -3.078125 -14.082031 -3.078125 -17.15625 C -3.078125 -18.882812 -3.382812 -20.472656 -4 -21.921875 C -4.613281 -23.367188 -5.519531 -24.625 -6.71875 -25.6875 L -4.296875 -27.796875 C -2.804688 -26.566406 -1.671875 -25.023438 -0.890625 -23.171875 C -0.117188 -21.316406 0.265625 -19.273438 0.265625 -17.046875 C 0.265625 -14.191406 -0.34375 -11.660156 -1.5625 -9.453125 C -2.78125 -7.242188 -4.460938 -5.519531 -6.609375 -4.28125 C -8.765625 -3.050781 -11.203125 -2.4375 -13.921875 -2.4375 C -16.640625 -2.4375 -19.078125 -3.023438 -21.234375 -4.203125 C -23.390625 -5.390625 -25.066406 -7.015625 -26.265625 -9.078125 C -27.460938 -11.140625 -28.0625 -13.460938 -28.0625 -16.046875 C -28.0625 -18.617188 -27.460938 -20.925781 -26.265625 -22.96875 C -25.066406 -25.019531 -23.398438 -26.628906 -21.265625 -27.796875 C -19.128906 -28.960938 -16.679688 -29.546875 -13.921875 -29.546875 Z M -24.828125 -16.046875 C -24.828125 -13.359375 -23.972656 -11.101562 -22.265625 -9.28125 C -20.554688 -7.46875 -18.320312 -6.441406 -15.5625 -6.203125 L -15.5625 -25.953125 C -18.320312 -25.703125 -20.554688 -24.664062 -22.265625 -22.84375 C -23.972656 -21.03125 -24.828125 -18.765625 -24.828125 -16.046875 Z M -24.828125 -16.046875"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(66.128477, 218.483273)">
          <g>
            <path d="M -22.40625 -8.84375 C -24.269531 -9.726562 -25.675781 -11.039062 -26.625 -12.78125 C -27.582031 -14.53125 -28.0625 -16.695312 -28.0625 -19.28125 L -24.40625 -19.28125 L -24.46875 -18.375 C -24.46875 -15.445312 -23.566406 -13.148438 -21.765625 -11.484375 C -19.960938 -9.828125 -17.4375 -9 -14.1875 -9 L 0 -9 L 0 -5.25 L -27.859375 -5.25 L -27.859375 -8.84375 Z M -22.40625 -8.84375"></path>
          </g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(66.128477, 197.250965)">
          <g></g>
        </g>
      </g>
      <g fill-opacity="1" fill="#000000">
        <g transform="translate(66.128477, 183.378467)">
          <g>
            <path d="M -3.390625 -28.0625 L 0 -28.0625 L 0 -2.0625 L -2.703125 -2.0625 L -17.796875 -17.46875 C -19.703125 -19.414062 -21.347656 -20.734375 -22.734375 -21.421875 C -24.128906 -22.109375 -25.535156 -22.453125 -26.953125 -22.453125 C -29.140625 -22.453125 -30.84375 -21.703125 -32.0625 -20.203125 C -33.28125 -18.703125 -33.890625 -16.554688 -33.890625 -13.765625 C -33.890625 -9.421875 -32.515625 -6.050781 -29.765625 -3.65625 L -32.09375 -0.953125 C -33.78125 -2.398438 -35.082031 -4.242188 -36 -6.484375 C -36.925781 -8.722656 -37.390625 -11.253906 -37.390625 -14.078125 C -37.390625 -17.859375 -36.492188 -20.851562 -34.703125 -23.0625 C -32.921875 -25.269531 -30.476562 -26.375 -27.375 -26.375 C -25.46875 -26.375 -23.628906 -25.945312 -21.859375 -25.09375 C -20.097656 -24.25 -18.070312 -22.644531 -15.78125 -20.28125 L -3.390625 -7.671875 Z M -3.390625 -28.0625"></path>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default Hanger2;
