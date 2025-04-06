import React, { useEffect, useState } from 'react';
import NatalChart from '../components/NatalChart';
import AskGptForm from '../components/AskGptForm'; // Подключаем компонент чата

const NatalChartResultPage = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const savedChart = localStorage.getItem("natalChart");
    if (savedChart) {
      const parsed = JSON.parse(savedChart);
      setChartData(parsed);
    }
  }, []);

  if (!chartData) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Загрузка натальной карты...</div>;
  }

  return (
    <div style={{ padding: "40px 0" }}>
      <NatalChart
        chartId={chartData.chart_id}
        bodies={chartData.bodies_for_circle}
        aspects={chartData.aspects_for_circle}
        pointsData={chartData.points_data}
        patterns={chartData.patterns_data}
        structuredAspects={chartData.aspects_structured}
        houses={chartData.houses}
      />

      {/* 🧠 Блок с GPT чатом */}
      <div style={{ marginTop: "60px", padding: "20px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
        <h2 style={{ textAlign: "center" }}>Спросить у GPT</h2>
        <AskGptForm chartId={chartData.chart_id} />
      </div>
    </div>
  );
};

export default NatalChartResultPage;


