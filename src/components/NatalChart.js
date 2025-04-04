import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import PatternVisualizer from "./PatternVisualizer";

const signs = [
  "ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO",
  "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORN", "AQUARIUS", "PISCES"
];

const NatalChart = ({ chartId, bodies, aspects, pointsData, patterns, structuredAspects }) => {
  const ref = useRef();

  useEffect(() => {
    const width = 600;
    const height = 600;
    const radiusOuter = 240;
    const radiusMiddle = 210;
    const radiusInner = 180;
    const centerX = width / 2;
    const centerY = height / 2;

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f9f4fc")
      .style("border-radius", "12px")
      .style("box-shadow", "0 0 12px rgba(0,0,0,0.1)");

    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    g.append("circle")
      .attr("r", radiusOuter)
      .attr("fill", "#fdfbff")
      .attr("stroke", "#673ab7")
      .attr("stroke-width", 14);

    g.append("circle")
      .attr("r", radiusInner)
      .attr("fill", "none")
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1);

    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const xOuter = radiusOuter * Math.cos(angle);
      const yOuter = radiusOuter * Math.sin(angle);

      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", xOuter)
        .attr("y2", yOuter)
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 1);

      const labelX = (radiusOuter - 10) * Math.cos(angle);
      const labelY = (radiusOuter - 10) * Math.sin(angle);

      g.append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "12px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "#333")
        .text(signs[i]);

      const houseX = (radiusOuter - 30) * Math.cos(angle);
      const houseY = (radiusOuter - 30) * Math.sin(angle);

      g.append("text")
        .attr("x", houseX)
        .attr("y", houseY)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#888")
        .text(i + 1);
    }

    const findBodyKeyBySymbol = (symbol) => {
      return Object.entries(bodies).find(([_, body]) => body.symbol === symbol)?.[0];
    };

    const getCoordFromDegree = (degree, r) => {
      const angle = (degree - 90) * (Math.PI / 180);
      return [r * Math.cos(angle), r * Math.sin(angle)];
    };

    const getColorByAspect = (aspect) => {
      switch (aspect.toLowerCase()) {
        case "square":
        case "opposition": return "#f44336";
        case "trine":
        case "sextile": return "#4caf50";
        case "conjunction": return "#ffeb3b";
        default: return "#bbb";
      }
    };

    Object.entries(bodies).forEach(([key, body]) => {
      const [x, y] = getCoordFromDegree(body.degree, radiusMiddle);

      g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 6)
        .attr("fill", "#ff4081")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);

      g.append("text")
        .attr("x", x)
        .attr("y", y - 12)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-family", "Arial, sans-serif")
        .attr("fill", "#222")
        .text(body.symbol || key);
    });

    aspects.forEach((asp) => {
      const fromSymbol = asp.from_body || asp.from;
      const toSymbol = asp.to_body || asp.to;

      const fromKey = findBodyKeyBySymbol(fromSymbol);
      const toKey = findBodyKeyBySymbol(toSymbol);

      if (!fromKey || !toKey) return;

      const fromBody = bodies[fromKey];
      const toBody = bodies[toKey];

      if (!fromBody || !toBody) return;

      const [x1, y1] = getCoordFromDegree(fromBody.degree, radiusInner);
      const [x2, y2] = getCoordFromDegree(toBody.degree, radiusInner);

      g.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", getColorByAspect(asp.aspect))
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.9);
    });
  }, [bodies, aspects]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "30px" }}>
      <svg ref={ref}></svg>

      {/* 📍 Пункты планет (pointsData) */}
      <div style={{ marginTop: "30px", maxWidth: 600 }}>
        <h3>Планеты:</h3>
        <ul>
          {pointsData?.map((point, idx) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      </div>

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
