import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import PatternVisualizer from "./PatternVisualizer";

const NatalChart = ({ bodies, aspects, houses, patterns, structuredAspects }) => {
  const ref = useRef();

  useEffect(() => {
    if (!houses || houses.length !== 12) {
      console.warn("❗ Дома не загружены или неполные:", houses);
      return;
    }

    const width = 560;
    const height = 560;
    const center = 280;
    const radiusZodiacOuter = 268.33;
    const radiusZodiacInner = 240;
    const houseOuter = 180;
    const houseInner = 140;
    const labelRadius = 160;
    const aspectRadius = 135;
    const planetSymbolRadius = 210;

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f7f0fa")
      .style("border-radius", "12px")
      .style("box-shadow", "0 0 12px rgba(0,0,0,0.1)");

    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${center},${center})`);

    const bg = g.append("g").attr("id", "background");
    bg.append("circle").attr("r", radiusZodiacOuter).attr("fill", "#4B0082");
    bg.append("circle").attr("r", radiusZodiacInner).attr("fill", "white");

    const houseGroup = g.append("g").attr("id", "houses");
    const normalized = houses.map((h, i) => {
      let deg = Number(h.degree);
      if (isNaN(deg)) deg = 0;
      return { ...h, normDeg: deg };
    });
    for (let i = 1; i < normalized.length; i++) {
      if (normalized[i].normDeg < normalized[i - 1].normDeg) {
        normalized[i].normDeg += 360;
      }
    }
    for (let i = 0; i < normalized.length; i++) {
      const current = normalized[i];
      const next = normalized[(i + 1) % 12];
      let startDeg = current.normDeg;
      let endDeg = next.normDeg;
      if (i === 11 && endDeg < startDeg) endDeg += 360;
      const startAngle = (-(startDeg - 90)) * (Math.PI / 180);
      const endAngle = (-(endDeg - 90)) * (Math.PI / 180);
      const arc = d3.arc().innerRadius(houseInner).outerRadius(houseOuter).startAngle(startAngle).endAngle(endAngle);
      houseGroup.append("path").attr("d", arc()).attr("fill", "#eeeeee");
      const extendedRadius = houseOuter + 60;
      const x1 = houseInner * Math.cos(startAngle);
      const y1 = houseInner * Math.sin(startAngle);
      const x2 = extendedRadius * Math.cos(startAngle);
      const y2 = extendedRadius * Math.sin(startAngle);
      houseGroup.append("line")
        .attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2)
        .attr("stroke", "#aaa").attr("stroke-width", 1).raise();
      const midDeg = startDeg + (endDeg - startDeg) / 2;
      const midAngle = (-(midDeg - 90)) * (Math.PI / 180);
      const xLabel = labelRadius * Math.cos(midAngle);
      const yLabel = labelRadius * Math.sin(midAngle);
      houseGroup.append("text")
        .attr("x", xLabel).attr("y", yLabel).attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle").attr("font-size", "15px")
        .attr("fill", "#444").attr("font-family", "Roboto, sans-serif")
        .text(current.symbol || i + 1);
    }

    const fg = g.append("g").attr("id", "foreground");
    const zodiacSigns = ["РЫБЫ", "ВОДОЛЕЙ", "КОЗЕРОГ", "СТРЕЛЕЦ", "СКОРПИОН", "ВЕСЫ", "ДЕВА", "ЛЕВ", "РАК", "БЛИЗНЕЦЫ", "ТЕЛЕЦ", "ОВЕН"];
    const zodiacRadius = 252;
    const zodiacLineInnerRadius = 240;
    const zodiacLineOuterRadius = 268.33;
    zodiacSigns.forEach((sign, i) => {
      const angle = (i * 30 - 75) * (Math.PI / 180);
      const x = zodiacRadius * Math.cos(angle);
      const y = zodiacRadius * Math.sin(angle);
      const rotation = (angle * 180) / Math.PI + 90;
      fg.append("text")
        .attr("x", x).attr("y", y).attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("transform", `rotate(${rotation}, ${x}, ${y})`)
        .attr("fill", "white").attr("font-family", "Roboto, sans-serif")
        .attr("font-size", "14px").text(sign);
    });
    for (let i = 0; i < 12; i++) {
      const angle = ((i * 30 + 15) - 75) * (Math.PI / 180);
      const x1 = zodiacLineInnerRadius * Math.cos(angle);
      const y1 = zodiacLineInnerRadius * Math.sin(angle);
      const x2 = zodiacLineOuterRadius * Math.cos(angle);
      const y2 = zodiacLineOuterRadius * Math.sin(angle);
      fg.append("line")
        .attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2)
        .attr("stroke", "white").attr("stroke-width", 4);
    }

    const getCoordFromDegree = (degree, r) => {
      const angle = (degree - 90) * (Math.PI / 180);
      return [r * Math.cos(angle), r * Math.sin(angle)];
    };

    const getColorByAspect = (aspect) => {
      const map = {
        "square": "#f44336",
        "□": "#f44336",
        "opposition": "#e91e63",
        "☍": "#e91e63",
        "trine": "#2196f3",
        "△": "#2196f3",
        "sextile": "#4caf50",
        "✶": "#4caf50",
        "conjunction": "#ffeb3b",
        "☌": "#ffeb3b",
        "quincunx": "#9c27b0",
        "⚻": "#9c27b0",
      };
      return map[aspect?.toLowerCase()] || "#bbb";
    };

    aspects?.forEach((asp) => {
      const from = bodies[asp.from_body || asp.from];
      const to = bodies[asp.to_body || asp.to];
      if (!from || !to) return;

      const [x1, y1] = getCoordFromDegree(from.degree, aspectRadius);
      const [x2, y2] = getCoordFromDegree(to.degree, aspectRadius);

      g.append("line")
        .attr("x1", x1).attr("y1", y1)
        .attr("x2", x2).attr("y2", y2)
        .attr("stroke", getColorByAspect(asp.aspect))
        .attr("stroke-width", 2.5)
        .attr("opacity", 1);
    });

    Object.entries(bodies || {}).forEach(([key, body]) => {
      const [x, y] = getCoordFromDegree(body.degree, planetSymbolRadius);
      g.append("text")
        .attr("x", x).attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "16px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "#222")
        .text(body.symbol || key);
    });
  }, [bodies, aspects, houses]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 30 }}>
      <svg ref={ref}></svg>

      {/* ♻️ Паттерны (patterns) */}
      <PatternVisualizer patterns={patterns} />

      {/* ✴️ Аспекты по категориям */}
      <div style={{ marginTop: "30px", maxWidth: 600 }}>
        <h3>Аспекты:</h3>
        <strong>Мажорные:</strong>
        <ul>
          {structuredAspects?.major.map((asp, i) => (
            <li key={i}>{asp}</li>
          ))}
        </ul>
        <strong>Минорные:</strong>
        <ul>
          {structuredAspects?.minor.map((asp, i) => (
            <li key={i}>{asp}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NatalChart;
