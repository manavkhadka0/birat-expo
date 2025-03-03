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

const Hanger1: React.FC<HangerOneProps> = ({
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
    <>
      <div className="text-center text-xl text-bold">
        Total Price: Rs. {totalPrice.toLocaleString()}
      </div>
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
          <clipPath id="03c0fa4260">
            <path
              clip-rule="nonzero"
              d="M 0.640625 0 L 2154.359375 0 L 2154.359375 604 L 0.640625 604 Z M 0.640625 0"
            ></path>
          </clipPath>
          <clipPath id="B20">
            <path
              clip-rule="nonzero"
              d="M 171.734375 402.832031 L 271.175781 402.832031 L 271.175781 603.664062 L 171.734375 603.664062 Z M 171.734375 402.832031"
            ></path>
          </clipPath>
          <clipPath id="B19">
            <path
              clip-rule="nonzero"
              d="M 271.183594 502.976562 L 370.621094 502.976562 L 370.621094 603.859375 L 271.183594 603.859375 Z M 271.183594 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B18">
            <path
              clip-rule="nonzero"
              d="M 370.628906 502.976562 L 470.066406 502.976562 L 470.066406 603.859375 L 370.628906 603.859375 Z M 370.628906 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B17">
            <path
              clip-rule="nonzero"
              d="M 470.078125 502.976562 L 569.515625 502.976562 L 569.515625 603.859375 L 470.078125 603.859375 Z M 470.078125 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B16">
            <path
              clip-rule="nonzero"
              d="M 569.523438 502.976562 L 668.960938 502.976562 L 668.960938 603.859375 L 569.523438 603.859375 Z M 569.523438 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B15">
            <path
              clip-rule="nonzero"
              d="M 668.972656 502.976562 L 768.410156 502.976562 L 768.410156 603.859375 L 668.972656 603.859375 Z M 668.972656 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B14">
            <path
              clip-rule="nonzero"
              d="M 761.675781 502.976562 L 861.113281 502.976562 L 861.113281 603.859375 L 761.675781 603.859375 Z M 761.675781 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B13">
            <path
              clip-rule="nonzero"
              d="M 861.121094 502.976562 L 960.558594 502.976562 L 960.558594 603.859375 L 861.121094 603.859375 Z M 861.121094 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B12">
            <path
              clip-rule="nonzero"
              d="M 960.570312 502.976562 L 1060.007812 502.976562 L 1060.007812 603.859375 L 960.570312 603.859375 Z M 960.570312 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B11">
            <path
              clip-rule="nonzero"
              d="M 1060.015625 502.976562 L 1159.453125 502.976562 L 1159.453125 603.859375 L 1060.015625 603.859375 Z M 1060.015625 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B10">
            <path
              clip-rule="nonzero"
              d="M 1159.464844 502.976562 L 1258.902344 502.976562 L 1258.902344 603.859375 L 1159.464844 603.859375 Z M 1159.464844 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B9">
            <path
              clip-rule="nonzero"
              d="M 1258.910156 502.976562 L 1358.347656 502.976562 L 1358.347656 603.859375 L 1258.910156 603.859375 Z M 1258.910156 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B8">
            <path
              clip-rule="nonzero"
              d="M 1358.359375 502.976562 L 1457.796875 502.976562 L 1457.796875 603.859375 L 1358.359375 603.859375 Z M 1358.359375 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B7">
            <path
              clip-rule="nonzero"
              d="M 1457.804688 502.976562 L 1557.242188 502.976562 L 1557.242188 603.859375 L 1457.804688 603.859375 Z M 1457.804688 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B6">
            <path
              clip-rule="nonzero"
              d="M 1557.25 502.976562 L 1656.691406 502.976562 L 1656.691406 603.859375 L 1557.25 603.859375 Z M 1557.25 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B5">
            <path
              clip-rule="nonzero"
              d="M 1656.699219 502.976562 L 1756.136719 502.976562 L 1756.136719 603.859375 L 1656.699219 603.859375 Z M 1656.699219 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B4">
            <path
              clip-rule="nonzero"
              d="M 1756.144531 502.976562 L 1855.585938 502.976562 L 1855.585938 603.859375 L 1756.144531 603.859375 Z M 1756.144531 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B3">
            <path
              clip-rule="nonzero"
              d="M 1855.59375 502.976562 L 1955.03125 502.976562 L 1955.03125 603.859375 L 1855.59375 603.859375 Z M 1855.59375 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B2">
            <path
              clip-rule="nonzero"
              d="M 1955.039062 502.976562 L 2054.476562 502.976562 L 2054.476562 603.859375 L 1955.039062 603.859375 Z M 1955.039062 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B1">
            <path
              clip-rule="nonzero"
              d="M 2054.488281 502.976562 L 2153.925781 502.976562 L 2153.925781 603.859375 L 2054.488281 603.859375 Z M 2054.488281 502.976562"
            ></path>
          </clipPath>
          <clipPath id="B22">
            <path
              clip-rule="nonzero"
              d="M 370.628906 301.1875 L 470.066406 301.1875 L 470.066406 402.070312 L 370.628906 402.070312 Z M 370.628906 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B23">
            <path
              clip-rule="nonzero"
              d="M 470.078125 301.1875 L 569.515625 301.1875 L 569.515625 402.070312 L 470.078125 402.070312 Z M 470.078125 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B24">
            <path
              clip-rule="nonzero"
              d="M 569.523438 301.1875 L 668.960938 301.1875 L 668.960938 402.070312 L 569.523438 402.070312 Z M 569.523438 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B25">
            <path
              clip-rule="nonzero"
              d="M 668.972656 301.1875 L 768.410156 301.1875 L 768.410156 402.070312 L 668.972656 402.070312 Z M 668.972656 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B26">
            <path
              clip-rule="nonzero"
              d="M 768.417969 301.1875 L 867.855469 301.1875 L 867.855469 402.070312 L 768.417969 402.070312 Z M 768.417969 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B27">
            <path
              clip-rule="nonzero"
              d="M 861.121094 301.1875 L 960.558594 301.1875 L 960.558594 402.070312 L 861.121094 402.070312 Z M 861.121094 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B28">
            <path
              clip-rule="nonzero"
              d="M 960.570312 301.1875 L 1060.007812 301.1875 L 1060.007812 402.070312 L 960.570312 402.070312 Z M 960.570312 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B29">
            <path
              clip-rule="nonzero"
              d="M 1060.015625 301.1875 L 1159.453125 301.1875 L 1159.453125 402.070312 L 1060.015625 402.070312 Z M 1060.015625 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B30">
            <path
              clip-rule="nonzero"
              d="M 1159.464844 301.1875 L 1258.902344 301.1875 L 1258.902344 402.070312 L 1159.464844 402.070312 Z M 1159.464844 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B31">
            <path
              clip-rule="nonzero"
              d="M 1258.910156 301.1875 L 1358.347656 301.1875 L 1358.347656 402.070312 L 1258.910156 402.070312 Z M 1258.910156 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B32">
            <path
              clip-rule="nonzero"
              d="M 1358.359375 301.1875 L 1457.796875 301.1875 L 1457.796875 402.070312 L 1358.359375 402.070312 Z M 1358.359375 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B33">
            <path
              clip-rule="nonzero"
              d="M 1457.804688 301.1875 L 1557.242188 301.1875 L 1557.242188 402.070312 L 1457.804688 402.070312 Z M 1457.804688 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B34">
            <path
              clip-rule="nonzero"
              d="M 1557.25 301.1875 L 1656.691406 301.1875 L 1656.691406 402.070312 L 1557.25 402.070312 Z M 1557.25 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B35">
            <path
              clip-rule="nonzero"
              d="M 1656.699219 301.1875 L 1756.136719 301.1875 L 1756.136719 402.070312 L 1656.699219 402.070312 Z M 1656.699219 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B36">
            <path
              clip-rule="nonzero"
              d="M 1756.144531 301.1875 L 1855.585938 301.1875 L 1855.585938 402.070312 L 1756.144531 402.070312 Z M 1756.144531 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B37">
            <path
              clip-rule="nonzero"
              d="M 1855.59375 301.1875 L 1955.03125 301.1875 L 1955.03125 402.070312 L 1855.59375 402.070312 Z M 1855.59375 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B38">
            <path
              clip-rule="nonzero"
              d="M 1955.039062 301.1875 L 2054.476562 301.1875 L 2054.476562 402.070312 L 1955.039062 402.070312 Z M 1955.039062 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B55">
            <path
              clip-rule="nonzero"
              d="M 370.628906 200.289062 L 470.066406 200.289062 L 470.066406 301.175781 L 370.628906 301.175781 Z M 370.628906 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B54">
            <path
              clip-rule="nonzero"
              d="M 470.078125 200.289062 L 569.515625 200.289062 L 569.515625 301.175781 L 470.078125 301.175781 Z M 470.078125 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B53">
            <path
              clip-rule="nonzero"
              d="M 569.523438 200.289062 L 668.960938 200.289062 L 668.960938 301.175781 L 569.523438 301.175781 Z M 569.523438 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B52">
            <path
              clip-rule="nonzero"
              d="M 668.972656 200.289062 L 768.410156 200.289062 L 768.410156 301.175781 L 668.972656 301.175781 Z M 668.972656 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B51">
            <path
              clip-rule="nonzero"
              d="M 768.417969 200.289062 L 867.855469 200.289062 L 867.855469 301.175781 L 768.417969 301.175781 Z M 768.417969 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B50">
            <path
              clip-rule="nonzero"
              d="M 861.121094 200.289062 L 960.558594 200.289062 L 960.558594 301.175781 L 861.121094 301.175781 Z M 861.121094 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B49">
            <path
              clip-rule="nonzero"
              d="M 960.570312 200.289062 L 1060.007812 200.289062 L 1060.007812 301.175781 L 960.570312 301.175781 Z M 960.570312 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B48">
            <path
              clip-rule="nonzero"
              d="M 1060.015625 200.289062 L 1159.453125 200.289062 L 1159.453125 301.175781 L 1060.015625 301.175781 Z M 1060.015625 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B47">
            <path
              clip-rule="nonzero"
              d="M 1159.464844 200.289062 L 1258.902344 200.289062 L 1258.902344 301.175781 L 1159.464844 301.175781 Z M 1159.464844 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B46">
            <path
              clip-rule="nonzero"
              d="M 1258.910156 200.289062 L 1358.347656 200.289062 L 1358.347656 301.175781 L 1258.910156 301.175781 Z M 1258.910156 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B45">
            <path
              clip-rule="nonzero"
              d="M 1358.359375 200.289062 L 1457.796875 200.289062 L 1457.796875 301.175781 L 1358.359375 301.175781 Z M 1358.359375 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B44">
            <path
              clip-rule="nonzero"
              d="M 1457.804688 200.289062 L 1557.242188 200.289062 L 1557.242188 301.175781 L 1457.804688 301.175781 Z M 1457.804688 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B43">
            <path
              clip-rule="nonzero"
              d="M 1557.25 200.289062 L 1656.691406 200.289062 L 1656.691406 301.175781 L 1557.25 301.175781 Z M 1557.25 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B42">
            <path
              clip-rule="nonzero"
              d="M 1656.699219 200.289062 L 1756.136719 200.289062 L 1756.136719 301.175781 L 1656.699219 301.175781 Z M 1656.699219 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B41">
            <path
              clip-rule="nonzero"
              d="M 1756.144531 200.289062 L 1855.585938 200.289062 L 1855.585938 301.175781 L 1756.144531 301.175781 Z M 1756.144531 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B40">
            <path
              clip-rule="nonzero"
              d="M 1855.59375 200.289062 L 1955.03125 200.289062 L 1955.03125 301.175781 L 1855.59375 301.175781 Z M 1855.59375 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B39">
            <path
              clip-rule="nonzero"
              d="M 1955.039062 200.289062 L 2054.476562 200.289062 L 2054.476562 301.175781 L 1955.039062 301.175781 Z M 1955.039062 200.289062"
            ></path>
          </clipPath>
          <clipPath id="B58">
            <path
              clip-rule="nonzero"
              d="M 271.183594 0 L 370.621094 0 L 370.621094 100.886719 L 271.183594 100.886719 Z M 271.183594 0"
            ></path>
          </clipPath>
          <clipPath id="B59">
            <path
              clip-rule="nonzero"
              d="M 370.628906 0 L 470.066406 0 L 470.066406 100.886719 L 370.628906 100.886719 Z M 370.628906 0"
            ></path>
          </clipPath>
          <clipPath id="B60">
            <path
              clip-rule="nonzero"
              d="M 470.078125 0 L 569.515625 0 L 569.515625 100.886719 L 470.078125 100.886719 Z M 470.078125 0"
            ></path>
          </clipPath>
          <clipPath id="B61">
            <path
              clip-rule="nonzero"
              d="M 569.523438 0 L 668.960938 0 L 668.960938 100.886719 L 569.523438 100.886719 Z M 569.523438 0"
            ></path>
          </clipPath>
          <clipPath id="B62">
            <path
              clip-rule="nonzero"
              d="M 668.972656 0 L 768.410156 0 L 768.410156 100.886719 L 668.972656 100.886719 Z M 668.972656 0"
            ></path>
          </clipPath>
          <clipPath id="B63">
            <path
              clip-rule="nonzero"
              d="M 761.675781 0 L 861.113281 0 L 861.113281 100.886719 L 761.675781 100.886719 Z M 761.675781 0"
            ></path>
          </clipPath>
          <clipPath id="B64">
            <path
              clip-rule="nonzero"
              d="M 861.121094 0 L 960.558594 0 L 960.558594 100.886719 L 861.121094 100.886719 Z M 861.121094 0"
            ></path>
          </clipPath>
          <clipPath id="B65">
            <path
              clip-rule="nonzero"
              d="M 960.570312 0 L 1060.007812 0 L 1060.007812 100.886719 L 960.570312 100.886719 Z M 960.570312 0"
            ></path>
          </clipPath>
          <clipPath id="B66">
            <path
              clip-rule="nonzero"
              d="M 1060.015625 0 L 1159.453125 0 L 1159.453125 100.886719 L 1060.015625 100.886719 Z M 1060.015625 0"
            ></path>
          </clipPath>
          <clipPath id="B67">
            <path
              clip-rule="nonzero"
              d="M 1159.464844 0 L 1258.902344 0 L 1258.902344 100.886719 L 1159.464844 100.886719 Z M 1159.464844 0"
            ></path>
          </clipPath>
          <clipPath id="B68">
            <path
              clip-rule="nonzero"
              d="M 1258.910156 0 L 1358.347656 0 L 1358.347656 100.886719 L 1258.910156 100.886719 Z M 1258.910156 0"
            ></path>
          </clipPath>
          <clipPath id="B69">
            <path
              clip-rule="nonzero"
              d="M 1358.359375 0 L 1457.796875 0 L 1457.796875 100.886719 L 1358.359375 100.886719 Z M 1358.359375 0"
            ></path>
          </clipPath>
          <clipPath id="B70">
            <path
              clip-rule="nonzero"
              d="M 1457.804688 0 L 1557.242188 0 L 1557.242188 100.886719 L 1457.804688 100.886719 Z M 1457.804688 0"
            ></path>
          </clipPath>
          <clipPath id="B71">
            <path
              clip-rule="nonzero"
              d="M 1557.25 0 L 1656.691406 0 L 1656.691406 100.886719 L 1557.25 100.886719 Z M 1557.25 0"
            ></path>
          </clipPath>
          <clipPath id="B72">
            <path
              clip-rule="nonzero"
              d="M 1656.699219 0 L 1756.136719 0 L 1756.136719 100.886719 L 1656.699219 100.886719 Z M 1656.699219 0"
            ></path>
          </clipPath>
          <clipPath id="B73">
            <path
              clip-rule="nonzero"
              d="M 1756.144531 0 L 1855.585938 0 L 1855.585938 100.886719 L 1756.144531 100.886719 Z M 1756.144531 0"
            ></path>
          </clipPath>
          <clipPath id="B74">
            <path
              clip-rule="nonzero"
              d="M 1855.59375 0 L 1955.03125 0 L 1955.03125 100.886719 L 1855.59375 100.886719 Z M 1855.59375 0"
            ></path>
          </clipPath>
          <clipPath id="B75">
            <path
              clip-rule="nonzero"
              d="M 1955.039062 0 L 2054.476562 0 L 2054.476562 100.886719 L 1955.039062 100.886719 Z M 1955.039062 0"
            ></path>
          </clipPath>
          <clipPath id="B76">
            <path
              clip-rule="nonzero"
              d="M 2054.488281 0 L 2153.925781 0 L 2153.925781 100.886719 L 2054.488281 100.886719 Z M 2054.488281 0"
            ></path>
          </clipPath>
          <clipPath id="B57">
            <path
              clip-rule="nonzero"
              d="M 171.734375 0 L 271.175781 0 L 271.175781 200.832031 L 171.734375 200.832031 Z M 171.734375 0"
            ></path>
          </clipPath>
          <clipPath id="B21">
            <path
              clip-rule="nonzero"
              d="M 171.734375 301.1875 L 271.175781 301.1875 L 271.175781 402.070312 L 171.734375 402.070312 Z M 171.734375 301.1875"
            ></path>
          </clipPath>
          <clipPath id="B56">
            <path
              clip-rule="nonzero"
              d="M 171.734375 200.289062 L 271.175781 200.289062 L 271.175781 301.175781 L 171.734375 301.175781 Z M 171.734375 200.289062"
            ></path>
          </clipPath>
        </defs>
        <g clip-path="url(#03c0fa4260)">
          <path
            fill-rule="nonzero"
            fill-opacity="1"
            d="M 0.640625 0 L 2154.359375 0 L 2154.359375 604 L 0.640625 604 Z M 0.640625 0"
            fill="#ffffff"
          ></path>
        </g>
        <g clip-path="url(#B20)">
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
          <g transform="translate(190.478698, 515.237178)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(212.439542, 515.237178)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(229.983243, 515.237178)">
            <g>
              <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B19)">
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
          <g transform="translate(291.143587, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(313.10443, 565.174235)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(330.11745, 565.174235)">
            <g>
              <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B18)">
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
          <g transform="translate(391.19965, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(413.160493, 565.174235)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(430.173513, 565.174235)">
            <g>
              <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B17)">
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
          <g transform="translate(492.426567, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(514.38741, 565.174235)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(531.40043, 565.174235)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B16)">
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
          <g transform="translate(589.473385, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(611.434229, 565.174235)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(628.447248, 565.174235)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B15)">
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
          <g transform="translate(689.75193, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(711.712774, 565.174235)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(728.725793, 565.174235)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B14)">
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
          <g transform="translate(782.232166, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(804.19301, 565.174235)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(821.206029, 565.174235)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B13)">
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
          <g transform="translate(882.077404, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(904.038247, 565.174235)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(921.051267, 565.174235)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B12)">
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
          <g transform="translate(982.028094, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1003.988938, 565.174235)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1021.001958, 565.174235)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B11)">
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
          <g transform="translate(1081.732871, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1103.693714, 565.174235)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1120.706734, 565.174235)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B10)">
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
          <g transform="translate(1178.463449, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1200.424293, 565.174235)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1217.437312, 565.174235)">
            <g>
              <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B9)">
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
          <g transform="translate(1287.371551, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1309.332394, 565.174235)">
            <g>
              <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B8)">
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
          <g transform="translate(1387.439333, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1409.400176, 565.174235)">
            <g>
              <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B7)">
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
          <g transform="translate(1488.654578, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1510.615422, 565.174235)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B6)">
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
          <g transform="translate(1585.701301, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1607.662145, 565.174235)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B5)">
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
          <g transform="translate(1685.991651, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1707.952495, 565.174235)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B4)">
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
          <g transform="translate(1785.204551, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1807.165394, 565.174235)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B3)">
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
          <g transform="translate(1885.049741, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1907.010584, 565.174235)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B2)">
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
          <g transform="translate(1985.000527, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(2006.961371, 565.174235)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B1)">
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
          <g transform="translate(2084.716917, 565.174235)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(2106.67776, 565.174235)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B22)">
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
          <g transform="translate(391.82023, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(413.781074, 363.384432)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(431.324775, 363.384432)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B23)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.000659885 0.00216361 L 132.693658 0.00216361 L 132.693658 134.623839 L 0.000659885 134.623839 Z M 0.000659885 0.00216361"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 470.07763, 301.185879)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(490.763879, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(512.724723, 363.384432)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(530.268424, 363.384432)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B24)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00186038 0.00216361 L 132.691138 0.00216361 L 132.691138 134.623839 L -0.00186038 134.623839 Z M -0.00186038 0.00216361"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 569.524832, 301.185879)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(589.812948, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(611.773792, 363.384432)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(629.317493, 363.384432)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B25)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.000831988 0.00216361 L 132.69383 0.00216361 L 132.69383 134.623839 L 0.000831988 134.623839 Z M 0.000831988 0.00216361"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 668.972033, 301.185879)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(689.494331, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(711.455174, 363.384432)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(728.998876, 363.384432)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B26)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00165628 0.00216361 L 132.691342 0.00216361 L 132.691342 134.623839 L -0.00165628 134.623839 Z M -0.00165628 0.00216361"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 768.41921, 301.185879)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(788.098455, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(810.059299, 363.384432)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(827.603, 363.384432)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B27)">
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
          <g transform="translate(883.201474, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(905.162317, 363.384432)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(922.706019, 363.384432)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B28)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.00168829 0.00216361 L 132.694686 0.00216361 L 132.694686 134.623839 L 0.00168829 134.623839 Z M 0.00168829 0.00216361"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 960.569047, 301.185879)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(980.880606, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1002.841449, 363.384432)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1020.385151, 363.384432)">
            <g>
              <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B29)">
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
          <g transform="translate(1079.707203, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1101.668046, 363.384432)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1119.211748, 363.384432)">
            <g>
              <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B30)">
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
          <g transform="translate(1177.70236, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1199.663203, 363.384432)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1218.205835, 363.384432)">
            <g>
              <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B31)">
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
          <g transform="translate(1279.86604, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1301.826884, 363.384432)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1320.369515, 363.384432)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B32)">
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
          <g transform="translate(1379.043933, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1401.004776, 363.384432)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1419.547407, 363.384432)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B33)">
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
          <g transform="translate(1477.999329, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1499.960173, 363.384432)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1518.502804, 363.384432)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B34)">
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
          <g transform="translate(1577.048302, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1599.009146, 363.384432)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1617.551777, 363.384432)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B35)">
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
          <g transform="translate(1676.718072, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1698.678915, 363.384432)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1717.221546, 363.384432)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B36)">
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
          <g transform="translate(1775.333809, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1797.294653, 363.384432)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1815.837284, 363.384432)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B37)">
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
          <g transform="translate(1877.16954, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1899.130383, 363.384432)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1917.673014, 363.384432)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B38)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00215183 0.00216361 L 132.690846 0.00216361 L 132.690846 134.623839 L -0.00215183 134.623839 Z M -0.00215183 0.00216361"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1955.040675, 301.185879)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1974.848768, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1996.809611, 363.384432)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(2015.352243, 363.384432)">
            <g>
              <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B55)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00214129 -0.00259802 L 132.690857 -0.00259802 L 132.690857 134.62429 L -0.00214129 134.62429 Z M -0.00214129 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 370.630511, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(390.473688, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(412.434531, 262.489563)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(431.320544, 262.489563)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B54)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.000659885 -0.00259802 L 132.693658 -0.00259802 L 132.693658 134.62429 L 0.000659885 134.62429 Z M 0.000659885 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 470.07763, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(489.698354, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(511.659198, 262.489563)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(530.545211, 262.489563)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B53)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00186038 -0.00259802 L 132.691138 -0.00259802 L 132.691138 134.62429 L -0.00186038 134.62429 Z M -0.00186038 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 569.524832, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(589.54364, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(611.504483, 262.489563)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(630.390496, 262.489563)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B52)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.000831988 -0.00259802 L 132.69383 -0.00259802 L 132.69383 134.62429 L 0.000831988 134.62429 Z M 0.000831988 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 668.972033, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(689.494331, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(711.455174, 262.489563)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(730.341187, 262.489563)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B51)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00165628 -0.00259802 L 132.691342 -0.00259802 L 132.691342 134.62429 L -0.00165628 134.62429 Z M -0.00165628 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 768.41921, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(789.199107, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(811.159951, 262.489563)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(830.045964, 262.489563)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B50)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00103608 -0.00259802 L 132.691962 -0.00259802 L 132.691962 134.62429 L -0.00103608 134.62429 Z M -0.00103608 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 861.12187, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(879.185265, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(901.146108, 262.489563)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(920.032121, 262.489563)">
            <g>
              <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B49)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.00168829 -0.00259802 L 132.694686 -0.00259802 L 132.694686 134.62429 L 0.00168829 134.62429 Z M 0.00168829 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 960.569047, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(979.358428, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1001.319271, 262.489563)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1020.657924, 262.489563)">
            <g>
              <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B48)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.000735977 -0.00259802 L 132.692262 -0.00259802 L 132.692262 134.62429 L -0.000735977 134.62429 Z M -0.000735977 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1060.016177, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1079.426185, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1101.387029, 262.489563)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1120.725681, 262.489563)">
            <g>
              <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B47)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.0021164 -0.00259802 L 132.695114 -0.00259802 L 132.695114 134.62429 L 0.0021164 134.62429 Z M 0.0021164 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1159.463258, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1180.641335, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1202.602179, 262.489563)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1221.940831, 262.489563)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B46)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.000403874 -0.00259802 L 132.692594 -0.00259802 L 132.692594 134.62429 L -0.000403874 134.62429 Z M -0.000403874 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1258.910459, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1277.699863, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1299.660707, 262.489563)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1318.999359, 262.489563)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B45)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.0023205 -0.00259802 L 132.695318 -0.00259802 L 132.695318 134.62429 L 0.0023205 134.62429 Z M 0.0023205 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1358.357636, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1377.978408, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1399.939251, 262.489563)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1419.277904, 262.489563)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B44)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.000199771 -0.00259802 L 132.692798 -0.00259802 L 132.692798 134.62429 L -0.000199771 134.62429 Z M -0.000199771 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1457.804837, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1477.203113, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1499.163956, 262.489563)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1518.502609, 262.489563)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B43)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00252804 -0.00259802 L 132.695683 -0.00259802 L 132.695683 134.62429 L -0.00252804 134.62429 Z M -0.00252804 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1557.251894, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1577.048302, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1599.009146, 262.489563)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1618.347799, 262.489563)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B42)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.0000043318 -0.00259802 L 132.693002 -0.00259802 L 132.693002 134.62429 L 0.0000043318 134.62429 Z M 0.0000043318 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1656.699216, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1676.98738, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1698.948224, 262.489563)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1718.286876, 262.489563)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B41)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00235594 -0.00259802 L 132.695855 -0.00259802 L 132.695855 134.62429 L -0.00235594 134.62429 Z M -0.00235594 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1756.146297, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1776.70377, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1798.664613, 262.489563)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1818.003266, 262.489563)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B40)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.000528435 -0.00259802 L 132.693526 -0.00259802 L 132.693526 134.62429 L 0.000528435 134.62429 Z M 0.000528435 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1855.593354, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1873.434348, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1895.395191, 262.489563)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1914.733844, 262.489563)">
            <g>
              <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B39)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00215183 -0.00259802 L 132.690846 -0.00259802 L 132.690846 134.62429 L -0.00215183 134.62429 Z M -0.00215183 -0.00259802"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1955.040675, 200.291009)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1974.228188, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1996.189031, 262.489563)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(2014.731662, 262.489563)">
            <g>
              <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B58)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.000366183 -0.000000000000397904 L 132.693364 -0.000000000000397904 L 132.693364 134.626888 L 0.000366183 134.626888 Z M 0.000366183 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 271.183319, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(290.815733, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(312.776577, 62.198553)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(331.662589, 62.198553)">
            <g>
              <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B59)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00214129 -0.000000000000397904 L 132.690857 -0.000000000000397904 L 132.690857 134.626888 L -0.00214129 134.626888 Z M -0.00214129 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 370.630511, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(389.654053, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(411.614897, 62.198553)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(430.50091, 62.198553)">
            <g>
              <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B60)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.000659885 -0.000000000000397904 L 132.693658 -0.000000000000397904 L 132.693658 134.626888 L 0.000659885 134.626888 Z M 0.000659885 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 470.07763, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(487.309705, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(509.270549, 62.198553)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(529.826647, 62.198553)">
            <g>
              <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B61)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00186038 -0.00000000000017053 L 132.691138 -0.00000000000017053 L 132.691138 134.626888 L -0.00186038 134.626888 Z M -0.00186038 -0.00000000000017053"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 569.524832, 0.000000000000127792)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(589.473385, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(611.434229, 62.198553)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(631.990327, 62.198553)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B62)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.000831988 -0.000000000000397904 L 132.69383 -0.000000000000397904 L 132.69383 134.626888 L 0.000831988 134.626888 Z M 0.000831988 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 668.972033, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(688.651278, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(710.612121, 62.198553)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(731.168219, 62.198553)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B63)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.00138819 -0.000000000000397904 L 132.694386 -0.000000000000397904 L 132.694386 134.626888 L 0.00138819 134.626888 Z M 0.00138819 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 761.674741, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(780.862206, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(802.823049, 62.198553)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(823.379147, 62.198553)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B64)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00103608 -0.000000000000397904 L 132.691962 -0.000000000000397904 L 132.691962 134.626888 L -0.00103608 134.626888 Z M -0.00103608 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 861.12187, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(879.911227, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(901.87207, 62.198553)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(922.428168, 62.198553)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B65)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.00168829 -0.000000000000397904 L 132.694686 -0.000000000000397904 L 132.694686 134.626888 L 0.00168829 134.626888 Z M 0.00168829 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 960.569047, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(979.5809, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1001.541743, 62.198553)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1022.097841, 62.198553)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B66)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.000735977 -0.000000000000397904 L 132.692262 -0.000000000000397904 L 132.692262 134.626888 L -0.000735977 134.626888 Z M -0.000735977 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1060.016177, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1078.196733, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1100.157577, 62.198553)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1120.713675, 62.198553)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B67)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.0021164 -0.00000000000017053 L 132.695114 -0.00000000000017053 L 132.695114 134.626888 L 0.0021164 134.626888 Z M 0.0021164 -0.00000000000017053"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1159.463258, 0.000000000000127792)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1180.032464, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1201.993307, 62.198553)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1222.549405, 62.198553)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B68)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.000403874 -0.000000000000397904 L 132.692594 -0.000000000000397904 L 132.692594 134.626888 L -0.000403874 134.626888 Z M -0.000403874 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1258.910459, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1277.711572, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1299.672416, 62.198553)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1320.228514, 62.198553)">
            <g>
              <path d="M 9.640625 0.328125 C 7.984375 0.328125 6.5625 0.0625 5.375 -0.46875 C 4.195312 -1.007812 3.300781 -1.773438 2.6875 -2.765625 C 2.070312 -3.765625 1.765625 -4.941406 1.765625 -6.296875 C 1.765625 -7.734375 2.125 -8.9375 2.84375 -9.90625 C 3.5625 -10.875 4.625 -11.632812 6.03125 -12.1875 L 6.03125 -12.515625 C 5.039062 -13.109375 4.273438 -13.796875 3.734375 -14.578125 C 3.203125 -15.367188 2.9375 -16.300781 2.9375 -17.375 C 2.9375 -18.539062 3.210938 -19.554688 3.765625 -20.421875 C 4.316406 -21.296875 5.097656 -21.96875 6.109375 -22.4375 C 7.128906 -22.914062 8.304688 -23.15625 9.640625 -23.15625 C 10.984375 -23.15625 12.164062 -22.914062 13.1875 -22.4375 C 14.207031 -21.96875 14.992188 -21.296875 15.546875 -20.421875 C 16.097656 -19.554688 16.375 -18.539062 16.375 -17.375 C 16.375 -16.300781 16.101562 -15.367188 15.5625 -14.578125 C 15.019531 -13.796875 14.253906 -13.109375 13.265625 -12.515625 L 13.265625 -12.1875 C 14.679688 -11.632812 15.75 -10.875 16.46875 -9.90625 C 17.1875 -8.9375 17.546875 -7.734375 17.546875 -6.296875 C 17.546875 -4.929688 17.238281 -3.753906 16.625 -2.765625 C 16.007812 -1.773438 15.109375 -1.007812 13.921875 -0.46875 C 12.734375 0.0625 11.304688 0.328125 9.640625 0.328125 Z M 9.640625 -13.234375 C 10.453125 -13.234375 11.164062 -13.382812 11.78125 -13.6875 C 12.40625 -14 12.890625 -14.441406 13.234375 -15.015625 C 13.585938 -15.597656 13.765625 -16.28125 13.765625 -17.0625 C 13.765625 -17.851562 13.585938 -18.539062 13.234375 -19.125 C 12.890625 -19.707031 12.40625 -20.15625 11.78125 -20.46875 C 11.15625 -20.78125 10.441406 -20.9375 9.640625 -20.9375 C 8.390625 -20.9375 7.394531 -20.585938 6.65625 -19.890625 C 5.914062 -19.203125 5.546875 -18.257812 5.546875 -17.0625 C 5.546875 -15.875 5.914062 -14.9375 6.65625 -14.25 C 7.394531 -13.570312 8.390625 -13.234375 9.640625 -13.234375 Z M 9.640625 -2.03125 C 11.285156 -2.03125 12.546875 -2.421875 13.421875 -3.203125 C 14.296875 -3.984375 14.734375 -5.070312 14.734375 -6.46875 C 14.734375 -7.84375 14.296875 -8.921875 13.421875 -9.703125 C 12.546875 -10.492188 11.285156 -10.890625 9.640625 -10.890625 C 8.003906 -10.890625 6.75 -10.492188 5.875 -9.703125 C 5 -8.921875 4.5625 -7.84375 4.5625 -6.46875 C 4.5625 -5.070312 5 -3.984375 5.875 -3.203125 C 6.75 -2.421875 8.003906 -2.03125 9.640625 -2.03125 Z M 9.640625 -2.03125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B69)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.0023205 -0.000000000000397904 L 132.695318 -0.000000000000397904 L 132.695318 134.626888 L 0.0023205 134.626888 Z M 0.0023205 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1358.357636, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1376.538193, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1398.499036, 62.198553)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1419.055134, 62.198553)">
            <g>
              <path d="M 9.640625 0.328125 C 7.671875 0.328125 6.066406 -0.117188 4.828125 -1.015625 C 3.597656 -1.921875 2.816406 -3.160156 2.484375 -4.734375 L 4.46875 -5.640625 L 4.828125 -5.578125 C 5.191406 -4.421875 5.75 -3.550781 6.5 -2.96875 C 7.257812 -2.382812 8.304688 -2.09375 9.640625 -2.09375 C 11.535156 -2.09375 12.984375 -2.882812 13.984375 -4.46875 C 14.984375 -6.050781 15.484375 -8.492188 15.484375 -11.796875 L 15.15625 -11.890625 C 14.519531 -10.585938 13.710938 -9.613281 12.734375 -8.96875 C 11.753906 -8.332031 10.519531 -8.015625 9.03125 -8.015625 C 7.613281 -8.015625 6.375 -8.320312 5.3125 -8.9375 C 4.257812 -9.5625 3.445312 -10.441406 2.875 -11.578125 C 2.3125 -12.710938 2.03125 -14.035156 2.03125 -15.546875 C 2.03125 -17.054688 2.34375 -18.382812 2.96875 -19.53125 C 3.59375 -20.6875 4.476562 -21.578125 5.625 -22.203125 C 6.78125 -22.835938 8.117188 -23.15625 9.640625 -23.15625 C 12.316406 -23.15625 14.410156 -22.25 15.921875 -20.4375 C 17.441406 -18.632812 18.203125 -15.710938 18.203125 -11.671875 C 18.203125 -8.953125 17.84375 -6.695312 17.125 -4.90625 C 16.40625 -3.113281 15.40625 -1.789062 14.125 -0.9375 C 12.851562 -0.09375 11.359375 0.328125 9.640625 0.328125 Z M 9.640625 -10.359375 C 10.671875 -10.359375 11.566406 -10.5625 12.328125 -10.96875 C 13.085938 -11.375 13.671875 -11.96875 14.078125 -12.75 C 14.492188 -13.53125 14.703125 -14.460938 14.703125 -15.546875 C 14.703125 -16.628906 14.492188 -17.5625 14.078125 -18.34375 C 13.671875 -19.125 13.085938 -19.71875 12.328125 -20.125 C 11.566406 -20.539062 10.671875 -20.75 9.640625 -20.75 C 8.140625 -20.75 6.960938 -20.300781 6.109375 -19.40625 C 5.253906 -18.519531 4.828125 -17.234375 4.828125 -15.546875 C 4.828125 -13.859375 5.253906 -12.570312 6.109375 -11.6875 C 6.960938 -10.800781 8.140625 -10.359375 9.640625 -10.359375 Z M 9.640625 -10.359375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B70)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.000199771 -0.000000000000397904 L 132.692798 -0.000000000000397904 L 132.692798 134.626888 L -0.000199771 134.626888 Z M -0.000199771 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1457.804837, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1477.437294, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1499.398138, 62.198553)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1515.162496, 62.198553)">
            <g>
              <path d="M 11.21875 0.328125 C 9.539062 0.328125 8.035156 -0.0703125 6.703125 -0.875 C 5.378906 -1.6875 4.320312 -2.96875 3.53125 -4.71875 C 2.738281 -6.476562 2.34375 -8.707031 2.34375 -11.40625 C 2.34375 -14.113281 2.738281 -16.34375 3.53125 -18.09375 C 4.320312 -19.851562 5.378906 -21.132812 6.703125 -21.9375 C 8.035156 -22.75 9.539062 -23.15625 11.21875 -23.15625 C 12.894531 -23.15625 14.398438 -22.75 15.734375 -21.9375 C 17.066406 -21.132812 18.125 -19.851562 18.90625 -18.09375 C 19.695312 -16.34375 20.09375 -14.113281 20.09375 -11.40625 C 20.09375 -8.707031 19.695312 -6.476562 18.90625 -4.71875 C 18.125 -2.96875 17.066406 -1.6875 15.734375 -0.875 C 14.398438 -0.0703125 12.894531 0.328125 11.21875 0.328125 Z M 11.21875 -2.15625 C 13.207031 -2.15625 14.710938 -2.867188 15.734375 -4.296875 C 16.765625 -5.734375 17.28125 -8.101562 17.28125 -11.40625 C 17.28125 -14.71875 16.765625 -17.085938 15.734375 -18.515625 C 14.710938 -19.953125 13.207031 -20.671875 11.21875 -20.671875 C 9.90625 -20.671875 8.800781 -20.367188 7.90625 -19.765625 C 7.019531 -19.160156 6.335938 -18.175781 5.859375 -16.8125 C 5.390625 -15.445312 5.15625 -13.644531 5.15625 -11.40625 C 5.15625 -9.164062 5.390625 -7.363281 5.859375 -6 C 6.335938 -4.644531 7.019531 -3.664062 7.90625 -3.0625 C 8.800781 -2.457031 9.90625 -2.15625 11.21875 -2.15625 Z M 11.21875 -2.15625"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B71)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00252804 -0.000000000000397904 L 132.695683 -0.000000000000397904 L 132.695683 134.626888 L -0.00252804 134.626888 Z M -0.00252804 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1557.251894, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1579.600879, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1601.561722, 62.198553)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1617.32608, 62.198553)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B72)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.0000043318 -0.000000000000397904 L 132.693002 -0.000000000000397904 L 132.693002 134.626888 L 0.0000043318 134.626888 Z M 0.0000043318 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1656.699216, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1678.778867, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1700.73971, 62.198553)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1716.504069, 62.198553)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B73)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00235594 -0.00000000000017053 L 132.695855 -0.00000000000017053 L 132.695855 134.626888 L -0.00235594 134.626888 Z M -0.00235594 -0.00000000000017053"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1756.146297, 0.000000000000127792)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1777.722459, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1799.683302, 62.198553)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1815.44766, 62.198553)">
            <g>
              <path d="M 9.03125 0.328125 C 6.820312 0.328125 5.066406 -0.171875 3.765625 -1.171875 C 2.460938 -2.171875 1.617188 -3.554688 1.234375 -5.328125 L 3.234375 -6.234375 L 3.59375 -6.171875 C 3.988281 -4.804688 4.597656 -3.785156 5.421875 -3.109375 C 6.253906 -2.429688 7.457031 -2.09375 9.03125 -2.09375 C 10.644531 -2.09375 11.875 -2.460938 12.71875 -3.203125 C 13.5625 -3.941406 13.984375 -5.03125 13.984375 -6.46875 C 13.984375 -7.863281 13.550781 -8.929688 12.6875 -9.671875 C 11.832031 -10.410156 10.484375 -10.78125 8.640625 -10.78125 L 6.171875 -10.78125 L 6.171875 -13 L 8.375 -13 C 9.8125 -13 10.953125 -13.351562 11.796875 -14.0625 C 12.648438 -14.78125 13.078125 -15.789062 13.078125 -17.09375 C 13.078125 -18.332031 12.707031 -19.257812 11.96875 -19.875 C 11.238281 -20.5 10.210938 -20.8125 8.890625 -20.8125 C 6.597656 -20.8125 4.960938 -19.894531 3.984375 -18.0625 L 3.625 -18 L 2.125 -19.640625 C 2.738281 -20.691406 3.625 -21.539062 4.78125 -22.1875 C 5.9375 -22.832031 7.304688 -23.15625 8.890625 -23.15625 C 10.347656 -23.15625 11.585938 -22.925781 12.609375 -22.46875 C 13.640625 -22.019531 14.421875 -21.367188 14.953125 -20.515625 C 15.484375 -19.660156 15.75 -18.640625 15.75 -17.453125 C 15.75 -16.328125 15.421875 -15.335938 14.765625 -14.484375 C 14.117188 -13.640625 13.257812 -12.972656 12.1875 -12.484375 L 12.1875 -12.15625 C 13.695312 -11.789062 14.832031 -11.109375 15.59375 -10.109375 C 16.351562 -9.117188 16.734375 -7.90625 16.734375 -6.46875 C 16.734375 -4.300781 16.085938 -2.625 14.796875 -1.4375 C 13.503906 -0.257812 11.582031 0.328125 9.03125 0.328125 Z M 9.03125 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B74)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.000528435 -0.000000000000397904 L 132.693526 -0.000000000000397904 L 132.693526 134.626888 L 0.000528435 134.626888 Z M 0.000528435 -0.000000000000397904"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1855.593354, 0.000000000000298181)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1876.771432, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1898.732275, 62.198553)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1914.496633, 62.198553)">
            <g>
              <path d="M 14.28125 0 L 11.734375 0 L 11.734375 -5.453125 L 1.046875 -5.453125 L 1.046875 -7.609375 L 11.109375 -22.828125 L 14.28125 -22.828125 L 14.28125 -7.609375 L 18.234375 -7.609375 L 18.234375 -5.453125 L 14.28125 -5.453125 Z M 4.203125 -7.9375 L 4.34375 -7.609375 L 11.734375 -7.609375 L 11.734375 -19.109375 L 11.375 -19.171875 Z M 4.203125 -7.9375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B75)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M -0.00215183 -0.00000000000017053 L 132.690846 -0.00000000000017053 L 132.690846 134.626888 L -0.00215183 134.626888 Z M -0.00215183 -0.00000000000017053"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 1955.040675, 0.000000000000127792)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1976.45291, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(1998.413753, 62.198553)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(2014.178112, 62.198553)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B76)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.000572537 0.000000000000056843 L 132.69357 0.000000000000056843 L 132.69357 134.626888 L 0.000572537 134.626888 Z M 0.000572537 0.000000000000056843"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 2054.487852, -0.000000000000042597)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(2075.056938, 62.198553)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(2097.017782, 62.198553)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(2112.78214, 62.198553)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B57)">
          <path
            stroke-miterlimit="4"
            stroke-opacity="1"
            stroke-width="10"
            stroke="#000000"
            d="M 0.00144661 -0.000000000000738964 L 132.699644 -0.000000000000738964 L 132.699644 268.263348 L 0.00144661 268.263348 Z M 0.00144661 -0.000000000000738964"
            stroke-linejoin="miter"
            fill="none"
            transform="matrix(0.74938, 0, 0, 0.74938, 171.733291, 0.000000000000553765)"
            stroke-linecap="butt"
          ></path>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(193.148365, 112.407024)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(215.109208, 112.407024)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(233.995221, 112.407024)">
            <g>
              <path d="M 6.203125 0 L 3.59375 0 L 12.0625 -20.21875 L 11.96875 -20.546875 L 0.84375 -20.546875 L 0.84375 -22.828125 L 14.765625 -22.828125 L 14.765625 -20.359375 Z M 6.203125 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B21)">
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
          <g transform="translate(193.195201, 363.384432)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(215.156045, 363.384432)">
            <g>
              <path d="M 1.375 -1.046875 C 1.375 -2.304688 1.507812 -3.320312 1.78125 -4.09375 C 2.0625 -4.863281 2.535156 -5.582031 3.203125 -6.25 C 3.867188 -6.914062 4.929688 -7.773438 6.390625 -8.828125 L 8.890625 -10.65625 C 9.816406 -11.332031 10.570312 -11.957031 11.15625 -12.53125 C 11.738281 -13.101562 12.195312 -13.722656 12.53125 -14.390625 C 12.875 -15.066406 13.046875 -15.820312 13.046875 -16.65625 C 13.046875 -18.007812 12.6875 -19.03125 11.96875 -19.71875 C 11.25 -20.40625 10.125 -20.75 8.59375 -20.75 C 7.394531 -20.75 6.328125 -20.46875 5.390625 -19.90625 C 4.453125 -19.34375 3.703125 -18.546875 3.140625 -17.515625 L 2.78125 -17.453125 L 1.171875 -19.140625 C 1.941406 -20.390625 2.953125 -21.367188 4.203125 -22.078125 C 5.460938 -22.796875 6.925781 -23.15625 8.59375 -23.15625 C 10.21875 -23.15625 11.566406 -22.878906 12.640625 -22.328125 C 13.710938 -21.773438 14.503906 -21.007812 15.015625 -20.03125 C 15.523438 -19.0625 15.78125 -17.9375 15.78125 -16.65625 C 15.78125 -15.632812 15.566406 -14.679688 15.140625 -13.796875 C 14.710938 -12.910156 14.109375 -12.078125 13.328125 -11.296875 C 12.546875 -10.515625 11.566406 -9.691406 10.390625 -8.828125 L 7.859375 -6.984375 C 6.910156 -6.285156 6.179688 -5.691406 5.671875 -5.203125 C 5.160156 -4.710938 4.785156 -4.234375 4.546875 -3.765625 C 4.316406 -3.304688 4.203125 -2.789062 4.203125 -2.21875 L 15.78125 -2.21875 L 15.78125 0 L 1.375 0 Z M 1.375 -1.046875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(232.699746, 363.384432)">
            <g>
              <path d="M 1.625 0 L 1.625 -2.21875 L 7.859375 -2.21875 L 7.859375 -19.671875 L 7.5 -19.765625 C 6.488281 -19.265625 5.601562 -18.878906 4.84375 -18.609375 C 4.082031 -18.347656 3.109375 -18.09375 1.921875 -17.84375 L 1.921875 -20.3125 C 3.097656 -20.5625 4.257812 -20.898438 5.40625 -21.328125 C 6.5625 -21.753906 7.601562 -22.253906 8.53125 -22.828125 L 10.46875 -22.828125 L 10.46875 -2.21875 L 16.046875 -2.21875 L 16.046875 0 Z M 1.625 0"></path>
            </g>
          </g>
        </g>
        <g clip-path="url(#B56)">
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
          <g transform="translate(190.748007, 262.489563)">
            <g>
              <path d="M 3.453125 0 L 3.453125 -22.828125 L 12.09375 -22.828125 C 13.5 -22.828125 14.691406 -22.601562 15.671875 -22.15625 C 16.648438 -21.707031 17.382812 -21.066406 17.875 -20.234375 C 18.375 -19.410156 18.625 -18.425781 18.625 -17.28125 C 18.625 -16.289062 18.351562 -15.394531 17.8125 -14.59375 C 17.28125 -13.789062 16.515625 -13.164062 15.515625 -12.71875 L 15.515625 -12.390625 C 17.035156 -12.015625 18.1875 -11.332031 18.96875 -10.34375 C 19.757812 -9.351562 20.15625 -8.113281 20.15625 -6.625 C 20.15625 -4.5 19.53125 -2.863281 18.28125 -1.71875 C 17.039062 -0.570312 15.195312 0 12.75 0 Z M 11.96875 -13.234375 C 13.226562 -13.234375 14.207031 -13.5625 14.90625 -14.21875 C 15.601562 -14.882812 15.953125 -15.796875 15.953125 -16.953125 C 15.953125 -18.171875 15.613281 -19.082031 14.9375 -19.6875 C 14.269531 -20.300781 13.28125 -20.609375 11.96875 -20.609375 L 6.140625 -20.609375 L 6.140625 -13.234375 Z M 12.546875 -2.21875 C 15.796875 -2.21875 17.421875 -3.6875 17.421875 -6.625 C 17.421875 -9.550781 15.796875 -11.015625 12.546875 -11.015625 L 6.140625 -11.015625 L 6.140625 -2.21875 Z M 12.546875 -2.21875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(212.70885, 262.489563)">
            <g>
              <path d="M 9.390625 0.328125 C 7.265625 0.328125 5.5625 -0.144531 4.28125 -1.09375 C 3.007812 -2.039062 2.179688 -3.382812 1.796875 -5.125 L 3.78125 -6.03125 L 4.140625 -5.96875 C 4.398438 -5.082031 4.738281 -4.359375 5.15625 -3.796875 C 5.582031 -3.234375 6.140625 -2.804688 6.828125 -2.515625 C 7.515625 -2.234375 8.367188 -2.09375 9.390625 -2.09375 C 10.929688 -2.09375 12.128906 -2.550781 12.984375 -3.46875 C 13.847656 -4.394531 14.28125 -5.738281 14.28125 -7.5 C 14.28125 -9.28125 13.859375 -10.632812 13.015625 -11.5625 C 12.171875 -12.5 11.003906 -12.96875 9.515625 -12.96875 C 8.390625 -12.96875 7.472656 -12.738281 6.765625 -12.28125 C 6.054688 -11.820312 5.429688 -11.117188 4.890625 -10.171875 L 2.734375 -10.359375 L 3.171875 -22.828125 L 15.953125 -22.828125 L 15.953125 -20.546875 L 5.515625 -20.546875 L 5.25 -12.96875 L 5.578125 -12.90625 C 6.117188 -13.695312 6.773438 -14.285156 7.546875 -14.671875 C 8.316406 -15.066406 9.242188 -15.265625 10.328125 -15.265625 C 11.691406 -15.265625 12.878906 -14.957031 13.890625 -14.34375 C 14.910156 -13.738281 15.695312 -12.851562 16.25 -11.6875 C 16.8125 -10.519531 17.09375 -9.125 17.09375 -7.5 C 17.09375 -5.875 16.769531 -4.472656 16.125 -3.296875 C 15.488281 -2.117188 14.585938 -1.21875 13.421875 -0.59375 C 12.265625 0.0195312 10.921875 0.328125 9.390625 0.328125 Z M 9.390625 0.328125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(231.594863, 262.489563)">
            <g>
              <path d="M 10.890625 0.328125 C 9.273438 0.328125 7.828125 -0.0546875 6.546875 -0.828125 C 5.273438 -1.609375 4.253906 -2.875 3.484375 -4.625 C 2.722656 -6.375 2.34375 -8.632812 2.34375 -11.40625 C 2.34375 -14.101562 2.722656 -16.328125 3.484375 -18.078125 C 4.253906 -19.835938 5.296875 -21.125 6.609375 -21.9375 C 7.929688 -22.75 9.441406 -23.15625 11.140625 -23.15625 C 14.066406 -23.15625 16.222656 -22.265625 17.609375 -20.484375 L 16.296875 -18.71875 L 15.90625 -18.71875 C 14.78125 -20.070312 13.191406 -20.75 11.140625 -20.75 C 9.160156 -20.75 7.648438 -20 6.609375 -18.5 C 5.578125 -17.007812 5.0625 -14.625 5.0625 -11.34375 L 5.390625 -11.25 C 6.015625 -12.539062 6.820312 -13.507812 7.8125 -14.15625 C 8.8125 -14.800781 10.039062 -15.125 11.5 -15.125 C 12.945312 -15.125 14.195312 -14.816406 15.25 -14.203125 C 16.3125 -13.585938 17.125 -12.695312 17.6875 -11.53125 C 18.25 -10.375 18.53125 -9.007812 18.53125 -7.4375 C 18.53125 -5.851562 18.21875 -4.476562 17.59375 -3.3125 C 16.96875 -2.144531 16.078125 -1.242188 14.921875 -0.609375 C 13.773438 0.015625 12.429688 0.328125 10.890625 0.328125 Z M 10.890625 -2.09375 C 12.398438 -2.09375 13.582031 -2.550781 14.4375 -3.46875 C 15.289062 -4.382812 15.71875 -5.707031 15.71875 -7.4375 C 15.71875 -9.164062 15.289062 -10.488281 14.4375 -11.40625 C 13.582031 -12.320312 12.398438 -12.78125 10.890625 -12.78125 C 9.859375 -12.78125 8.960938 -12.566406 8.203125 -12.140625 C 7.453125 -11.722656 6.867188 -11.113281 6.453125 -10.3125 C 6.046875 -9.507812 5.84375 -8.550781 5.84375 -7.4375 C 5.84375 -6.320312 6.046875 -5.363281 6.453125 -4.5625 C 6.867188 -3.757812 7.453125 -3.144531 8.203125 -2.71875 C 8.960938 -2.300781 9.859375 -2.09375 10.890625 -2.09375 Z M 10.890625 -2.09375"></path>
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
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(66.128477, 426.760472)">
            <g>
              <path d="M -37.0625 -37.015625 L 0 -37.015625 L 0 -33.15625 L -17.109375 -33.15625 L -17.109375 -9.953125 L 0 -9.953125 L 0 -6.03125 L -37.0625 -6.03125 L -37.0625 -9.953125 L -20.546875 -9.953125 L -20.546875 -33.15625 L -37.0625 -33.15625 Z M -37.0625 -37.015625"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(66.128477, 383.713398)">
            <g>
              <path d="M -28.0625 -14.984375 C -28.0625 -18.617188 -27.148438 -21.40625 -25.328125 -23.34375 C -23.515625 -25.289062 -20.828125 -26.265625 -17.265625 -26.265625 L 0 -26.265625 L 0 -22.65625 L -4.34375 -22.65625 C -2.894531 -21.8125 -1.765625 -20.566406 -0.953125 -18.921875 C -0.140625 -17.285156 0.265625 -15.335938 0.265625 -13.078125 C 0.265625 -9.972656 -0.472656 -7.5 -1.953125 -5.65625 C -3.441406 -3.820312 -5.40625 -2.90625 -7.84375 -2.90625 C -10.207031 -2.90625 -12.113281 -3.757812 -13.5625 -5.46875 C -15.007812 -7.1875 -15.734375 -9.914062 -15.734375 -13.65625 L -15.734375 -22.5 L -17.421875 -22.5 C -19.816406 -22.5 -21.640625 -21.828125 -22.890625 -20.484375 C -24.148438 -19.148438 -24.78125 -17.191406 -24.78125 -14.609375 C -24.78125 -12.847656 -24.488281 -11.15625 -23.90625 -9.53125 C -23.320312 -7.90625 -22.519531 -6.507812 -21.5 -5.34375 L -24.3125 -3.65625 C -25.507812 -5.0625 -26.429688 -6.753906 -27.078125 -8.734375 C -27.734375 -10.710938 -28.0625 -12.796875 -28.0625 -14.984375 Z M -2.703125 -13.65625 C -2.703125 -15.78125 -3.1875 -17.597656 -4.15625 -19.109375 C -5.125 -20.628906 -6.523438 -21.757812 -8.359375 -22.5 L -12.921875 -22.5 L -12.921875 -13.765625 C -12.921875 -9.003906 -11.257812 -6.625 -7.9375 -6.625 C -6.3125 -6.625 -5.03125 -7.238281 -4.09375 -8.46875 C -3.164062 -9.707031 -2.703125 -11.4375 -2.703125 -13.65625 Z M -2.703125 -13.65625"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(66.128477, 352.47383)">
            <g>
              <path d="M -28.0625 -19.4375 C -28.0625 -22.925781 -27.046875 -25.703125 -25.015625 -27.765625 C -22.984375 -29.835938 -20.03125 -30.875 -16.15625 -30.875 L 0 -30.875 L 0 -27.109375 L -15.78125 -27.109375 C -18.675781 -27.109375 -20.878906 -26.382812 -22.390625 -24.9375 C -23.910156 -23.488281 -24.671875 -21.425781 -24.671875 -18.75 C -24.671875 -15.75 -23.78125 -13.375 -22 -11.625 C -20.21875 -9.875 -17.753906 -9 -14.609375 -9 L 0 -9 L 0 -5.25 L -27.859375 -5.25 L -27.859375 -8.84375 L -22.71875 -8.84375 C -24.414062 -9.863281 -25.726562 -11.28125 -26.65625 -13.09375 C -27.59375 -14.914062 -28.0625 -17.03125 -28.0625 -19.4375 Z M -28.0625 -19.4375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(66.128477, 316.627739)">
            <g>
              <path d="M -27.859375 -31.03125 L -3.390625 -31.03125 C 1.335938 -31.03125 4.835938 -29.875 7.109375 -27.5625 C 9.390625 -25.25 10.53125 -21.765625 10.53125 -17.109375 C 10.53125 -14.523438 10.148438 -12.078125 9.390625 -9.765625 C 8.640625 -7.453125 7.59375 -5.570312 6.25 -4.125 L 3.390625 -6.03125 C 4.585938 -7.375 5.519531 -9.007812 6.1875 -10.9375 C 6.863281 -12.863281 7.203125 -14.882812 7.203125 -17 C 7.203125 -20.53125 6.378906 -23.125 4.734375 -24.78125 C 3.097656 -26.4375 0.550781 -27.265625 -2.90625 -27.265625 L -6.453125 -27.265625 C -4.691406 -26.109375 -3.351562 -24.582031 -2.4375 -22.6875 C -1.519531 -20.800781 -1.0625 -18.710938 -1.0625 -16.421875 C -1.0625 -13.804688 -1.632812 -11.429688 -2.78125 -9.296875 C -3.925781 -7.160156 -5.53125 -5.484375 -7.59375 -4.265625 C -9.664062 -3.046875 -12.003906 -2.4375 -14.609375 -2.4375 C -17.222656 -2.4375 -19.550781 -3.046875 -21.59375 -4.265625 C -23.644531 -5.484375 -25.234375 -7.148438 -26.359375 -9.265625 C -27.492188 -11.378906 -28.0625 -13.765625 -28.0625 -16.421875 C -28.0625 -18.785156 -27.582031 -20.921875 -26.625 -22.828125 C -25.675781 -24.734375 -24.300781 -26.269531 -22.5 -27.4375 L -27.859375 -27.4375 Z M -4.390625 -16.78125 C -4.390625 -18.789062 -4.820312 -20.609375 -5.6875 -22.234375 C -6.550781 -23.859375 -7.757812 -25.117188 -9.3125 -26.015625 C -10.875 -26.921875 -12.640625 -27.375 -14.609375 -27.375 C -16.585938 -27.375 -18.34375 -26.921875 -19.875 -26.015625 C -21.414062 -25.117188 -22.617188 -23.867188 -23.484375 -22.265625 C -24.347656 -20.660156 -24.78125 -18.832031 -24.78125 -16.78125 C -24.78125 -14.769531 -24.351562 -12.960938 -23.5 -11.359375 C -22.65625 -9.753906 -21.457031 -8.5 -19.90625 -7.59375 C -18.351562 -6.695312 -16.585938 -6.25 -14.609375 -6.25 C -12.640625 -6.25 -10.875 -6.695312 -9.3125 -7.59375 C -7.757812 -8.5 -6.550781 -9.753906 -5.6875 -11.359375 C -4.820312 -12.960938 -4.390625 -14.769531 -4.390625 -16.78125 Z M -4.390625 -16.78125"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(66.128477, 280.305122)">
            <g>
              <path d="M -12.765625 -29.5 L -12.765625 -6.203125 C -9.867188 -6.410156 -7.53125 -7.519531 -5.75 -9.53125 C -3.96875 -11.539062 -3.078125 -14.082031 -3.078125 -17.15625 C -3.078125 -18.882812 -3.382812 -20.472656 -4 -21.921875 C -4.613281 -23.367188 -5.519531 -24.625 -6.71875 -25.6875 L -4.296875 -27.796875 C -2.804688 -26.566406 -1.671875 -25.023438 -0.890625 -23.171875 C -0.117188 -21.316406 0.265625 -19.273438 0.265625 -17.046875 C 0.265625 -14.191406 -0.34375 -11.660156 -1.5625 -9.453125 C -2.78125 -7.242188 -4.460938 -5.519531 -6.609375 -4.28125 C -8.765625 -3.050781 -11.203125 -2.4375 -13.921875 -2.4375 C -16.640625 -2.4375 -19.078125 -3.023438 -21.234375 -4.203125 C -23.390625 -5.390625 -25.066406 -7.015625 -26.265625 -9.078125 C -27.460938 -11.140625 -28.0625 -13.460938 -28.0625 -16.046875 C -28.0625 -18.617188 -27.460938 -20.925781 -26.265625 -22.96875 C -25.066406 -25.019531 -23.398438 -26.628906 -21.265625 -27.796875 C -19.128906 -28.960938 -16.679688 -29.546875 -13.921875 -29.546875 Z M -24.828125 -16.046875 C -24.828125 -13.359375 -23.972656 -11.101562 -22.265625 -9.28125 C -20.554688 -7.46875 -18.320312 -6.441406 -15.5625 -6.203125 L -15.5625 -25.953125 C -18.320312 -25.703125 -20.554688 -24.664062 -22.265625 -22.84375 C -23.972656 -21.03125 -24.828125 -18.765625 -24.828125 -16.046875 Z M -24.828125 -16.046875"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(66.128477, 248.324269)">
            <g>
              <path d="M -22.40625 -8.84375 C -24.269531 -9.726562 -25.675781 -11.039062 -26.625 -12.78125 C -27.582031 -14.53125 -28.0625 -16.695312 -28.0625 -19.28125 L -24.40625 -19.28125 L -24.46875 -18.375 C -24.46875 -15.445312 -23.566406 -13.148438 -21.765625 -11.484375 C -19.960938 -9.828125 -17.4375 -9 -14.1875 -9 L 0 -9 L 0 -5.25 L -27.859375 -5.25 L -27.859375 -8.84375 Z M -22.40625 -8.84375"></path>
            </g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(66.128477, 227.091961)">
            <g></g>
          </g>
        </g>
        <g fill-opacity="1" fill="#000000">
          <g transform="translate(66.128477, 213.219463)">
            <g>
              <path d="M -37.0625 -13.03125 L 0 -13.03125 L 0 -9.21875 L -33.671875 -9.21875 L -33.671875 -0.484375 L -37.0625 -0.484375 Z M -37.0625 -13.03125"></path>
            </g>
          </g>
        </g>
      </svg>
    </>
  );
};

export default Hanger1;
