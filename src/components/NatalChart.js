import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const NatalChart = ({ bodies, aspects, houses }) => {
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
  
    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f7f0fa")
      .style("border-radius", "12px")
      .style("box-shadow", "0 0 12px rgba(0,0,0,0.1)");
  
    svg.selectAll("*").remove();
  
    const g = svg.append("g").attr("transform", `translate(${center},${center})`);
  
    // === ФОН (ЗОДИАКАЛЬНЫЕ КРУГИ) ===
    const bg = g.append("g").attr("id", "background");
  
    bg.append("circle").attr("r", radiusZodiacOuter).attr("fill", "#4B0082");
    bg.append("circle").attr("r", radiusZodiacInner).attr("fill", "white");
  
    // === ДОМА ===
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
    
      const arc = d3.arc()
        .innerRadius(houseInner)
        .outerRadius(houseOuter)
        .startAngle(startAngle)
        .endAngle(endAngle);
    
      houseGroup.append("path")
        .attr("d", arc())
        .attr("fill", "#eeeeee");
    
      const extendedRadius = houseOuter + 60;
    
      const x1 = houseInner * Math.cos(startAngle);
      const y1 = houseInner * Math.sin(startAngle);
      const x2 = extendedRadius * Math.cos(startAngle); // удлинено
      const y2 = extendedRadius * Math.sin(startAngle);
    
      houseGroup.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1)
        .raise(); // повышаем приоритет
    
      const midDeg = startDeg + (endDeg - startDeg) / 2;
      const midAngle = (-(midDeg - 90)) * (Math.PI / 180);
      const xLabel = labelRadius * Math.cos(midAngle);
      const yLabel = labelRadius * Math.sin(midAngle);
    
      houseGroup.append("text")
        .attr("x", xLabel)
        .attr("y", yLabel)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "15px")
        .attr("fill", "#444")
        .attr("font-family", "Roboto, sans-serif")
        .text(current.symbol || i + 1);
    }
    
  
    // === ВЕРХНИЙ СЛОЙ ===
    const fg = g.append("g").attr("id", "foreground");
  
    // Знаки зодиака
    const zodiacSigns = ["РЫБЫ", "ВОДОЛЕЙ", "КОЗЕРОГ", "СТРЕЛЕЦ", "СКОРПИОН", "ВЕСЫ", "ДЕВА", "ЛЕВ", "РАК", "БЛИЗНЕЦЫ", "ТЕЛЕЦ", "ОВЕН"];

// Радиусы для текста и линий внутри фиолетового круга
const zodiacRadius = 252;        // для текста
const zodiacLineInnerRadius = 240; // Внутренний радиус
const zodiacLineOuterRadius = 268.33; // Внешний радиус

// Отображение знаков зодиака
zodiacSigns.forEach((sign, i) => {
  const angle = (i * 30 - 75) * (Math.PI / 180);
  const x = zodiacRadius * Math.cos(angle);
  const y = zodiacRadius * Math.sin(angle);
  const rotation = (angle * 180) / Math.PI + 90;

  fg.append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("transform", `rotate(${rotation}, ${x}, ${y})`)
    .attr("fill", "white")
    .attr("font-family", "Roboto, sans-serif")
    .attr("font-size", "14px")
    .text(sign);
});

// Линии между знаками — строго по радиусу фиолетового круга
for (let i = 0; i < 12; i++) {
  const angle = ((i * 30 + 15) - 75) * (Math.PI / 180); // между знаками

  const x1 = zodiacLineInnerRadius * Math.cos(angle);
  const y1 = zodiacLineInnerRadius * Math.sin(angle);
  const x2 = zodiacLineOuterRadius * Math.cos(angle);
  const y2 = zodiacLineOuterRadius * Math.sin(angle);

  fg.append("line")
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x2)
    .attr("y2", y2)
    .attr("stroke", "white")
    .attr("stroke-width", 4);
}


  
    // Планеты
    const redSymbols = ["☉", "☽", "☿", "♀", "♂", "♃", "♄", "♅", "♆", "♇"];
    Object.entries(bodies || {}).forEach(([key, body], i) => {
      const isAscDesc = key === "AS" || key === "DS";
      const isMcIc = key === "MC" || key === "IC";
      const isRed = redSymbols.includes(body.symbol);
      const color = isRed ? "#d22" : "black";
  
      let x, y;
  
      if (isAscDesc) {
        const angle = key === "AS" ? Math.PI : 0;
        const r = 275;
        x = r * Math.cos(angle);
        y = r * Math.sin(angle);
      } else {
        const degree = body.degree || 0;
        const angle = (degree - 90) * (Math.PI / 180);
        const r = isMcIc ? 225 : 200 + ((i % 3) * 8);
        x = r * Math.cos(angle);
        y = r * Math.sin(angle);
      }
  
      fg.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-size", "22px")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-family", "Roboto, sans-serif")
        .attr("fill", color)
        .text(body.symbol || key);
    });
  
    // Аспекты
    aspects?.forEach((asp) => {
      const from = Object.values(bodies).find(b => b.symbol === asp.from || b.name === asp.from);
      const to = Object.values(bodies).find(b => b.symbol === asp.to || b.name === asp.to);
      if (!from || !to) return;
  
      const r = 186;
      const [x1, y1] = [(r * Math.cos((from.degree - 90) * Math.PI / 180)), (r * Math.sin((from.degree - 90) * Math.PI / 180))];
      const [x2, y2] = [(r * Math.cos((to.degree - 90) * Math.PI / 180)), (r * Math.sin((to.degree - 90) * Math.PI / 180))];
  
      fg.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", asp.color || "#ccc")
        .attr("stroke-width", 2)
        .attr("opacity", 0.6);
    });
    if (houses?.length === 12) {
      const labelRadius = 160;
    
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
    
        const midDeg = startDeg + (endDeg - startDeg) / 2;
        const midAngle = (-(midDeg - 90)) * (Math.PI / 180);
        const xLabel = labelRadius * Math.cos(midAngle);
        const yLabel = labelRadius * Math.sin(midAngle);
    
        g.append("text")
          .attr("x", xLabel)
          .attr("y", yLabel)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "15px")
          .attr("fill", "#444")
          .attr("font-family", "Roboto, sans-serif")
          .text(current.symbol || i + 1);
    
        // === ЛИНИИ разделителей (поверх всего) ===
        const startAngle = (-(startDeg - 90)) * (Math.PI / 180);
        const x1 = houseInner * Math.cos(startAngle);
        const y1 = houseInner * Math.sin(startAngle);
        const x2 = houseOuter * Math.cos(startAngle);
        const y2 = houseOuter * Math.sin(startAngle);
    
        g.append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", "#aaa")
          .attr("stroke-width", 1)
          .raise(); // приоритет в DOM
      }
    }
    
  }, [bodies, aspects, houses]);
  
  

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 30 }}>
      <svg ref={ref}></svg>
    </div>
  );
};

export default NatalChart;
